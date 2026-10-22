import { prisma } from '../config/prisma.js';
import { collapseSpaces, normalizeKey } from '../utils/normalize.js';
import { conflict, notFound } from '../utils/httpError.js';
import { moveItem, nextSortOrder } from './orderingService.js';

export const listPublicBranches = () =>
  prisma.branch.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: { id: true, name: true }
  });

export const listBranches = () =>
  prisma.branch.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { requests: true } } }
  });

const handle = (error) => {
  if (error?.code === 'P2002') throw conflict('Ya existe una sucursal con ese nombre');
  if (error?.code === 'P2025') throw notFound('Sucursal no encontrada');
  throw error;
};

export const createBranch = async ({ name, isActive = true }) => {
  const clean = collapseSpaces(name);
  try {
    return await prisma.branch.create({
      data: { name: clean, normalizedName: normalizeKey(clean), isActive, sortOrder: await nextSortOrder(prisma.branch) }
    });
  } catch (error) {
    return handle(error);
  }
};

export const updateBranch = async (id, data) => {
  const patch = { ...data };
  if (data.name) {
    patch.name = collapseSpaces(data.name);
    patch.normalizedName = normalizeKey(patch.name);
  }
  try {
    return await prisma.branch.update({ where: { id }, data: patch });
  } catch (error) {
    return handle(error);
  }
};

export const moveBranch = (id, direction) => moveItem('branch', id, direction);
