import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const limiter = (windowMinutes, limit, message, extra = {}) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: env.isTest ? 10000 : limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: { code: 'RATE_LIMITED', message } }),
    ...extra
  });

export const globalLimiter = limiter(1, 300, 'Demasiadas peticiones. Intenta de nuevo en un momento.');

export const publicReadLimiter = limiter(1, 90, 'Demasiadas consultas. Intenta de nuevo en un momento.');

export const submitLimiter = limiter(10, 12, 'Has enviado demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.');

export const loginLimiter = limiter(15, 10, 'Demasiados intentos de inicio de sesión. Espera 15 minutos.', { skipSuccessfulRequests: true });

export const adminLimiter = limiter(1, 240, 'Demasiadas peticiones administrativas.');

export const callbackLimiter = limiter(1, 120, 'Demasiadas confirmaciones.');
