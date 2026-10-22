import { prisma } from '../config/prisma.js';
import { normalizeKey } from '../utils/normalize.js';
import { monthRange } from '../utils/time.js';
import { serializeRequest } from './requestService.js';
import { getTimezone } from './scheduleStore.js';

export const buildRequestWhere = async ({ month, branchId, requester, categoryId, material, folio }) => {
  const where = {};
  if (month) {
    const [year, m] = month.split('-').map(Number);
    const { start, end } = monthRange(year, m, await getTimezone());
    where.createdAt = { gte: start, lt: end };
  }
  if (branchId) where.branchId = branchId;
  if (requester) where.requesterNormalized = { contains: normalizeKey(requester) };
  if (folio) where.folio = { contains: folio.trim().toUpperCase() };
  const itemFilters = [];
  if (categoryId) itemFilters.push({ items: { some: { categoryId } } });
  if (material) itemFilters.push({ items: { some: { normalizedName: { contains: normalizeKey(material) } } } });
  if (itemFilters.length) where.AND = itemFilters;
  return where;
};

export const listRequests = async (query) => {
  const where = await buildRequestWhere(query);
  const [total, rows] = await prisma.$transaction([
    prisma.request.count({ where }),
    prisma.request.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { folio: 'desc' }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        items: { orderBy: [{ isCustom: 'asc' }, { sortOrder: 'asc' }] },
        notifications: { select: { status: true, attempts: true, deliveredAt: true, providerStatus: true, lastError: true } }
      }
    })
  ]);
  return {
    data: rows.map(serializeRequest),
    pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) }
  };
};
