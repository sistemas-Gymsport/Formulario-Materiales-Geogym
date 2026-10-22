import request from 'supertest';
import { prisma } from '../src/config/prisma.js';
import { createApp } from '../src/app.js';
import { branches, catalog } from '../prisma/catalog.js';
import { normalizeKey, slugify } from '../src/utils/normalize.js';
import { hashPassword } from '../src/services/passwordService.js';
import { SCHEDULE_DEFAULTS } from '../src/config/scheduleDefaults.js';

export const app = createApp();
export const api = () => request(app);

export const ADMIN = { username: 'admin.pruebas', password: 'Prueba#Segura2026' };

const TABLES = [
  'NotificationOutbox',
  'RequestItem',
  'Request',
  'FolioCounter',
  'Material',
  'Category',
  'Branch',
  'FormScheduleException',
  'FormSchedule',
  'IntegrationSettings',
  'MonthlyClose',
  'AdminSession',
  'Admin'
];

export const resetDatabase = async () => {
  await prisma.$executeRawUnsafe(`TRUNCATE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`);
  await prisma.branch.createMany({ data: branches.map((name, i) => ({ name, normalizedName: normalizeKey(name), sortOrder: i + 1 })) });
  for (const [index, entry] of catalog.entries()) {
    const category = await prisma.category.create({ data: { name: entry.name, slug: slugify(entry.name), icon: entry.icon, sortOrder: index + 1 } });
    await prisma.material.createMany({
      data: entry.materials.map((name, i) => ({ name, normalizedName: normalizeKey(name), categoryId: category.id, sortOrder: i + 1 }))
    });
  }
  const schedule = { allowedWeekdays: [0, 1, 2, 3, 4, 5, 6], openingTime: '00:00', closingTime: '23:59' };
  await prisma.formSchedule.upsert({ where: { id: 1 }, update: schedule, create: { id: 1, ...SCHEDULE_DEFAULTS, ...schedule } });
  await prisma.integrationSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
};

export const createTestAdmin = async (data = ADMIN) =>
  prisma.admin.create({ data: { username: data.username, passwordHash: await hashPassword(data.password) } });

export const loginAgent = async (credentials = ADMIN) => {
  const agent = request.agent(app);
  const res = await agent.post('/api/admin/auth/login').send(credentials);
  if (res.status !== 200) throw new Error(`Login falló: ${res.status}`);
  return { agent, csrf: res.body.csrfToken };
};

export const materialIdsByName = async (...names) => {
  const rows = await prisma.material.findMany({ where: { normalizedName: { in: names.map(normalizeKey) } } });
  return names.map((n) => rows.find((r) => r.normalizedName === normalizeKey(n)).id);
};

export const firstBranch = async (name = 'Satélite') => prisma.branch.findFirst({ where: { name } });

export const closeForm = () => prisma.formSchedule.update({ where: { id: 1 }, data: { enabled: false } });
