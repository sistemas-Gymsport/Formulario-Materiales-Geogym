import { describe, expect, it } from 'vitest';
import { computeAvailability } from '../../src/services/availabilityService.js';
import { SCHEDULE_DEFAULTS, SCHEDULE_TEXTS } from '../../src/config/scheduleDefaults.js';
import { keyToDateOnly, monthRange, zonedToUtc } from '../../src/utils/time.js';

const TZ = 'America/Mexico_City';
const base = {
  timezone: TZ,
  enabled: true,
  openingTime: '08:00',
  closingTime: '18:00',
  allowedWeekdays: [1, 2, 3, 4, 5],
  ...SCHEDULE_TEXTS
};
const at = (y, m, d, h, mi = 0) => zonedToUtc({ year: y, month: m, day: d, hour: h, minute: mi }, TZ);

describe('zonedToUtc', () => {
  it('convierte la hora local de Ciudad de México a UTC (UTC-6)', () => {
    expect(at(2026, 10, 21, 8).toISOString()).toBe('2026-10-21T14:00:00.000Z');
  });

  it('calcula los límites del mes en la zona horaria oficial', () => {
    const { start, end } = monthRange(2026, 10, TZ);
    expect(start.toISOString()).toBe('2026-10-01T06:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-01T06:00:00.000Z');
  });
});

describe('computeAvailability', () => {
  it('está abierto en un día y horario permitidos', () => {
    const result = computeAvailability(base, [], at(2026, 10, 21, 10));
    expect(result.isOpen).toBe(true);
    expect(result.closesAt).toBe(at(2026, 10, 21, 18).toISOString());
  });

  it('está cerrado antes de la hora de apertura y calcula la apertura del mismo día', () => {
    const result = computeAvailability(base, [], at(2026, 10, 21, 7, 59));
    expect(result.isOpen).toBe(false);
    expect(result.reason).toBe('OUTSIDE_HOURS');
    expect(result.opensAt).toBe(at(2026, 10, 21, 8).toISOString());
  });

  it('cierra exactamente a la hora de cierre', () => {
    expect(computeAvailability(base, [], at(2026, 10, 21, 18)).isOpen).toBe(false);
  });

  it('está cerrado en fin de semana y calcula el lunes siguiente', () => {
    const result = computeAvailability(base, [], at(2026, 10, 24, 10));
    expect(result.isOpen).toBe(false);
    expect(result.reason).toBe('DAY_DISABLED');
    expect(result.opensAt).toBe(at(2026, 10, 26, 8).toISOString());
  });

  it('respeta fechas bloqueadas', () => {
    const exceptions = [{ date: keyToDateOnly('2026-10-21'), allowed: false }];
    const result = computeAvailability(base, exceptions, at(2026, 10, 21, 10));
    expect(result.isOpen).toBe(false);
    expect(result.reason).toBe('BLOCKED_DATE');
    expect(result.opensAt).toBe(at(2026, 10, 22, 8).toISOString());
  });

  it('permite aperturas extraordinarias con horario propio', () => {
    const exceptions = [{ date: keyToDateOnly('2026-10-24'), allowed: true, openingTime: '09:00', closingTime: '12:00' }];
    expect(computeAvailability(base, exceptions, at(2026, 10, 24, 10)).isOpen).toBe(true);
    expect(computeAvailability(base, exceptions, at(2026, 10, 24, 12, 30)).isOpen).toBe(false);
  });

  it('la desactivación manual cierra el formulario sin próxima apertura', () => {
    const result = computeAvailability({ ...base, enabled: false }, [], at(2026, 10, 21, 10));
    expect(result).toMatchObject({ isOpen: false, reason: 'MANUAL', opensAt: null });
  });

  it('aplica el horario de recepción de GEO GYM: martes, jueves, sábado y domingo de 5:00 a 17:00', () => {
    const geo = { ...base, ...SCHEDULE_DEFAULTS };
    expect(computeAvailability(geo, [], at(2026, 10, 27, 5)).isOpen).toBe(true);
    expect(computeAvailability(geo, [], at(2026, 10, 27, 16, 59)).isOpen).toBe(true);
    expect(computeAvailability(geo, [], at(2026, 10, 27, 17)).isOpen).toBe(false);
    expect(computeAvailability(geo, [], at(2026, 10, 25, 9)).isOpen).toBe(true);
    const monday = computeAvailability(geo, [], at(2026, 10, 26, 10));
    expect(monday).toMatchObject({ isOpen: false, reason: 'DAY_DISABLED', opensAt: at(2026, 10, 27, 5).toISOString() });
    const thursdayNight = computeAvailability(geo, [], at(2026, 10, 22, 20));
    expect(thursdayNight.opensAt).toBe(at(2026, 10, 24, 5).toISOString());
  });

  it('entrega los textos editables, los días ordenados y las fechas especiales próximas', () => {
    const geo = { ...base, ...SCHEDULE_DEFAULTS };
    const exceptions = [
      { date: keyToDateOnly('2026-10-29'), allowed: false, note: 'Inventario' },
      { date: keyToDateOnly('2026-10-28'), allowed: true, openingTime: '08:00', closingTime: null },
      { date: keyToDateOnly('2026-10-01'), allowed: false }
    ];
    const result = computeAvailability(geo, exceptions, at(2026, 10, 26, 10));
    expect(result.schedule).toMatchObject({ weekdays: [2, 4, 6, 0], openingTime: '05:00', closingTime: '17:00' });
    expect(result.messages.notice.title).toBe(SCHEDULE_DEFAULTS.noticeTitle);
    expect(result.messages.closed.button).toBe('Volver al inicio');
    expect(result.specialDates).toEqual([
      { date: '2026-10-28', allowed: true, openingTime: '08:00', closingTime: '17:00', note: null },
      { date: '2026-10-29', allowed: false, openingTime: null, closingTime: null, note: 'Inventario' }
    ]);
    expect(result.opensAt).toBe(at(2026, 10, 27, 5).toISOString());
  });

  it('no inventa una próxima apertura si no hay días habilitados', () => {
    const result = computeAvailability({ ...base, allowedWeekdays: [] }, [], at(2026, 10, 21, 10));
    expect(result.opensAt).toBeNull();
  });
});
