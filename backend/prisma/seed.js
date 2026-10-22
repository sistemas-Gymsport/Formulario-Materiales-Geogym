import { PrismaClient } from '@prisma/client';
import { branches, catalog } from './catalog.js';
import { normalizeKey, slugify } from '../src/utils/normalize.js';
import { SCHEDULE_DEFAULTS } from '../src/config/scheduleDefaults.js';

const prisma = new PrismaClient();

const seedBranches = () =>
  Promise.all(
    branches.map((name, index) =>
      prisma.branch.upsert({
        where: { normalizedName: normalizeKey(name) },
        update: {},
        create: { name, normalizedName: normalizeKey(name), sortOrder: index + 1 }
      })
    )
  );

const seedCatalog = async () => {
  let materialCount = 0;
  for (const [index, entry] of catalog.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(entry.name) },
      update: {},
      create: { name: entry.name, slug: slugify(entry.name), icon: entry.icon, sortOrder: index + 1 }
    });
    for (const [position, name] of entry.materials.entries()) {
      await prisma.material.upsert({
        where: { normalizedName: normalizeKey(name) },
        update: {},
        create: { name, normalizedName: normalizeKey(name), categoryId: category.id, sortOrder: position + 1 }
      });
      materialCount += 1;
    }
  }
  return materialCount;
};

const seedSingletons = () =>
  Promise.all([
    prisma.formSchedule.upsert({ where: { id: 1 }, update: {}, create: { id: 1, ...SCHEDULE_DEFAULTS } }),
    prisma.integrationSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
  ]);

const main = async () => {
  await seedBranches();
  const materials = await seedCatalog();
  await seedSingletons();
  process.stdout.write(`Catálogo listo: ${branches.length} sucursales, ${catalog.length} categorías, ${materials} materiales.\n`);
};

main()
  .catch((error) => {
    process.stderr.write(`Error en seed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
