import { prisma } from '../config/prisma.js';
import {
  addDays,
  dateKey,
  dateOnlyToKey,
  getZonedParts,
  keyToDateOnly,
  minutesToParts,
  timeToMinutes,
  weekdayOf,
  zonedToUtc
} from '../utils/time.js';
import { ensureSchedule } from './scheduleStore.js';

const LOOKAHEAD_DAYS = 90;

const windowFor = (schedule, exceptionsByKey, day) => {
  const exception = exceptionsByKey.get(dateKey(day));
  let window = null;
  if (exception) {
    if (!exception.allowed) return null;
    window = {
      opening: exception.openingTime ?? schedule.openingTime,
      closing: exception.closingTime ?? schedule.closingTime,
      source: 'exception'
    };
  } else if (schedule.allowedWeekdays.includes(weekdayOf(day))) {
    window = { opening: schedule.openingTime, closing: schedule.closingTime, source: 'weekly' };
  }
  return window && timeToMinutes(window.closing) > timeToMinutes(window.opening) ? window : null;
};

const SPECIAL_DATES_DAYS = 45;
const SPECIAL_DATES_LIMIT = 8;

const describeSchedule = (schedule) => ({
  enabled: schedule.enabled,
  weekdays: [...schedule.allowedWeekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)),
  openingTime: schedule.openingTime,
  closingTime: schedule.closingTime
});

const describeMessages = (schedule) => ({
  notice: { title: schedule.noticeTitle, intro: schedule.noticeIntro, outro: schedule.noticeOutro, button: schedule.noticeButton },
  closed: { title: schedule.closedTitle, intro: schedule.closedMessage, outro: schedule.closedOutro, button: schedule.closedButton }
});

const upcomingSpecialDates = (schedule, exceptions, today) => {
  const from = dateKey(today);
  const until = dateKey(addDays(today, SPECIAL_DATES_DAYS));
  return exceptions
    .map((e) => ({ ...e, key: dateOnlyToKey(e.date) }))
    .filter((e) => e.key >= from && e.key <= until)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(0, SPECIAL_DATES_LIMIT)
    .map((e) => ({
      date: e.key,
      allowed: e.allowed,
      openingTime: e.allowed ? e.openingTime ?? schedule.openingTime : null,
      closingTime: e.allowed ? e.closingTime ?? schedule.closingTime : null,
      note: e.note ?? null
    }));
};

const boundary = (day, hhmm, timeZone) => zonedToUtc({ ...day, ...minutesToParts(timeToMinutes(hhmm)) }, timeZone);

export const computeAvailability = (schedule, exceptions, now = new Date()) => {
  const timeZone = schedule.timezone;
  const local = getZonedParts(now, timeZone);
  const today = { year: local.year, month: local.month, day: local.day };
  const exceptionsByKey = new Map(exceptions.map((e) => [dateOnlyToKey(e.date), e]));
  const base = {
    timezone: timeZone,
    serverTime: now.toISOString(),
    schedule: describeSchedule(schedule),
    specialDates: upcomingSpecialDates(schedule, exceptions, today),
    messages: describeMessages(schedule)
  };

  if (!schedule.enabled) return { ...base, isOpen: false, reason: 'MANUAL', opensAt: null, closesAt: null };

  const todayWindow = windowFor(schedule, exceptionsByKey, today);
  if (todayWindow) {
    const opensAt = boundary(today, todayWindow.opening, timeZone);
    const closesAt = boundary(today, todayWindow.closing, timeZone);
    if (now >= opensAt && now < closesAt) {
      return { ...base, isOpen: true, reason: null, opensAt: opensAt.toISOString(), closesAt: closesAt.toISOString() };
    }
  }

  let next = null;
  for (let offset = 0; offset <= LOOKAHEAD_DAYS && !next; offset += 1) {
    const day = addDays(today, offset);
    const window = windowFor(schedule, exceptionsByKey, day);
    if (!window) continue;
    const opensAt = boundary(day, window.opening, timeZone);
    if (opensAt > now) next = { opensAt, closesAt: boundary(day, window.closing, timeZone) };
  }

  const blockedToday = exceptionsByKey.get(dateKey(today))?.allowed === false;
  const reason = blockedToday ? 'BLOCKED_DATE' : todayWindow ? 'OUTSIDE_HOURS' : 'DAY_DISABLED';
  return {
    ...base,
    isOpen: false,
    reason,
    opensAt: next?.opensAt.toISOString() ?? null,
    closesAt: next?.closesAt.toISOString() ?? null
  };
};

export const loadScheduleContext = async (now = new Date(), client = prisma) => {
  const schedule = await ensureSchedule(client);
  const local = getZonedParts(now, schedule.timezone);
  const today = { year: local.year, month: local.month, day: local.day };
  const exceptions = await client.formScheduleException.findMany({
    where: {
      date: {
        gte: keyToDateOnly(dateKey(addDays(today, -1))),
        lte: keyToDateOnly(dateKey(addDays(today, LOOKAHEAD_DAYS + 1)))
      }
    }
  });
  return { schedule, exceptions };
};

export const getAvailability = async (now = new Date(), client = prisma) => {
  const { schedule, exceptions } = await loadScheduleContext(now, client);
  return computeAvailability(schedule, exceptions, now);
};
