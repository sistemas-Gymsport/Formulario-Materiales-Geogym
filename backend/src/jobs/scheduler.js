import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { processOutbox } from '../services/notificationService.js';
import { closeElapsedMonths } from '../services/monthlyCloseService.js';
import { purgeExpiredSessions } from '../services/authService.js';

const HOUR = 3600 * 1000;

const safely = (name, task) => async () => {
  try {
    await task();
  } catch (error) {
    logger.error({ job: name, err: { message: error.message } }, 'Error en tarea programada');
  }
};

export const startJobs = () => {
  const monthly = safely('monthly-close', async () => {
    const closed = await closeElapsedMonths();
    if (closed) logger.info({ closed }, 'Periodos mensuales cerrados');
  });
  const sessions = safely('session-cleanup', purgeExpiredSessions);
  const outbox = safely('outbox', processOutbox);
  monthly();
  sessions();
  outbox();
  const timers = [setInterval(monthly, HOUR), setInterval(sessions, 6 * HOUR), setInterval(outbox, env.OUTBOX_INTERVAL_SECONDS * 1000)];
  timers.forEach((t) => t.unref());
  return () => timers.forEach(clearInterval);
};
