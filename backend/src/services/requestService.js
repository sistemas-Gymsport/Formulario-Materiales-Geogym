import { prisma } from '../config/prisma.js';
import { HttpError, conflict, notFound, unprocessable } from '../utils/httpError.js';
import { normalizeKey, toTitleSentence } from '../utils/normalize.js';
import { sha256 } from '../utils/crypto.js';
import { getZonedParts, pad } from '../utils/time.js';
import { getAvailability } from './availabilityService.js';
import { enqueueRequestCreated, triggerDelivery } from './notificationService.js';

export const CUSTOM_CATEGORY = 'Materiales adicionales';

const requestInclude = {
  items: { orderBy: [{ isCustom: 'asc' }, { sortOrder: 'asc' }] },
  notifications: { select: { status: true, attempts: true, deliveredAt: true, providerStatus: true, lastError: true } }
};

export const serializeRequest = (request) => {
  const groups = new Map();
  for (const item of request.items.filter((i) => !i.isCustom)) {
    if (!groups.has(item.categoryNameSnapshot)) groups.set(item.categoryNameSnapshot, []);
    groups.get(item.categoryNameSnapshot).push(item.materialNameSnapshot);
  }
  return {
    id: request.id,
    folio: request.folio,
    requesterName: request.requesterName,
    branchId: request.branchId,
    branchName: request.branchNameSnapshot,
    createdAt: request.createdAt,
    itemCount: request.itemCount,
    categories: [...groups].map(([name, materials]) => ({ name, materials })),
    customMaterials: request.items.filter((i) => i.isCustom).map((i) => i.materialNameSnapshot),
    notification: request.notifications?.[0] ?? null
  };
};

const payloadHashOf = ({ requesterName, branchId, materialIds, customMaterials }) =>
  sha256(
    JSON.stringify([
      normalizeKey(requesterName),
      branchId,
      [...materialIds].sort((a, b) => a - b),
      customMaterials.map(normalizeKey).sort()
    ])
  );

const replay = async (idempotencyKey, payloadHash) => {
  const existing = await prisma.request.findUnique({ where: { idempotencyKey }, include: requestInclude });
  if (!existing) return null;
  if (existing.payloadHash !== payloadHash) {
    throw conflict('La clave de idempotencia ya se utilizó con otra solicitud', undefined, 'IDEMPOTENCY_MISMATCH');
  }
  return { request: serializeRequest(existing), replayed: true };
};

const resolveCatalogItems = async (materialIds) => {
  if (!materialIds.length) return [];
  const materials = await prisma.material.findMany({
    where: { id: { in: materialIds }, isActive: true, category: { isActive: true } },
    include: { category: { select: { id: true, name: true, sortOrder: true } } }
  });
  if (materials.length !== materialIds.length) {
    const found = new Set(materials.map((m) => m.id));
    throw conflict(
      'Algunos materiales ya no están disponibles. Actualiza el catálogo e inténtalo de nuevo.',
      { unavailableIds: materialIds.filter((id) => !found.has(id)) },
      'MATERIALS_UNAVAILABLE'
    );
  }
  return materials
    .sort((a, b) => a.category.sortOrder - b.category.sortOrder || a.sortOrder - b.sortOrder)
    .map((m) => ({
      materialId: m.id,
      categoryId: m.category.id,
      materialNameSnapshot: m.name,
      normalizedName: m.normalizedName,
      categoryNameSnapshot: m.category.name,
      isCustom: false
    }));
};

