import { logger } from '../config/logger.js';
import { HttpError } from '../utils/httpError.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'La información enviada es demasiado grande' } });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Formato de datos inválido' } });
  }
  logger.error({ err: { message: error?.message, code: error?.code, stack: error?.stack }, path: req.path }, 'Error no controlado');
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'Ocurrió un error inesperado. Intenta de nuevo.' } });
};
