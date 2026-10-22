import { prisma } from '../config/prisma.js';
import { notFound } from '../utils/httpError.js';

export const nextSortOrder = async (delegate, where = {}) => {
  const last = await delegate.findFirst({ where, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  return (last?.sortOrder ?? 0) + 1;
};

export const moveItem = (modelName, id, direction, scopeKey) =>
  prisma.$transaction(async (tx) => {
    const delegate = tx[modelName];
    const current = await delegate.findUnique({ where: { id } });
    if (!current) throw notFound();
    const scope = scopeKey ? { [scopeKey]: current[scopeKey] } : {};
    const siblings = await delegate.findMany({ where: scope, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], select: { id: true } });
    const index = siblings.findIndex((s) => s.id === id);
    const target = index + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= siblings.length) return current;
    const reordered = [...siblings];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await Promise.all(reordered.map((item, position) => delegate.update({ where: { id: item.id }, data: { sortOrder: position + 1 } })));
    return delegate.findUnique({ where: { id } });
  });
