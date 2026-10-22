import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ask, askHidden } from './terminal.js';
import { USERNAME_PATTERN, passwordProblems } from '../src/utils/passwordPolicy.js';
import { hashPassword } from '../src/services/passwordService.js';

const prisma = new PrismaClient();
const out = (text) => process.stdout.write(`${text}\n`);

const requestUsername = async () => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const username = (await ask('Nombre de usuario del administrador: ')).toLowerCase();
    if (USERNAME_PATTERN.test(username)) return username;
    out('  Usa de 3 a 40 caracteres: letras, números, punto, guion o guion bajo.');
  }
  throw new Error('Nombre de usuario no válido.');
};

const requestPassword = async (username) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const password = await askHidden('Contraseña (no se mostrará): ');
    const problems = passwordProblems(password, username);
    if (problems.length) {
      out(`  La contraseña requiere: ${problems.join(', ')}.`);
      continue;
    }
    const confirmation = await askHidden('Confirma la contraseña: ');
    if (confirmation === password) return password;
    out('  Las contraseñas no coinciden.');
  }
  throw new Error('No se capturó una contraseña válida.');
};

const main = async () => {
  out('\nGEO GYM · Registro del administrador inicial\n');
  await prisma.$queryRaw`SELECT 1`;
  out('✓ Base de datos disponible');
  const existing = await prisma.admin.count();
  if (existing > 0) {
    out('Ya existe al menos un administrador. Los administradores adicionales se crean desde el panel (/admin/administradores).');
    return;
  }
  const username = await requestUsername();
  const password = await requestPassword(username);
  const passwordHash = await hashPassword(password);
  const admin = await prisma.$transaction(async (tx) => {
    if ((await tx.admin.count()) > 0) throw new Error('Otro proceso registró un administrador durante la ejecución.');
    return tx.admin.create({ data: { username, passwordHash }, select: { id: true, username: true, createdAt: true } });
  });
  const verified = await prisma.admin.findUnique({ where: { id: admin.id }, select: { id: true } });
  if (!verified) throw new Error('No fue posible confirmar el registro.');
  out(`✓ Administrador "${admin.username}" registrado en PostgreSQL (${admin.createdAt.toISOString()}).`);
};

main()
  .catch((error) => {
    process.stderr.write(`✗ ${error.code === 'P2002' ? 'El usuario ya existe.' : error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