const resolveCustomItems = async (customMaterials) => {
  const entries = customMaterials.map((name) => ({ name: toTitleSentence(name), key: normalizeKey(name) }));
  const keys = entries.map((e) => e.key);
  if (keys.some((k) => !k)) throw unprocessable('Un material adicional no tiene un nombre válido', undefined, 'CUSTOM_INVALID');
  if (new Set(keys).size !== keys.length) throw unprocessable('Hay materiales adicionales repetidos', undefined, 'CUSTOM_DUPLICATE');
  if (!keys.length) return [];
  const matches = await prisma.material.findMany({ where: { normalizedName: { in: keys }, isActive: true }, select: { name: true } });
  if (matches.length) {
    throw unprocessable(
      'Algunos materiales adicionales ya existen en el catálogo. Selecciónalos desde su categoría.',
      { names: matches.map((m) => m.name) },
      'CUSTOM_MATCHES_CATALOG'
    );
  }
  return entries.map((e) => ({
    materialId: null,
    categoryId: null,
    materialNameSnapshot: e.name,
    normalizedName: e.key,
    categoryNameSnapshot: CUSTOM_CATEGORY,
    isCustom: true
  }));
};

const nextFolio = async (tx, now, timeZone) => {
  const p = getZonedParts(now, timeZone);
  const day = `${p.year}${pad(p.month)}${pad(p.day)}`;
  const [row] = await tx.$queryRaw`
    INSERT INTO "FolioCounter" ("day", "value") VALUES (${day}, 1)
    ON CONFLICT ("day") DO UPDATE SET "value" = "FolioCounter"."value" + 1
    RETURNING "value"`;
  return `SOL-${day}-${pad(Number(row.value), 4)}`;
};

export const createRequest = async ({ input, idempotencyKey, now = new Date() }) => {
  const payloadHash = payloadHashOf(input);
  const previous = await replay(idempotencyKey, payloadHash);
  if (previous) return previous;

  const availability = await getAvailability(now);
  if (!availability.isOpen) {
    throw new HttpError(403, 'FORM_CLOSED', availability.messages.closed.title, { availability });
  }

  const branch = await prisma.branch.findFirst({ where: { id: input.branchId, isActive: true } });
  if (!branch) throw unprocessable('La sucursal seleccionada no está disponible', undefined, 'BRANCH_UNAVAILABLE');

  const catalogItems = await resolveCatalogItems(input.materialIds);
  const customItems = await resolveCustomItems(input.customMaterials);
  const catalogKeys = new Set(catalogItems.map((i) => i.normalizedName));
  if (customItems.some((i) => catalogKeys.has(i.normalizedName))) {
    throw unprocessable('Un material adicional coincide con uno seleccionado', undefined, 'CUSTOM_DUPLICATE');
  }
  const items = [...catalogItems, ...customItems].map((item, index) => ({ ...item, sortOrder: index + 1 }));

  try {
    const created = await prisma.$transaction(async (tx) => {
      const folio = await nextFolio(tx, now, availability.timezone);
      const request = await tx.request.create({
        data: {
          folio,
          requesterName: input.requesterName,
          requesterNormalized: normalizeKey(input.requesterName),
          branchId: branch.id,
          branchNameSnapshot: branch.name,
          idempotencyKey,
          payloadHash,
          itemCount: items.length,
          createdAt: now,
          items: { create: items }
        }
      });
      await enqueueRequestCreated(tx, request.id);
      return tx.request.findUnique({ where: { id: request.id }, include: requestInclude });
    });
    triggerDelivery();
    return { request: serializeRequest(created), replayed: false };
  } catch (error) {
    if (error?.code === 'P2002' && String(error.meta?.target ?? '').includes('idempotencyKey')) {
      const again = await replay(idempotencyKey, payloadHash);
      if (again) return again;
    }
    throw error;
  }
};

export const getRequestById = async (id) => {
  const request = await prisma.request.findUnique({ where: { id }, include: requestInclude });
  if (!request) throw notFound('Solicitud no encontrada');
  return serializeRequest(request);
};

export const getReceiptRequest = async ({ folio, key }) => {
  const request = await prisma.request.findFirst({ where: { folio, idempotencyKey: key }, include: requestInclude });
  if (!request) throw notFound('No se encontró la solicitud para generar el reporte');
  return serializeRequest(request);
};
