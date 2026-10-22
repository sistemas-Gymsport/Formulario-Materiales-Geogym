import { prisma } from '../config/prisma.js';
import { getZonedParts, monthRange } from '../utils/time.js';
import { unprocessable } from '../utils/httpError.js';
import { getTimezone } from './scheduleStore.js';

const currentMonth = async () => {
  const timezone = await getTimezone();
  const p = getZonedParts(new Date(), timezone);
  return { timezone, year: p.year, month: p.month };
};

export const closeElapsedMonths = async () => {
  const { timezone, year, month } = await currentMonth();
  const { start } = monthRange(year, month, timezone);
  const months = await prisma.$queryRaw`
    SELECT DISTINCT
      EXTRACT(YEAR FROM ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timezone}))::int AS year,
      EXTRACT(MONTH FROM ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timezone}))::int AS month
    FROM "Request" WHERE "createdAt" < ${start.toISOString()}::timestamp`;
  const previous = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const data = [...months, previous].map((m) => ({ year: Number(m.year), month: Number(m.month) }));
  const { count } = await prisma.monthlyClose.createMany({ data, skipDuplicates: true });
  return count;
};

export const closeMonthManually = async (year, month, adminId) => {
  const now = await currentMonth();
  if (year > now.year || (year === now.year && month >= now.month)) {
    throw unprocessable('Solo se pueden cerrar meses que ya terminaron');
  }
  return prisma.monthlyClose.upsert({ where: { year_month: { year, month } }, update: {}, create: { year, month, closedById: adminId } });
};

export const listMonthlyCloses = () =>
  prisma.monthlyClose.findMany({ orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 36, include: { closedBy: { select: { username: true } } } });
