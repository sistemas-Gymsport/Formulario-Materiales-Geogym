import { prisma } from '../config/prisma.js';
import { SCHEDULE_DEFAULTS } from '../config/scheduleDefaults.js';

export const ensureSchedule = (client = prisma, select) =>
  client.formSchedule.upsert({ where: { id: 1 }, update: {}, create: { id: 1, ...SCHEDULE_DEFAULTS }, ...(select ? { select } : {}) });

export const getTimezone = async (client = prisma) => (await ensureSchedule(client, { timezone: true })).timezone;
