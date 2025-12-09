import {
  startOfWeek,
  isSameWeek,
  isBefore,
  isAfter,
} from "date-fns";

export const normalizeUTC = (iso) => {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;

    return new Date(Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate()
    ));
  } catch {
    return null;
  }
};


export const getWeekStartUTC = (date) =>
  startOfWeek(date, { weekStartsOn: 0 });

export const isInCurrentWeekUTC = (date) =>
  isSameWeek(date, new Date(), { weekStartsOn: 0 });

export const validateDateAgainstHabit = (date, habit, userCreatedAt) => {
  const today = normalizeUTC(new Date().toISOString());

  if (isAfter(date, today)) return "FUTURE_DATE";
  if (isBefore(date, normalizeUTC(userCreatedAt))) return "BEFORE_USER_CREATED";
  if (isBefore(date, normalizeUTC(habit.createdAt))) return "BEFORE_HABIT_CREATED";

  return null;
};

export { isAfter, isSameWeek };

export const countExpectedDays = (rangeStart, rangeEnd, weekFrequency) => {
  let count = 0;
  const d = new Date(rangeStart.getTime());
  while (d <= rangeEnd) {
    const weekday = d.getUTCDay();
    if (weekFrequency[weekday]) count++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return count;
};
