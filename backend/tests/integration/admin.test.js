import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/config/prisma.js';
import { SCHEDULE_TEXTS } from '../../src/config/scheduleDefaults.js';
import { ADMIN, api, createTestAdmin, loginAgent, resetDatabase } from '../helpers.js';

beforeEach(async () => {
  await resetDatabase();
  await createTestAdmin();
});
afterAll(() => prisma.$disconnect());

describe('autenticación administrativa', () => {
  it('protege todas las rutas administrativas', async () => {
    for (const path of ['/api/admin/dashboard', '/api/admin/requests', '/api/admin/materials', '/api/admin/reports/monthly?year=2026&month=10', '/api/admin/integrations']) {
      expect((await api().get(path)).status).toBe(401);
    }
  });

  it('inicia sesión con cookie HttpOnly y SameSite estricta', async () => {
    const res = await api().post('/api/admin/auth/login').send(ADMIN);
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);
    expect(res.body.admin.username).toBe(ADMIN.username);
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('rechaza credenciales incorrectas y bloquea tras intentos excesivos', async () => {
    for (let i = 0; i < 4; i += 1) {
      expect((await api().post('/api/admin/auth/login').send({ ...ADMIN, password: 'incorrecta' })).status).toBe(401);
    }
    expect((await api().post('/api/admin/auth/login').send({ ...ADMIN, password: 'incorrecta' })).status).toBe(423);
    expect((await api().post('/api/admin/auth/login').send(ADMIN)).status).toBe(423);
  });

  it('exige token CSRF en operaciones que modifican datos', async () => {
    const { agent, csrf } = await loginAgent();
    const body = { name: 'Lima', isActive: true };
    expect((await agent.post('/api/admin/branches').send(body)).status).toBe(403);
    expect((await agent.post('/api/admin/branches').set('X-CSRF-Token', csrf).send(body)).status).toBe(201);
  });

  it('cierra sesión e invalida la cookie', async () => {
    const { agent, csrf } = await loginAgent();
    expect((await agent.post('/api/admin/auth/logout').set('X-CSRF-Token', csrf)).status).toBe(204);
    expect((await agent.get('/api/admin/auth/me')).status).toBe(401);
  });

  it('cambia la contraseña validando la actual y la política', async () => {
    const { agent, csrf } = await loginAgent();
    const weak = await agent.post('/api/admin/auth/password').set('X-CSRF-Token', csrf).send({ currentPassword: ADMIN.password, newPassword: 'debil' });
    expect(weak.status).toBe(400);
    const ok = await agent.post('/api/admin/auth/password').set('X-CSRF-Token', csrf).send({ currentPassword: ADMIN.password, newPassword: 'NuevaClave#2026x' });
    expect(ok.status).toBe(204);
    expect((await api().post('/api/admin/auth/login').send({ username: ADMIN.username, password: 'NuevaClave#2026x' })).status).toBe(200);
  });

  it('impide desactivar la propia cuenta', async () => {
    const { agent, csrf } = await loginAgent();
    const me = await prisma.admin.findUnique({ where: { username: ADMIN.username } });
    expect((await agent.patch(`/api/admin/admins/${me.id}`).set('X-CSRF-Token', csrf).send({ isActive: false })).status).toBe(403);
  });
});

describe('administración de catálogo, sucursales y horarios', () => {
  it('crea, renombra, desactiva y reactiva materiales', async () => {
    const { agent, csrf } = await loginAgent();
    const category = await prisma.category.findFirst();
    const created = await agent.post('/api/admin/materials').set('X-CSRF-Token', csrf).send({ name: 'Cinta canela', categoryId: category.id });
    expect(created.status).toBe(201);
    const dup = await agent.post('/api/admin/materials').set('X-CSRF-Token', csrf).send({ name: 'CINTA  canela', categoryId: category.id });
    expect(dup.status).toBe(409);
    const renamed = await agent.patch(`/api/admin/materials/${created.body.id}`).set('X-CSRF-Token', csrf).send({ name: 'Cinta canela ancha', isActive: false });
    expect(renamed.body).toMatchObject({ name: 'Cinta canela ancha', isActive: false });
    const publicCatalog = await api().get('/api/public/materials');
    expect(publicCatalog.body.some((m) => m.id === created.body.id)).toBe(false);
    await agent.patch(`/api/admin/materials/${created.body.id}`).set('X-CSRF-Token', csrf).send({ isActive: true });
    expect((await api().get('/api/public/materials')).body.some((m) => m.id === created.body.id)).toBe(true);
  });

  it('reordena materiales dentro de su categoría', async () => {
    const { agent, csrf } = await loginAgent();
    const [first, second] = await prisma.material.findMany({ where: { category: { sortOrder: 1 } }, orderBy: { sortOrder: 'asc' }, take: 2 });
    await agent.post(`/api/admin/materials/${second.id}/move`).set('X-CSRF-Token', csrf).send({ direction: 'up' });
    const reordered = await prisma.material.findMany({ where: { id: { in: [first.id, second.id] } }, orderBy: { sortOrder: 'asc' } });
    expect(reordered[0].id).toBe(second.id);
  });

  it('desactiva sucursales y las oculta del formulario', async () => {
    const { agent, csrf } = await loginAgent();
    const branch = await prisma.branch.findFirst({ where: { name: 'Lomas' } });
    await agent.patch(`/api/admin/branches/${branch.id}`).set('X-CSRF-Token', csrf).send({ isActive: false });
    const res = await api().get('/api/public/branches');
    expect(res.body.map((b) => b.name)).not.toContain('Lomas');
  });

  it('modifica horarios y fechas extraordinarias con validación', async () => {
    const { agent, csrf } = await loginAgent();
    const bad = await agent.put('/api/admin/schedule').set('X-CSRF-Token', csrf).send({
      enabled: true, timezone: 'America/Mexico_City', openingTime: '18:00', closingTime: '08:00', allowedWeekdays: [1], ...SCHEDULE_TEXTS
    });
    expect(bad.status).toBe(400);
    const ok = await agent.put('/api/admin/schedule').set('X-CSRF-Token', csrf).send({
      enabled: true, timezone: 'America/Mexico_City', openingTime: '09:00', closingTime: '14:00', allowedWeekdays: [1, 3, 5], ...SCHEDULE_TEXTS
    });
    expect(ok.status).toBe(200);
    expect(ok.body.schedule.allowedWeekdays).toEqual([1, 3, 5]);
    expect(ok.body.schedule.noticeIntro).toContain('\n');
    expect(ok.body.availability.messages.notice.button).toBe('Entendido, continuar');
    const ex = await agent.post('/api/admin/schedule/exceptions').set('X-CSRF-Token', csrf).send({ date: '2026-12-25', allowed: false, note: 'Navidad' });
    expect(ex.status).toBe(201);
    expect(ex.body.date).toBe('2026-12-25');
  });

  it('valida el número de WhatsApp en formato internacional', async () => {
    const { agent, csrf } = await loginAgent();
    const body = { enabled: false, webhookUrl: 'https://n8n.example.com/webhook/x', destinationPhone: '5512345678', heldPolicy: 'ignore' };
    expect((await agent.put('/api/admin/integrations').set('X-CSRF-Token', csrf).send(body)).status).toBe(400);
    const ok = await agent.put('/api/admin/integrations').set('X-CSRF-Token', csrf).send({ ...body, destinationPhone: '+52 1 55 1234 5678', credential: 'x'.repeat(32) });
    expect(ok.status).toBe(200);
    expect(ok.body.destinationPhone).toBe('+5215512345678');
    expect(JSON.stringify(ok.body)).not.toContain('x'.repeat(32));
    expect(ok.body.credentialHint).toBe('••••xxxx');
  });
});
