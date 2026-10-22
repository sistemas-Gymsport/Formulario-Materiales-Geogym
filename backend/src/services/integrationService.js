import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { decrypt, encrypt, randomToken } from '../utils/crypto.js';
import { badRequest, unprocessable } from '../utils/httpError.js';

export const getSettings = (client = prisma) => client.integrationSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

export const readCredential = (settings) => (settings.encryptedCredential ? decrypt(settings.encryptedCredential) : null);

const credentialFields = (secret) => ({ encryptedCredential: encrypt(secret), credentialHint: secret.slice(-4) });

const connectionStatus = (s) => {
  if (!s.enabled) return 'disabled';
  if (s.lastDeliveryOk === false || s.lastTestOk === false) return 'error';
  if (s.lastDeliveryOk || s.lastTestOk) return 'connected';
  return 'unverified';
};

export const describeSettings = async () => {
  const settings = await getSettings();
  const counts = await prisma.notificationOutbox.groupBy({ by: ['status'], _count: { _all: true } });
  return {
    enabled: settings.enabled,
    webhookUrl: settings.webhookUrl,
    destinationPhone: settings.destinationPhone,
    authMode: settings.authMode,
    heldPolicy: settings.heldPolicy,
    hasCredential: Boolean(settings.encryptedCredential),
    credentialHint: settings.credentialHint ? `••••${settings.credentialHint}` : null,
    connectionStatus: connectionStatus(settings),
    lastTestAt: settings.lastTestAt,
    lastTestOk: settings.lastTestOk,
    lastTestMessage: settings.lastTestMessage,
    lastDeliveryAt: settings.lastDeliveryAt,
    lastDeliveryOk: settings.lastDeliveryOk,
    lastDeliveryMessage: settings.lastDeliveryMessage,
    outbox: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
    callbackPath: '/api/integrations/n8n/delivery'
  };
};

export const assertWebhookUrl = (url) => {
  if (!url) return;
  const parsed = new URL(url);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && (loopback || env.ALLOW_INSECURE_WEBHOOKS))) {
    throw unprocessable('El webhook debe utilizar HTTPS', undefined, 'WEBHOOK_INSECURE');
  }
  if (parsed.username || parsed.password) throw unprocessable('La URL no debe incluir credenciales', undefined, 'WEBHOOK_CREDENTIALS');
};

export const updateSettings = async (input) => {
  assertWebhookUrl(input.webhookUrl);
  return prisma.$transaction(async (tx) => {
    const current = await getSettings(tx);
    const hasCredential = Boolean(input.credential || current.encryptedCredential);
    if (input.enabled && (!input.webhookUrl || !input.destinationPhone || !hasCredential)) {
      throw badRequest('Para activar la integración se requieren URL del webhook, número destinatario y secreto');
    }
    const enabling = input.enabled && !current.enabled;
    const data = {
      enabled: input.enabled,
      webhookUrl: input.webhookUrl,
      destinationPhone: input.destinationPhone,
      authMode: input.authMode,
      heldPolicy: input.heldPolicy,
      ...(input.credential ? credentialFields(input.credential) : {}),
      ...(enabling ? { enabledAt: new Date() } : {})
    };
    if (input.webhookUrl !== current.webhookUrl || input.credential) {
      Object.assign(data, { lastTestAt: null, lastTestOk: null, lastTestMessage: null });
    }
    await tx.integrationSettings.update({ where: { id: 1 }, data });
    if (enabling) {
      await tx.notificationOutbox.updateMany({
        where: { status: 'HELD' },
        data: input.heldPolicy === 'send' ? { status: 'PENDING', nextAttemptAt: new Date() } : { status: 'IGNORED' }
      });
    }
    return enabling;
  });
};

export const rotateCredential = async () => {
  const secret = randomToken(32);
  await prisma.integrationSettings.update({
    where: { id: 1 },
    data: { ...credentialFields(secret), lastTestAt: null, lastTestOk: null, lastTestMessage: null }
  });
  return secret;
};

export const recordResult = (kind, result) =>
  prisma.integrationSettings.update({
    where: { id: 1 },
    data:
      kind === 'test'
        ? { lastTestAt: new Date(), lastTestOk: result.ok, lastTestMessage: result.message }
        : { lastDeliveryAt: new Date(), lastDeliveryOk: result.ok, lastDeliveryMessage: result.message }
  });
