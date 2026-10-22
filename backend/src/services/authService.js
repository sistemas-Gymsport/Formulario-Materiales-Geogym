import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { randomToken, sha256 } from '../utils/crypto.js';
import { HttpError, badRequest, conflict, forbidden, notFound, unauthorized } from '../utils/httpError.js';
import { passwordProblems } from '../utils/passwordPolicy.js';
import { burnVerification, hashPassword, verifyPassword } from './passwordService.js';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

const adminView = (admin) => ({
  id: admin.id,
  username: admin.username,
  isActive: admin.isActive,
  lastLoginAt: admin.lastLoginAt,
  createdAt: admin.createdAt,
  passwordChangedAt: admin.passwordChangedAt
});

const createSession = async (adminId, meta) => {
  const token = randomToken(32);
  const csrfToken = randomToken(24);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3600 * 1000);
  await prisma.adminSession.create({
    data: { adminId, tokenHash: sha256(token), csrfToken, expiresAt, userAgent: meta.userAgent?.slice(0, 300), ip: meta.ip?.slice(0, 64) }
  });
  return { token, csrfToken, expiresAt };
};

export const login = async ({ username, password }, meta) => {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !admin.isActive) {
    await burnVerification(password);
    throw unauthorized('Usuario o contraseña incorrectos');
  }
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw new HttpError(423, 'ACCOUNT_LOCKED', 'Cuenta bloqueada temporalmente por intentos fallidos', { lockedUntil: admin.lockedUntil });
  }
  const valid = await verifyPassword(admin.passwordHash, password);
  if (!valid) {
    const failed = admin.failedLoginCount + 1;
    const lock = failed >= MAX_FAILED_ATTEMPTS;
    await prisma.admin.update({
      where: { id: admin.id },
      data: { failedLoginCount: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60000) : null }
    });
    if (lock) throw new HttpError(423, 'ACCOUNT_LOCKED', `Demasiados intentos. Intenta de nuevo en ${LOCK_MINUTES} minutos`);
    throw unauthorized('Usuario o contraseña incorrectos');
  }
  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() }
  });
  const session = await createSession(admin.id, meta);
  return { admin: adminView(updated), ...session };
};

export const resolveSession = async (token) => {
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({ where: { tokenHash: sha256(token) }, include: { admin: true } });
  if (!session || session.expiresAt <= new Date() || !session.admin.isActive) return null;
  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
  }
  return { id: session.id, csrfToken: session.csrfToken, expiresAt: session.expiresAt, admin: adminView(session.admin) };
};

export const logout = (sessionId) => prisma.adminSession.deleteMany({ where: { id: sessionId } });

export const purgeExpiredSessions = () => prisma.adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });

const assertStrong = (password, username) => {
  const problems = passwordProblems(password, username);
  if (problems.length) throw badRequest(`La contraseña requiere: ${problems.join(', ')}`, { problems });
};

export const changePassword = async (adminId, sessionId, { currentPassword, newPassword }) => {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw notFound();
  if (!(await verifyPassword(admin.passwordHash, currentPassword))) throw badRequest('La contraseña actual no es correcta');
  if (currentPassword === newPassword) throw badRequest('La nueva contraseña debe ser distinta a la actual');
  assertStrong(newPassword, admin.username);
  await prisma.$transaction([
    prisma.admin.update({ where: { id: adminId }, data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() } }),
    prisma.adminSession.deleteMany({ where: { adminId, id: { not: sessionId } } })
  ]);
};

export const listAdmins = async () => (await prisma.admin.findMany({ orderBy: { createdAt: 'asc' } })).map(adminView);

export const createAdmin = async ({ username, password }) => {
  assertStrong(password, username);
  try {
    return adminView(await prisma.admin.create({ data: { username, passwordHash: await hashPassword(password) } }));
  } catch (error) {
    if (error?.code === 'P2002') throw conflict('Ese nombre de usuario ya está registrado');
    throw error;
  }
};

export const setAdminActive = async (actorId, targetId, isActive) => {
  if (actorId === targetId) throw forbidden('No puedes desactivar tu propia cuenta');
  return prisma.$transaction(async (tx) => {
    if (!isActive) {
      const activeCount = await tx.admin.count({ where: { isActive: true, id: { not: targetId } } });
      if (activeCount < 1) throw forbidden('Debe existir al menos un administrador activo');
      await tx.adminSession.deleteMany({ where: { adminId: targetId } });
    }
    const admin = await tx.admin.update({ where: { id: targetId }, data: { isActive, failedLoginCount: 0, lockedUntil: null } }).catch(() => null);
    if (!admin) throw notFound('Administrador no encontrado');
    return adminView(admin);
  });
};
