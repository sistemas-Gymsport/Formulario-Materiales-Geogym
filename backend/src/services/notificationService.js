import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { getSettings, readCredential, recordResult } from './integrationService.js';
import { postToWebhook } from './n8nService.js';
import { getZonedParts, pad } from '../utils/time.js';
import { getTimezone } from './scheduleStore.js';

export const EVENT_REQUEST_CREATED = 'REQUEST_CREATED';
const BACKOFF_MINUTES = [1, 5, 15, 60, 180, 360, 720];
const MAX_ATTEMPTS = BACKOFF_MINUTES.length + 1;
const BATCH_SIZE = 10;
const STALE_LOCK_MS = 5 * 60 * 1000;

let running = null;
let rerun = false;

export const enqueueRequestCreated = async (tx, requestId) => {
  const settings = await tx.integrationSettings.findUnique({ where: { id: 1 }, select: { enabled: true } });
  return tx.notificationOutbox.create({
    data: { requestId, type: EVENT_REQUEST_CREATED, status: settings?.enabled ? 'PENDING' : 'HELD' }
  });
};

const formatDate = (date, timeZone) => {
  const p = getZonedParts(date, timeZone);
  return { date: `${pad(p.day)}/${pad(p.month)}/${p.year}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
};

export const buildMessage = ({ folio, requesterName, branchName, date, categories, customMaterials, totalMaterials }) => {
  const lines = ['*NUEVA SOLICITUD DE MATERIALES – GEO GYM*', '', `Folio: ${folio}`, `Solicitante: ${requesterName}`, `Sucursal: ${branchName}`, `Fecha: ${date}`, '', '*Materiales solicitados:*'];
  for (const category of categories) {
    lines.push('', `${category.name}:`, ...category.materials.map((m) => `- ${m}`));
  }
  if (customMaterials.length) lines.push('', 'Material adicional:', ...customMaterials.map((m) => `- ${m}`));
  lines.push('', `Total de materiales diferentes: ${totalMaterials}.`);
  return lines.join('\n');
};

export const buildRequestPayload = (event, request, settings, timeZone) => {
  const when = formatDate(request.createdAt, timeZone);
  const categories = [];
  for (const item of request.items.filter((i) => !i.isCustom)) {
    let group = categories.find((c) => c.name === item.categoryNameSnapshot);
    if (!group) categories.push((group = { name: item.categoryNameSnapshot, materials: [] }));
    group.materials.push(item.materialNameSnapshot);
  }
  const data = {
    folio: request.folio,
    requesterName: request.requesterName,
    branchName: request.branchNameSnapshot,
    date: when.date,
    time: when.time,
    createdAt: request.createdAt.toISOString(),
    categories,
    customMaterials: request.items.filter((i) => i.isCustom).map((i) => i.materialNameSnapshot),
    totalMaterials: request.itemCount
  };
  return {
    eventId: event.id,
    type: event.type,
    attempt: event.attempts + 1,
    destinationPhone: settings.destinationPhone,
    request: data,
    message: buildMessage(data)
  };
};

const claimBatch = async () => {
  await prisma.notificationOutbox.updateMany({
    where: { status: 'PROCESSING', lockedAt: { lt: new Date(Date.now() - STALE_LOCK_MS) } },
    data: { status: 'PENDING', lockedAt: null }
  });
  return prisma.$queryRaw`
    UPDATE "NotificationOutbox" SET "status" = 'PROCESSING', "lockedAt" = (NOW() AT TIME ZONE 'UTC')
    WHERE "id" IN (
      SELECT "id" FROM "NotificationOutbox"
      WHERE "status" = 'PENDING' AND "nextAttemptAt" <= (NOW() AT TIME ZONE 'UTC')
      ORDER BY "createdAt" ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING "id"`;
};

const deliver = async (eventId, settings, secret, timeZone) => {
  const event = await prisma.notificationOutbox.findUnique({
    where: { id: eventId },
    include: { request: { include: { items: { orderBy: [{ isCustom: 'asc' }, { sortOrder: 'asc' }] } } } }
  });
  if (!event) return null;
  const payload = buildRequestPayload(event, event.request, settings, timeZone);
  const result = await postToWebhook({ url: settings.webhookUrl, secret, authMode: settings.authMode, eventId: event.id, eventType: event.type, payload });
  const attempts = event.attempts + 1;
  const data = result.ok
    ? { status: 'SENT', attempts, deliveredAt: new Date(), lockedAt: null, lastError: null, responseStatus: result.status }
    : {
        status: attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
        attempts,
        lockedAt: null,
        lastError: result.message,
        responseStatus: result.status,
        nextAttemptAt: new Date(Date.now() + BACKOFF_MINUTES[Math.min(attempts - 1, BACKOFF_MINUTES.length - 1)] * 60000)
      };
  await prisma.notificationOutbox.update({ where: { id: event.id }, data });
  await recordResult('delivery', { ok: result.ok, message: `${event.request.folio}: ${result.message}` });
  return result;
};

const releaseClaimed = (ids) =>
  prisma.notificationOutbox.updateMany({ where: { id: { in: ids }, status: 'PROCESSING' }, data: { status: 'PENDING', lockedAt: null } });

export const processOutbox = () => {
  if (running) {
    rerun = true;
    return running;
  }
  running = runOutbox().finally(() => {
    running = null;
  });
  return running;
};

const runOutbox = async () => {
  let processed = 0;
  try {
    do {
      rerun = false;
      const settings = await getSettings();
      if (!settings.enabled || !settings.webhookUrl || !settings.encryptedCredential) break;
      const secret = readCredential(settings);
      const timezone = await getTimezone();
      const claimed = (await claimBatch()).map((r) => r.id);
      for (const [index, id] of claimed.entries()) {
        const current = await getSettings();
        if (!current.enabled) {
          await releaseClaimed(claimed.slice(index));
          break;
        }
        await deliver(id, current, secret, timezone);
        processed += 1;
      }
      if (claimed.length === BATCH_SIZE) rerun = true;
    } while (rerun);
  } catch (error) {
    logger.error({ err: { message: error.message } }, 'Error procesando notificaciones');
  }
  return { processed };
};

export const triggerDelivery = () => {
  if (env.isTest) return;
  setImmediate(() => {
    processOutbox().catch(() => {});
  });
};

export const sendTestEvent = async () => {
  const settings = await getSettings();
  if (!settings.webhookUrl || !settings.encryptedCredential) {
    return { ok: false, status: null, message: 'Configura la URL del webhook y el secreto antes de probar' };
  }
  const eventId = crypto.randomUUID();
  const result = await postToWebhook({
    url: settings.webhookUrl,
    secret: readCredential(settings),
    authMode: settings.authMode,
    eventId,
    eventType: 'CONNECTION_TEST',
    payload: { eventId, type: 'CONNECTION_TEST', destinationPhone: settings.destinationPhone, sentAt: new Date().toISOString(), message: 'Prueba de conexión desde el sistema de solicitudes de GEO GYM' }
  });
  await recordResult('test', result);
  return result;
};

export const retryFailed = async () => {
  const { count } = await prisma.notificationOutbox.updateMany({ where: { status: 'FAILED' }, data: { status: 'PENDING', attempts: 0, nextAttemptAt: new Date(), lastError: null } });
  triggerDelivery();
  return count;
};

export const recordProviderStatus = async ({ eventId, status, detail }) => {
  const result = await prisma.notificationOutbox.updateMany({
    where: { id: eventId, status: 'SENT' },
    data: { providerStatus: status, providerConfirmedAt: new Date(), ...(status === 'failed' ? { lastError: detail?.slice(0, 300) ?? 'Entrega fallida' } : {}) }
  });
  return result.count > 0;
};
