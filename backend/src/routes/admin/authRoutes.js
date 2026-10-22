import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { loginLimiter } from '../../middleware/rateLimits.js';
import { SESSION_COOKIE, requireAdmin, requireCsrf, sessionCookieOptions } from '../../middleware/auth.js';
import { changePasswordBody, loginBody } from '../../validators/adminValidators.js';
import { changePassword, login, logout } from '../../services/authService.js';

const router = Router();

router.post('/login', loginLimiter, validate({ body: loginBody }), async (req, res) => {
  const result = await login(req.data.body, { ip: req.ip, userAgent: req.get('user-agent') });
  res.cookie(SESSION_COOKIE, result.token, sessionCookieOptions(result.expiresAt));
  res.json({ admin: result.admin, csrfToken: result.csrfToken, expiresAt: result.expiresAt });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin, csrfToken: req.session.csrfToken, expiresAt: req.session.expiresAt });
});

router.post('/logout', requireAdmin, requireCsrf, async (req, res) => {
  await logout(req.session.id);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.status(204).end();
});

router.post('/password', requireAdmin, requireCsrf, validate({ body: changePasswordBody }), async (req, res) => {
  await changePassword(req.admin.id, req.session.id, req.data.body);
  res.status(204).end();
});

export default router;
