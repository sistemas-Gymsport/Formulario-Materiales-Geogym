import { prisma } from '../config/prisma.js';
import { addDays, dateKey, dateOnlyToKey, getZonedParts, keyToDateOnly } from '../utils/time.js';
import { notFound, unprocessable } from '../utils/httpError.js';
import { getAvailability } from './availabilityService.js';
import { ensureSchedule } from './scheduleStore.js';
import { SCHEDULE_DEFAULTS } from '../config/scheduleDefaults.js';

const serializeException = (e) => ({ ...e, date: dateOnlyToKey(e.date) });

export const getScheduleConfig = async () => {
  const schedule = await ensureSchedule();
  const local = getZonedParts(new Date(), schedule.timezone);
  const since = keyToDateOnly(dateKey(addDays({ year: local.year, month: local.month, day: local.day }, -30)));
  const [exceptions, availability] = await Promise.all([
    prisma.formScheduleException.findMany({ where: { date: { gte: since } }, orderBy: { date: 'asc' } }),
    getAvailability()
  ]);
  return { schedule, exceptions: exceptions.map(serializeException), availability };
};

export const updateSchedule = (input, username) =>
  prisma.formSchedule.upsert({ where: { id: 1 }, update: { ...input, updatedBy: username }, create: { id: 1, ...SCHEDULE_DEFAULTS, ...input, updatedBy: username } });

export const saveException = async ({ date, allowed, openingTime, closingTime, note }) => {
  const day = keyToDateOnly(date);
  if (Number.isNaN(day.getTime()) || dateOnlyToKey(day) !== date) throw unprocessable('Fecha inválida');
  const data = {
    allowed,
    openingTime: allowed ? openingTime ?? null : null,
    closingTime: allowed ? closingTime ?? null : null,
    note: note || null
  };
  return serializeException(await prisma.formScheduleException.upsert({ where: { date: day }, update: data, create: { date: day, ...data } }));
};

export const deleteException = async (id) => {
  const { count } = await prisma.formScheduleException.deleteMany({ where: { id } });
  if (!count) throw notFound('Fecha no encontrada');
};
