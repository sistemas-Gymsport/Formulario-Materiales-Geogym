import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { callbackLimiter } from '../middleware/rateLimits.js';
import { deliveryCallbackBody } from '../validators/adminValidators.js';
import { getSettings, readCredential } from '../services/integrationService.js';
import { recordProviderStatus } from '../services/notificationService.js';
import { hmacSha256, safeEqual } from '../utils/crypto.js';
import { unauthorized } from '../utils/httpError.js';

const router = Router();
const MAX_SKEW_SECONDS = 300;

const verifySignature = async (req, res, next) => {
  const settings = await getSettings();
  if (!settings.encryptedCredential) throw unauthorized('Integración sin credencial');
  const secret = readCredential(settings);
  const bearer = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const timestamp = Number(req.get('x-geogym-timestamp'));
  const signature = req.get('x-geogym-signature')?.replace(/^sha256=/, '');
  const fresh = Number.isFinite(timestamp) && Math.abs(Date.now() / 1000 - timestamp) <= MAX_SKEW_SECONDS;
  const validHmac = fresh && signature && safeEqual(signature, hmacSha256(secret, `${timestamp}.${req.rawBody ?? ''}`));
  const validBearer = settings.authMode === 'header' && bearer && safeEqual(bearer, secret);
  if (!validHmac && !validBearer) throw unauthorized('Firma inválida');
  next();
};

router.post('/n8n/delivery', callbackLimiter, verifySignature, validate({ body: deliveryCallbackBody }), async (req, res) => {
  const updated = await recordProviderStatus(req.data.body);
  res.json({ updated });
});

export default router;
