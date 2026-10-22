import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.isTest ? 'silent' : env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'req.headers["x-csrf-token"]',
      'res.headers["set-cookie"]',
      'password',
      'currentPassword',
      'newPassword',
      'credential',
      'secret',
      '*.password',
      '*.credential',
      '*.secret'
    ],
    censor: '[oculto]'
  },
  base: { service: 'geogym-materiales' }
});
