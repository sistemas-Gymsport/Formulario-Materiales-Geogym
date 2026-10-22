import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../../src/config/prisma.js';
import { createRequest } from '../../src/services/requestService.js';
import { processOutbox } from '../../src/services/notificationService.js';
import { updateSettings } from '../../src/services/integrationService.js';
import { hmacSha256 } from '../../src/utils/crypto.js';
import { api, firstBranch, materialIdsByName, resetDatabase } from '../helpers.js';

const SECRET = 'secreto-de-pruebas-n8n-0123456789';
let server;
let received;
let respondWith;

const startWebhook = () =>
  new Promise((resolve) => {
    received = [];
    respondWith = 200;
    server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        received.push({ headers: req.headers, body });
        res.writeHead(respondWith, { 'Content-Type': 'application/json' }).end('{"ok":true}');
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${server.address().port}/webhook/geogym`));
  });

const newRequest = async () => {
  const branch = await firstBranch();
  const materialIds = await materialIdsByName('Papel higiénico', 'Cloro');
  return createRequest({ input: { requesterName: 'Carla Méndez Ruiz', branchId: branch.id, materialIds, customMaterials: ['Cinta canela'] }, idempotencyKey: randomUUID() });
};

const enable = (url, heldPolicy = 'ignore') =>
  updateSettings({ enabled: true, webhookUrl: url, destinationPhone: '+5215512345678', credential: SECRET, heldPolicy, authMode: 'hmac' });

beforeEach(resetDatabase);
afterEach(() => server?.close());
afterAll(() => prisma.$disconnect());

describe('notificaciones n8n', () => {
  it('con la integración desactivada registra la solicitud sin peticiones externas', async () => {
    const url = await startWebhook();
    const { request } = await newRequest();
    await processOutbox();
    expect(received).toHaveLength(0);
    const event = await prisma.notificationOutbox.findFirst({ where: { requestId: request.id } });
    expect(event.status).toBe('HELD');
    expect(url).toContain('http');
  });

  it('envía el evento firmado con HMAC cuando está habilitada', async () => {
    const url = await startWebhook();
    await enable(url);
    const { request } = await newRequest();
    await processOutbox();
    expect(received).toHaveLength(1);
    const { headers, body } = received[0];
    const expected = hmacSha256(SECRET, `${headers['x-geogym-timestamp']}.${body}`);
    expect(headers['x-geogym-signature']).toBe(`sha256=${expected}`);
    expect(headers.authorization).toBeUndefined();
    const payload = JSON.parse(body);
    expect(payload.request.folio).toBe(request.folio);
    expect(payload.destinationPhone).toBe('+5215512345678');
    expect(payload.message).toContain('NUEVA SOLICITUD DE MATERIALES');
    const event = await prisma.notificationOutbox.findFirst({ where: { requestId: request.id } });
    expect(event.status).toBe('SENT');
    expect(event.providerStatus).toBeNull();
  });

  it('si n8n falla la solicitud permanece guardada y se programa un reintento', async () => {
    const url = await startWebhook();
    respondWith = 500;
    await enable(url);
    const { request } = await newRequest();
    await processOutbox();
    expect(await prisma.request.count({ where: { id: request.id } })).toBe(1);
    const event = await prisma.notificationOutbox.findFirst({ where: { requestId: request.id } });
    expect(event.status).toBe('PENDING');
    expect(event.attempts).toBe(1);
    expect(event.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
    await processOutbox();
    expect(received).toHaveLength(1);
  });

  it('si n8n no está disponible la solicitud se registra igualmente', async () => {
    await enable('http://127.0.0.1:9/webhook');
    const res = await newRequest();
    await processOutbox();
    expect(res.request.folio).toBeTruthy();
    expect((await prisma.notificationOutbox.findFirst()).lastError).toMatch(/red|Tiempo/);
  });

  it('ignora o envía los eventos retenidos según la política elegida', async () => {
    const url = await startWebhook();
    await newRequest();
    await enable(url, 'ignore');
    await processOutbox();
    expect(received).toHaveLength(0);
    expect((await prisma.notificationOutbox.findFirst()).status).toBe('IGNORED');
    await resetDatabase();
    await newRequest();
    await enable(url, 'send');
    await processOutbox();
    expect(received).toHaveLength(1);
  });

  it('acepta confirmaciones de entrega firmadas y rechaza las no firmadas', async () => {
    const url = await startWebhook();
    await enable(url);
    await newRequest();
    await processOutbox();
    const event = await prisma.notificationOutbox.findFirst();
    const body = JSON.stringify({ eventId: event.id, status: 'delivered' });
    expect((await api().post('/api/integrations/n8n/delivery').set('Content-Type', 'application/json').send(body)).status).toBe(401);
    const ts = Math.floor(Date.now() / 1000);
    const res = await api()
      .post('/api/integrations/n8n/delivery')
      .set('Content-Type', 'application/json')
      .set('X-GeoGym-Timestamp', String(ts))
      .set('X-GeoGym-Signature', `sha256=${hmacSha256(SECRET, `${ts}.${body}`)}`)
      .send(body);
    expect(res.body.updated).toBe(true);
    expect((await prisma.notificationOutbox.findFirst()).providerStatus).toBe('delivered');
  });
});
