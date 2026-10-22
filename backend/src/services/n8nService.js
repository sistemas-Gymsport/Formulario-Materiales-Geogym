import { hmacSha256 } from '../utils/crypto.js';

const TIMEOUT_MS = 10000;

export const signHeaders = ({ secret, authMode, rawBody, eventId, eventType, timestamp = Math.floor(Date.now() / 1000) }) => {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'GeoGym-Materiales/1.0',
    'X-GeoGym-Event': eventType,
    'X-GeoGym-Event-Id': eventId,
    'X-GeoGym-Timestamp': String(timestamp),
    'X-GeoGym-Signature': `sha256=${hmacSha256(secret, `${timestamp}.${rawBody}`)}`
  };
  if (authMode === 'header') headers.Authorization = `Bearer ${secret}`;
  return headers;
};

export const postToWebhook = async ({ url, secret, authMode, eventId, eventType, payload }) => {
  const rawBody = JSON.stringify(payload);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: signHeaders({ secret, authMode, rawBody, eventId, eventType }),
      body: rawBody,
      redirect: 'error',
      signal: controller.signal
    });
    const text = (await response.text().catch(() => '')).slice(0, 200);
    return { ok: response.ok, status: response.status, message: response.ok ? 'Webhook aceptado' : `HTTP ${response.status} ${text}`.trim() };
  } catch (error) {
    const message = error.name === 'AbortError' ? 'Tiempo de espera agotado' : `Error de red: ${error.cause?.code ?? error.message}`;
    return { ok: false, status: null, message: message.slice(0, 300) };
  } finally {
    clearTimeout(timer);
  }
};
