import { prisma } from '../config/prisma.js';
import { collapseSpaces, normalizeKey, slugify, toTitleSentence } from '../utils/normalize.js';
import { conflict, notFound } from '../utils/httpError.js';
import { moveItem, nextSortOrder } from './orderingService.js';

const isUniqueViolation = (error) => error?.code === 'P2002';

export const getPublicCatalog = async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      materials: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: { id: true, name: true, normalizedName: true }
      }
    }
  });
  return categories.filter((c) => c.materials.length > 0);
};

export const listCategories = () =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { materials: { where: { isActive: true } } } } }
  });

export const createCategory = async ({ name, icon, isActive = true }) => {
  const clean = toTitleSentence(name);
  try {
    return await prisma.category.create({
      data: { name: clean, slug: slugify(clean), icon, isActive, sortOrder: await nextSortOrder(prisma.category) }
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw conflict('Ya existe una categoría con ese nombre');
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  const patch = { ...data };
  if (data.name) {
    patch.name = toTitleSentence(data.name);
    patch.slug = slugify(patch.name);
  }
  try {
    return await prisma.category.update({ where: { id }, data: patch });
  } catch (error) {
    if (error?.code === 'P2025') throw notFound('Categoría no encontrada');
    if (isUniqueViolation(error)) throw conflict('Ya existe una categoría con ese nombre');
    throw error;
  }
};

export const moveCategory = (id, direction) => moveItem('category', id, direction);

export const listMaterials = ({ search, categoryId, status }) => {
  const where = {};
  if (categoryId) where.categoryId = categoryId;
  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;
  if (search) where.normalizedName = { contains: normalizeKey(search) };
  return prisma.material.findMany({
    where,
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      category: { select: { id: true, name: true, isActive: true } },
      _count: { select: { requestItems: true } }
    }
  });
};

const ensureCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw notFound('Categoría no encontrada');
  return category;
};

export const createMaterial = async ({ name, categoryId, isActive = true }) => {
  await ensureCategory(categoryId);
  const clean = toTitleSentence(name);
  try {
    return await prisma.material.create({
      data: {
        name: clean,
        normalizedName: normalizeKey(clean),
        categoryId,
        isActive,
        sortOrder: await nextSortOrder(prisma.material, { categoryId })
      }
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw conflict('Ya existe un material con ese nombre en el catálogo');
    throw error;
  }
};

export const updateMaterial = async (id, data) => {
  const patch = { ...data };
  if (data.name) {
    patch.name = toTitleSentence(data.name);
    patch.normalizedName = normalizeKey(patch.name);
  }
  if (data.categoryId) {
    await ensureCategory(data.categoryId);
    const current = await prisma.material.findUnique({ where: { id }, select: { categoryId: true } });
    if (current && current.categoryId !== data.categoryId) {
      patch.sortOrder = await nextSortOrder(prisma.material, { categoryId: data.categoryId });
    }
  }
  try {
    return await prisma.material.update({ where: { id }, data: patch });
  } catch (error) {
    if (error?.code === 'P2025') throw notFound('Material no encontrado');
    if (isUniqueViolation(error)) throw conflict('Ya existe un material con ese nombre en el catálogo');
    throw error;
  }
};

export const moveMaterial = (id, direction) => moveItem('material', id, direction, 'categoryId');

export const listCustomMaterials = async () => {
  const groups = await prisma.requestItem.groupBy({
    by: ['normalizedName'],
    where: { isCustom: true },
    _count: { _all: true },
    orderBy: { _count: { normalizedName: 'desc' } },
    take: 200
  });
  if (!groups.length) return [];
  const keys = groups.map((g) => g.normalizedName);
  const [samples, catalogMatches] = await Promise.all([
    prisma.requestItem.findMany({
      where: { isCustom: true, normalizedName: { in: keys } },
      orderBy: { request: { createdAt: 'desc' } },
      distinct: ['normalizedName'],
      select: { normalizedName: true, materialNameSnapshot: true, request: { select: { createdAt: true, branchNameSnapshot: true } } }
    }),
    prisma.material.findMany({ where: { normalizedName: { in: keys } }, select: { normalizedName: true, id: true, isActive: true } })
  ]);
  const sampleByKey = new Map(samples.map((s) => [s.normalizedName, s]));
  const catalogByKey = new Map(catalogMatches.map((m) => [m.normalizedName, m]));
  return groups.map((g) => {
    const sample = sampleByKey.get(g.normalizedName);
    return {
      normalizedName: g.normalizedName,
      name: collapseSpaces(sample?.materialNameSnapshot ?? g.normalizedName),
      timesRequested: g._count._all,
      lastRequestedAt: sample?.request.createdAt ?? null,
      lastBranch: sample?.request.branchNameSnapshot ?? null,
      inCatalog: catalogByKey.has(g.normalizedName),
      catalogMaterialId: catalogByKey.get(g.normalizedName)?.id ?? null
    };
  });
};
