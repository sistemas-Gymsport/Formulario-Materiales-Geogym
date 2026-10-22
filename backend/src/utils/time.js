const formatterCache = new Map();

const getFormatter = (timeZone) => {
  if (!formatterCache.has(timeZone)) {
    formatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'short'
      })
    );
  }
  return formatterCache.get(timeZone);
};

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export const isValidTimeZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

export const getZonedParts = (date, timeZone) => {
  const parts = Object.fromEntries(getFormatter(timeZone).formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAYS[parts.weekday]
  };
};

const offsetMs = (date, timeZone) => {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - (date.getTime() - date.getMilliseconds());
};

export const zonedToUtc = ({ year, month, day, hour = 0, minute = 0 }, timeZone) => {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let result = guess - offsetMs(new Date(guess), timeZone);
  const second = guess - offsetMs(new Date(result), timeZone);
  if (second !== result) result = second;
  return new Date(result);
};

export const pad = (n, size = 2) => String(n).padStart(size, '0');

export const dateKey = ({ year, month, day }) => `${year}-${pad(month)}-${pad(day)}`;

export const parseDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
};

export const addDays = ({ year, month, day }, amount) => {
  const d = new Date(Date.UTC(year, month - 1, day + amount));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), weekday: d.getUTCDay() };
};

export const weekdayOf = ({ year, month, day }) => new Date(Date.UTC(year, month - 1, day)).getUTCDay();

export const timeToMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToParts = (minutes) => ({ hour: Math.floor(minutes / 60), minute: minutes % 60 });

export const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

export const monthRange = (year, month, timeZone) => {
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  return {
    start: zonedToUtc({ year, month, day: 1 }, timeZone),
    end: zonedToUtc({ year: next.year, month: next.month, day: 1 }, timeZone)
  };
};

export const dateOnlyToKey = (date) => date.toISOString().slice(0, 10);

export const keyToDateOnly = (key) => new Date(`${key}T00:00:00.000Z`);
