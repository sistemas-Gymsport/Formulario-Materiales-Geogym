import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { requireAdmin, requireCsrf } from './middleware/auth.js';
import { adminLimiter, globalLimiter } from './middleware/rateLimits.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import publicRoutes from './routes/publicRoutes.js';
import callbackRoutes from './routes/callbackRoutes.js';
import authRoutes from './routes/admin/authRoutes.js';
import catalogRoutes from './routes/admin/catalogRoutes.js';
import operationsRoutes from './routes/admin/operationsRoutes.js';
import settingsRoutes from './routes/admin/settingsRoutes.js';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    helmet({
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'same-site' }
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => callback(null, !origin || env.corsOrigins.includes(origin)),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Idempotency-Key'],
      maxAge: 600
    })
  );
  if (!env.isTest) {
    app.use(
      pinoHttp({
        logger,
        autoLogging: { ignore: (req) => req.url === '/api/health' },
        serializers: {
          req: (req) => ({ id: req.id, method: req.method, url: req.url.split('?')[0], ip: req.remoteAddress }),
          res: (res) => ({ statusCode: res.statusCode })
        }
      })
    );
  }
  app.use(globalLimiter);
  app.use(cookieParser());
  app.use(
    express.json({
      limit: '64kb',
      verify: (req, res, buffer) => {
        if (req.originalUrl.startsWith('/api/integrations/')) req.rawBody = buffer.toString('utf8');
      }
    })
  );

  app.get('/api/health', async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/public', publicRoutes);
  app.use('/api/integrations', callbackRoutes);
  app.use('/api/admin/auth', adminLimiter, authRoutes);
  app.use('/api/admin', adminLimiter, requireAdmin, requireCsrf, (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use('/api/admin', catalogRoutes, operationsRoutes, settingsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
