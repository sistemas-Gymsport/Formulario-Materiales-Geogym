import { z } from 'zod';
import { collapseSpaces } from '../utils/normalize.js';

export const LIMITS = {
  nameMin: 5,
  nameMax: 100,
  customMin: 2,
  customMax: 80,
  customCount: 15,
  materialCount: 300
};

export const cleanText = (min, max, label) =>
  z
    .string({ required_error: `${label} es obligatorio`, invalid_type_error: `${label} no es válido` })
    .transform(collapseSpaces)
    .pipe(z.string().min(min, `${label} debe tener al menos ${min} caracteres`).max(max, `${label} admite máximo ${max} caracteres`));

export const multilineText = (min, max, label) =>
  z
    .string({ required_error: `${label} es obligatorio`, invalid_type_error: `${label} no es válido` })
    .transform((v) =>
      v
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(collapseSpaces)
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    )
    .pipe(z.string().min(min, `${label} debe tener al menos ${min} caracteres`).max(max, `${label} admite máximo ${max} caracteres`));

export const safeLabel = (min, max, label) =>
  cleanText(min, max, label).refine((v) => /^[\p{L}\p{N}][\p{L}\p{N} .,'()\-/+&#°]*$/u.test(v), `${label} contiene caracteres no permitidos`);

export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const uuidParam = z.object({ id: z.string().uuid() });

export const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida (HH:MM)');

export const monthQuery = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12)
});

export const moveBody = z.object({ direction: z.enum(['up', 'down']) });
