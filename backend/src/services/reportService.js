import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { daysInMonth, getZonedParts, monthRange } from '../utils/time.js';
import { serializeRequest } from './requestService.js';
import { MONTHS, buildInsights } from './insightService.js';
import { getTimezone } from './scheduleStore.js';


export const monthLabel = (year, month) => `${MONTHS[month - 1].charAt(0).toUpperCase()}${MONTHS[month - 1].slice(1)} de ${year}`;

const increment = (map, key, init) => {
  const entry = map.get(key) ?? { ...init, value: 0 };
  entry.value += 1;
  map.set(key, entry);
  return entry;
};

export const rank = (map) => [...map.values()].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'es'));

export const leader = (ranked) => {
  if (!ranked.length || ranked[0].value === 0) return null;
  const top = ranked.filter((r) => r.value === ranked[0].value);
  return { name: top[0].name, names: top.map((t) => t.name), value: top[0].value, tie: top.length > 1 };
};

const aggregate = (requests, timeZone, totalDays) => {
  const branches = new Map();
  const categories = new Map();
  const materials = new Map();
  const customs = new Map();
  const matrix = new Map();
  const requesters = new Map();
  const days = Array.from({ length: totalDays }, (_, i) => ({ day: i + 1, value: 0 }));
  let selections = 0;

  for (const request of requests) {
    increment(branches, request.branchNameSnapshot, { name: request.branchNameSnapshot });
    const local = getZonedParts(request.createdAt, timeZone);
    days[local.day - 1].value += 1;
    const requester = increment(requesters, `${request.requesterNormalized}|${request.branchId}`, {
      name: request.requesterName,
      branch: request.branchNameSnapshot,
      requests: []
    });
    requester.requests.push({ id: request.id, folio: request.folio, createdAt: request.createdAt, itemCount: request.itemCount });
    const branchRow = matrix.get(request.branchNameSnapshot) ?? new Map();
    matrix.set(request.branchNameSnapshot, branchRow);
    for (const item of request.items) {
      selections += 1;
      if (item.isCustom) {
        increment(customs, item.normalizedName, { name: item.materialNameSnapshot });
        continue;
      }
      increment(categories, item.categoryNameSnapshot, { name: item.categoryNameSnapshot });
      increment(materials, item.normalizedName, { name: item.materialNameSnapshot, category: item.categoryNameSnapshot });
      branchRow.set(item.categoryNameSnapshot, (branchRow.get(item.categoryNameSnapshot) ?? 0) + 1);
    }
  }
  return { branches, categories, materials, customs, matrix, requesters, days, selections };
};

const loadRequests = async (start, end) => {
  const where = { createdAt: { gte: start, lt: end } };
  const count = await prisma.request.count({ where });
  if (count > env.REPORT_MAX_REQUESTS) {
    throw new HttpError(413, 'REPORT_TOO_LARGE', `El mes contiene ${count} solicitudes y supera el límite configurado de ${env.REPORT_MAX_REQUESTS}`);
  }
  return prisma.request.findMany({
    where,
    orderBy: [{ createdAt: 'asc' }, { folio: 'asc' }],
    include: { items: { orderBy: [{ isCustom: 'asc' }, { sortOrder: 'asc' }] } }
  });
};

export const buildMonthlyReport = async (year, month, { includeRequests = false } = {}) => {
  const timezone = await getTimezone();
  const { start, end } = monthRange(year, month, timezone);
  const [requests, activeBranches, categoryOrder, close] = await Promise.all([
    loadRequests(start, end),
    prisma.branch.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { name: true } }),
    prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { name: true } }),
    prisma.monthlyClose.findUnique({ where: { year_month: { year, month } } })
  ]);

  const agg = aggregate(requests, timezone, daysInMonth(year, month));
  for (const branch of activeBranches) if (!agg.branches.has(branch.name)) agg.branches.set(branch.name, { name: branch.name, value: 0 });

  const byBranch = rank(agg.branches);
  const byCategory = rank(agg.categories);
  const topMaterials = rank(agg.materials);
  const topCustom = rank(agg.customs);
  const requesters = rank(agg.requesters).map(({ value, ...r }) => ({ ...r, count: value }));
  const usedCategories = categoryOrder.map((c) => c.name).filter((name) => agg.categories.has(name));
  const now = getZonedParts(new Date(), timezone);

  const summary = {
    totalRequests: requests.length,
    branchesWithRequests: byBranch.filter((b) => b.value > 0).length,
    activeBranches: activeBranches.length,
    uniqueRequesters: agg.requesters.size,
    totalSelections: agg.selections,
    distinctMaterials: agg.materials.size + agg.customs.size,
    customSelections: topCustom.reduce((sum, c) => sum + c.value, 0),
    distinctCustom: agg.customs.size,
    topCategory: leader(byCategory),
    topMaterial: leader(topMaterials),
    topBranch: leader(byBranch),
    peakDay: leader(agg.days.map((d) => ({ name: String(d.day), value: d.value })).sort((a, b) => b.value - a.value || Number(a.name) - Number(b.name)))
  };

  return {
    period: {
      year,
      month,
      label: monthLabel(year, month),
      timezone,
      start: start.toISOString(),
      end: end.toISOString(),
      isCurrent: now.year === year && now.month === month,
      isClosed: Boolean(close),
      closedAt: close?.closedAt ?? null
    },
    generatedAt: new Date().toISOString(),
    summary,
    charts: {
      byBranch,
      byCategory,
      topMaterials: topMaterials.slice(0, 12),
      topCustom: topCustom.slice(0, 10),
      byDay: agg.days,
      branchCategory: {
        categories: usedCategories,
        rows: byBranch.filter((b) => b.value > 0).map((b) => ({ name: b.name, ...Object.fromEntries(agg.matrix.get(b.name) ?? []) }))
      }
    },
    allMaterials: topMaterials,
    allCustom: topCustom,
    insights: buildInsights({ summary, byBranch, byCategory, topCustom, year, month }),
    requesters,
    ...(includeRequests ? { requests: requests.map(serializeRequest) } : {})
  };
};
