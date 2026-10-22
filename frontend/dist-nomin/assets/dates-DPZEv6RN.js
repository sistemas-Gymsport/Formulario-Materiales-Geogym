const DEFAULT_TZ = "America/Mexico_City";
const cache = /* @__PURE__ */ new Map();
const formatter = (options, timeZone = DEFAULT_TZ) => {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  if (!cache.has(key)) cache.set(key, new Intl.DateTimeFormat("es-MX", { timeZone, ...options }));
  return cache.get(key);
};
const formatDate = (value, timeZone) => formatter({ day: "2-digit", month: "2-digit", year: "numeric" }, timeZone).format(new Date(value));
const formatDateTime = (value, timeZone) => formatter({ day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }, timeZone).format(new Date(value));
const formatTime = (value, timeZone) => formatter({ hour: "2-digit", minute: "2-digit", hour12: false }, timeZone).format(new Date(value));
const formatFullDate = (value, timeZone) => formatter({ weekday: "long", day: "numeric", month: "long", year: "numeric" }, timeZone).format(new Date(value));
const formatLongDate = (value, timeZone) => formatter({ weekday: "long", day: "numeric", month: "long" }, timeZone).format(new Date(value));
const formatClock = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
};
const formatTime12 = (value, timeZone) => formatClock(formatTime(value, timeZone));
const formatOpening = (value, timeZone) => `${formatLongDate(value, timeZone)} a las ${formatTime12(value, timeZone)}`;
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const formatDateKey = (key) => capitalize(formatLongDate(`${key}T12:00:00.000Z`, "UTC"));
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = [
  { value: 1, short: "Lun", label: "Lunes", plural: "lunes" },
  { value: 2, short: "Mar", label: "Martes", plural: "martes" },
  { value: 3, short: "Mié", label: "Miércoles", plural: "miércoles" },
  { value: 4, short: "Jue", label: "Jueves", plural: "jueves" },
  { value: 5, short: "Vie", label: "Viernes", plural: "viernes" },
  { value: 6, short: "Sáb", label: "Sábado", plural: "sábados" },
  { value: 0, short: "Dom", label: "Domingo", plural: "domingos" }
];
const joinList = (items) => items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
const formatWeekdays = (values) => capitalize(joinList(WEEKDAYS.filter((d) => values.includes(d.value)).map((d) => d.plural)));
const currentYearMonth = (timeZone = DEFAULT_TZ) => {
  const parts = Object.fromEntries(formatter({ year: "numeric", month: "numeric" }, timeZone).formatToParts(/* @__PURE__ */ new Date()).map((p) => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month) };
};
const monthKey = ({ year, month }) => `${year}-${String(month).padStart(2, "0")}`;
export {
  MONTHS as M,
  WEEKDAYS as W,
  formatDate as a,
  formatOpening as b,
  formatDateTime as c,
  currentYearMonth as d,
  formatWeekdays as e,
  formatTime12 as f,
  formatClock as g,
  formatDateKey as h,
  formatFullDate as i,
  monthKey as m
};
