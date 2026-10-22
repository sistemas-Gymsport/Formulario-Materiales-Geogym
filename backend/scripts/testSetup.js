import 'dotenv/config';
import { execSync } from 'node:child_process';

const url = process.env.TEST_DATABASE_URL;

if (!url) {
  process.stderr.write('Define TEST_DATABASE_URL con una base de datos exclusiva para pruebas.\n');
  process.exit(1);
}

if (url === process.env.DATABASE_URL) {
  process.stderr.write('TEST_DATABASE_URL no puede ser la misma base de datos que DATABASE_URL.\n');
  process.exit(1);
}

execSync('npx prisma migrate deploy', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: url } });
