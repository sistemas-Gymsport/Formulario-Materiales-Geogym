import { env } from '../config/env.js';
import { resolveSession } from '../services/authService.js';
import { safeEqual } from '../utils/crypto.js';
import { forbidden, unauthorized } from '../utils/httpError.js';

export const SESSION_COOKIE = env.COOKIE_SECURE ? '__Host-gg_session' : 'gg_session';

export const sessionCookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'strict',
  path: '/',
  ...(expiresAt ? { expires: expiresAt } : {})
});

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const requireAdmin = async (req, res, next) => {
  const session = await resolveSession(req.cookies?.[SESSION_COOKIE]);
  if (!session) {
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
    throw unauthorized();
  }
  req.session = session;
  req.admin = session.admin;
  next();
};

export const requireCsrf = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !env.corsOrigins.includes(origin)) throw forbidden('Origen no permitido');
  const token = req.get('x-csrf-token');
  if (!token || !safeEqual(token, req.session.csrfToken)) throw forbidden('Token CSRF inválido');
  next();
};
