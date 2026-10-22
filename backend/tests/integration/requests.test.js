import { randomUUID } from 'node:crypto';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/config/prisma.js';
import { api, closeForm, firstBranch, materialIdsByName, resetDatabase } from '../helpers.js';

const submit = (body, key = randomUUID()) => api().post('/api/public/requests').set('Idempotency-Key', key).send(body);

const validBody = async (overrides = {}) => {
  const branch = await firstBranch();
  const materialIds = await materialIdsByName('Hojas blancas', 'Papel higiénico', 'Cloro');
  return { requesterName: 'María Fernanda López', branchId: branch.id, materialIds, customMaterials: ['Cinta canela'], ...overrides };
};

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('formulario público', () => {
  it('entrega catálogo, sucursales y disponibilidad desde la base de datos', async () => {
    const res = await api().get('/api/public/config');
    expect(res.status).toBe(200);
    expect(res.body.availability.isOpen).toBe(true);
    expect(res.body.branches.map((b) => b.name)).toContain('Satélite');
    expect(res.body.categories).toHaveLength(6);
    expect(res.body.categories[0].materials.length).toBe(24);
  });

  it('registra una solicitud con folio, snapshots y evento de notificación', async () => {
    const res = await submit(await validBody());
    expect(res.status).toBe(201);
    expect(res.body.request.folio).toMatch(/^SOL-\d{8}-0001$/);
    expect(res.body.request.itemCount).toBe(4);
    expect(res.body.request.customMaterials).toEqual(['Cinta canela']);
    const stored = await prisma.request.findUnique({ where: { folio: res.body.request.folio }, include: { items: true, notifications: true } });
    expect(stored.items).toHaveLength(4);
    expect(stored.items.filter((i) => i.isCustom)).toHaveLength(1);
    expect(stored.notifications[0].status).toBe('HELD');
  });

  it('genera folios consecutivos y únicos', async () => {
    const a = await submit(await validBody());
    const b = await submit(await validBody({ requesterName: 'Juan Pérez Gómez' }));
    expect(a.body.request.folio).not.toBe(b.body.request.folio);
    expect(b.body.request.folio.endsWith('0002')).toBe(true);
  });

  it('dos envíos simultáneos con la misma clave crean un solo registro', async () => {
    const body = await validBody();
    const key = randomUUID();
    const results = await Promise.all([submit(body, key), submit(body, key), submit(body, key)]);
    expect(results.every((r) => [200, 201].includes(r.status))).toBe(true);
    expect(new Set(results.map((r) => r.body.request.folio)).size).toBe(1);
    expect(await prisma.request.count()).toBe(1);
  });

  it('rechaza reutilizar la clave de idempotencia con otro contenido', async () => {
    const key = randomUUID();
    await submit(await validBody(), key);
    const res = await submit(await validBody({ requesterName: 'Otra Persona Distinta' }), key);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('IDEMPOTENCY_MISMATCH');
  });

  it('no permite solicitudes cuando el formulario está cerrado aunque se use la API directamente', async () => {
    await closeForm();
    const res = await submit(await validBody());
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORM_CLOSED');
    expect(await prisma.request.count()).toBe(0);
  });

  it('rechaza solicitudes sin materiales, sin nombre completo o sin clave', async () => {
    expect((await submit(await validBody({ materialIds: [], customMaterials: [] }))).status).toBe(400);
    expect((await submit(await validBody({ requesterName: 'Ana' }))).status).toBe(400);
    expect((await api().post('/api/public/requests').send(await validBody())).status).toBe(400);
  });

  it('rechaza materiales duplicados o campos de cantidad', async () => {
    const body = await validBody();
    expect((await submit({ ...body, materialIds: [body.materialIds[0], body.materialIds[0]] })).status).toBe(400);
    expect((await submit({ ...body, quantity: 3 })).status).toBe(400);
  });

  it('rechaza materiales desactivados', async () => {
    const body = await validBody();
    await prisma.material.update({ where: { id: body.materialIds[0] }, data: { isActive: false } });
    const res = await submit(body);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('MATERIALS_UNAVAILABLE');
  });

  it('rechaza materiales adicionales repetidos o que ya existen en el catálogo', async () => {
    const dup = await submit(await validBody({ customMaterials: ['Cinta canela', 'cinta  CANELA'] }));
    expect(dup.body.error.code).toBe('CUSTOM_DUPLICATE');
    const existing = await submit(await validBody({ customMaterials: ['papel higienico'] }));
    expect(existing.body.error.code).toBe('CUSTOM_MATCHES_CATALOG');
  });

  it('rechaza envíos de bots que llenan el campo trampa', async () => {
    expect((await submit({ ...(await validBody()), website: 'spam' })).status).toBe(400);
  });

  it('conserva el nombre histórico aunque el material se renombre o desactive', async () => {
    const res = await submit(await validBody());
    const [id] = await materialIdsByName('Hojas blancas');
    await prisma.material.update({ where: { id }, data: { name: 'Hojas tamaño carta', normalizedName: 'hojas tamano carta', isActive: false } });
    const item = await prisma.requestItem.findFirst({ where: { materialId: id, request: { folio: res.body.request.folio } } });
    expect(item.materialNameSnapshot).toBe('Hojas blancas');
  });
});
