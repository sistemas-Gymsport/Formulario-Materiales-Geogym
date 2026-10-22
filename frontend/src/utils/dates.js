export const DEFAULT_TZ = 'America/Mexico_City';

const cache = new Map();

const formatter = (options, timeZone = DEFAULT_TZ) => {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  if (!cache.has(key)) cache.set(key, new Intl.DateTimeFormat('es-MX', { timeZone, ...options }));
  return cache.get(key);
};

export const formatDate = (value, timeZone) => formatter({ day: '2-digit', month: '2-digit', year: 'numeric' }, timeZone).format(new Date(value));

export const formatDateTime = (value, timeZone) =>
  formatter({ day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }, timeZone).format(new Date(value));

export const formatTime = (value, timeZone) => formatter({ hour: '2-digit', minute: '2-digit', hour12: false }, timeZone).format(new Date(value));

export const formatFullDate = (value, timeZone) => formatter({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, timeZone).format(new Date(value));

export const formatLongDate = (value, timeZone) => formatter({ weekday: 'long', day: 'numeric', month: 'long' }, timeZone).format(new Date(value));

export const formatClock = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};

export const formatTime12 = (value, timeZone) => formatClock(formatTime(value, timeZone));

export const formatOpening = (value, timeZone) => `${formatLongDate(value, timeZone)} a las ${formatTime12(value, timeZone)}`;

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatDateKey = (key) => capitalize(formatLongDate(`${key}T12:00:00.000Z`, 'UTC'));

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const WEEKDAYS = [
  { value: 1, short: 'Lun', label: 'Lunes', plural: 'lunes' },
  { value: 2, short: 'Mar', label: 'Martes', plural: 'martes' },
  { value: 3, short: 'Mié', label: 'Miércoles', plural: 'miércoles' },
  { value: 4, short: 'Jue', label: 'Jueves', plural: 'jueves' },
  { value: 5, short: 'Vie', label: 'Viernes', plural: 'viernes' },
  { value: 6, short: 'Sáb', label: 'Sábado', plural: 'sábados' },
  { value: 0, short: 'Dom', label: 'Domingo', plural: 'domingos' }
];

export const joinList = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`);

export const formatWeekdays = (values) => capitalize(joinList(WEEKDAYS.filter((d) => values.includes(d.value)).map((d) => d.plural)));

export const currentYearMonth = (timeZone = DEFAULT_TZ) => {
  const parts = Object.fromEntries(formatter({ year: 'numeric', month: 'numeric' }, timeZone).formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month) };
};

export const monthKey = ({ year, month }) => `${year}-${String(month).padStart(2, '0')}`;
