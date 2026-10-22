import { z } from 'zod';
import { cleanText, multilineText, safeLabel, timeString } from './common.js';
import { USERNAME_PATTERN } from '../utils/passwordPolicy.js';
import { isValidTimeZone } from '../utils/time.js';

export const ICONS = [
  'pencil-ruler',
  'hand-heart',
  'flask-conical',
  'brush',
  'trash-2',
  'bug',
  'package',
  'spray-can',
  'droplets',
  'shirt',
  'wrench',
  'lightbulb',
  'coffee',
  'cross',
  'dumbbell',
  'box'
];

export const loginBody = z.object({
  username: z.string().trim().toLowerCase().min(1).max(40),
  password: z.string().min(1).max(128)
});

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(1).max(128)
});

export const createAdminBody = z.object({
  username: z.string().trim().toLowerCase().regex(USERNAME_PATTERN, 'Usuario inválido: 3 a 40 caracteres (letras, números, . _ -)'),
  password: z.string().min(1).max(128)
});

export const updateAdminBody = z.object({ isActive: z.boolean() });

const name80 = safeLabel(2, 80, 'El nombre');

export const categoryBody = z.object({
  name: name80,
  icon: z.enum(ICONS).default('package'),
  isActive: z.boolean().optional()
});

export const categoryPatch = z
  .object({ name: name80.optional(), icon: z.enum(ICONS).optional(), isActive: z.boolean().optional() })
  .refine((v) => Object.keys(v).length > 0, 'Sin cambios');

export const materialBody = z.object({
  name: name80,
  categoryId: z.coerce.number().int().positive(),
  isActive: z.boolean().optional()
});

export const materialPatch = z
  .object({ name: name80.optional(), categoryId: z.coerce.number().int().positive().optional(), isActive: z.boolean().optional() })
  .refine((v) => Object.keys(v).length > 0, 'Sin cambios');

export const materialQuery = z.object({
  search: z.string().max(80).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all')
});

export const branchBody = z.object({ name: name80, isActive: z.boolean().optional() });

export const branchPatch = z
  .object({ name: name80.optional(), isActive: z.boolean().optional() })
  .refine((v) => Object.keys(v).length > 0, 'Sin cambios');

export const requestsQuery = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  branchId: z.coerce.number().int().positive().optional(),
  requester: z.string().max(100).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  material: z.string().max(80).optional(),
  folio: z.string().max(24).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(15)
});

export const scheduleBody = z
  .object({
    enabled: z.boolean(),
    timezone: z.string().refine(isValidTimeZone, 'Zona horaria inválida'),
    openingTime: timeString,
    closingTime: timeString,
    allowedWeekdays: z.array(z.number().int().min(0).max(6)).max(7).transform((d) => [...new Set(d)].sort()),
    noticeTitle: cleanText(3, 120, 'El título del aviso'),
    noticeIntro: multilineText(5, 800, 'El texto del aviso'),
    noticeOutro: multilineText(0, 400, 'El cierre del aviso'),
    noticeButton: cleanText(2, 40, 'El botón del aviso'),
    closedTitle: cleanText(3, 120, 'El título de cierre'),
    closedMessage: multilineText(5, 800, 'El texto de cierre'),
    closedOutro: multilineText(0, 400, 'El cierre del mensaje'),
    closedButton: cleanText(2, 40, 'El botón de cierre')
  })
  .refine((v) => v.closingTime > v.openingTime, { message: 'La hora de cierre debe ser posterior a la de apertura', path: ['closingTime'] });

export const exceptionBody = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    allowed: z.boolean(),
    openingTime: timeString.nullable().optional(),
    closingTime: timeString.nullable().optional(),
    note: z.string().trim().max(120).optional()
  })
  .refine((v) => !v.allowed || !v.openingTime || !v.closingTime || v.closingTime > v.openingTime, {
    message: 'La hora de cierre debe ser posterior a la de apertura',
    path: ['closingTime']
  });

export const integrationBody = z.object({
  enabled: z.boolean(),
  webhookUrl: z.string().trim().max(500).url('URL inválida').nullable().or(z.literal('').transform(() => null)),
  destinationPhone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, ''))
    .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Usa formato internacional, por ejemplo +5215512345678'))
    .nullable()
    .or(z.literal('').transform(() => null)),
  credential: z.string().min(16, 'El secreto debe tener al menos 16 caracteres').max(200).optional(),
  authMode: z.enum(['hmac', 'header']).default('hmac'),
  heldPolicy: z.enum(['ignore', 'send'])
});

export const deliveryCallbackBody = z.object({
  eventId: z.string().uuid(),
  status: z.enum(['delivered', 'read', 'failed']),
  detail: z.string().max(300).optional()
});
