import { z } from 'zod';
import { LIMITS, cleanText, safeLabel } from './common.js';

export const requestBody = z
  .object({
    requesterName: cleanText(LIMITS.nameMin, LIMITS.nameMax, 'El nombre').refine(
      (v) => /^[\p{L}][\p{L} .'\-]*$/u.test(v) && v.split(' ').length >= 2,
      'Escribe tu nombre completo usando solo letras'
    ),
    branchId: z.coerce.number({ invalid_type_error: 'Selecciona una sucursal' }).int().positive('Selecciona una sucursal'),
    materialIds: z
      .array(z.number().int().positive())
      .max(LIMITS.materialCount)
      .default([])
      .refine((ids) => new Set(ids).size === ids.length, 'Hay materiales duplicados'),
    customMaterials: z.array(safeLabel(LIMITS.customMin, LIMITS.customMax, 'El material adicional')).max(LIMITS.customCount, `Máximo ${LIMITS.customCount} materiales adicionales`).default([]),
    website: z.string().max(0).optional()
  })
  .strict()
  .refine((v) => v.materialIds.length + v.customMaterials.length > 0, { message: 'Selecciona al menos un material', path: ['materialIds'] });

export const idempotencyHeader = z.string().uuid('Clave de idempotencia inválida');

export const receiptBody = z
  .object({
    folio: z.string().trim().regex(/^SOL-\d{8}-\d{4,}$/, 'Folio inválido'),
    key: z.string().uuid('Clave inválida')
  })
  .strict();
