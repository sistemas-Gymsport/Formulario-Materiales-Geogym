import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { createApp } from './app.js';
import { startJobs } from './jobs/scheduler.js';

prisma.$on('error', (event) => logger.error({ target: event.target }, 'Error de base de datos'));

const app = createApp();
const server = app.listen(env.PORT, env.HOST, () => {
  logger.info({ port: env.PORT, host: env.HOST, env: env.NODE_ENV }, 'Servidor GEO GYM iniciado');
});
server.requestTimeout = 120000;
server.headersTimeout = 30000;

const stopJobs = startJobs();

const shutdown = (signal) => {
  logger.info({ signal }, 'Deteniendo servidor');
  stopJobs();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => logger.error({ err: { message: String(reason?.message ?? reason) } }, 'Promesa rechazada sin control'));
