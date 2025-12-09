import Habit from "#models/Habit.js";
import HabitLog from "#models/HabitLog.js";
import {
  normalizeUTC,
  isInCurrentWeekUTC,
  validateDateAgainstHabit,
  countExpectedDays,
  isAfter,
  isSameWeek,
} from "#utils/date.js";

export const getLogsForDate = async ({ user, date }) => {
  const requestedDate = normalizeUTC(date);
  if (!requestedDate) throw { status: 400, message: "Invalid UTC date" };

  const today = normalizeUTC(new Date().toISOString());
  const isCurrentWeek = isInCurrentWeekUTC(requestedDate);

  const habits = await Habit.find({ userId: user._id }).sort({ order: 1 });

  const completedLogs = await HabitLog.find({
    userId: user._id,
    date: requestedDate,
  }).lean();

  const completedMap = {};
  completedLogs.forEach((log) => {
    completedMap[log.habitId.toString()] = true;
  });

  const results = [];

  for (const habit of habits) {
    const validation = validateDateAgainstHabit(
      requestedDate,
      habit,
      user.createdAt
    );

    const weekday = requestedDate.getUTCDay();
    const isActive =
      validation === null && habit.weekFrequency[weekday] === true;

    const isCompleted = completedMap[habit._id.toString()] === true;

    const isEditable =
      isCurrentWeek && !isAfter(requestedDate, today) && validation === null;

    results.push({
      habitId: habit._id,
      habitName: habit.habitName,
      isPositiveHabit:habit.isPositiveHabit,
      palette: habit.palette,
      order: habit.order,
      weekFrequency: habit.weekFrequency,
      date: requestedDate,
      isActive,
      isCompleted,
      isEditable,
    });
  }

  return results;
};

export const getLogsInRange = async ({ user, startDate, endDate }) => {
  let query = { userId: user._id };

  if (startDate && endDate) {
    const s = normalizeUTC(startDate);
    const e = normalizeUTC(endDate);
    if (!s || !e) throw { status: 400, message: "Invalid range" };

    query.date = { $gte: s, $lte: e };
  } else if (startDate) {
    const s = normalizeUTC(startDate);
    if (!s) throw { status: 400, message: "Invalid startDate" };

    query.date = s;
  } else if (endDate) {
    const e = normalizeUTC(endDate);
    if (!e) throw { status: 400, message: "Invalid endDate" };

    query.date = e;
  }

  return await HabitLog.find(query).lean();
};

export const completeHabitForDate = async ({ user, habitId, date }) => {
  const habit = await Habit.findOne({ _id: habitId, userId: user._id });
  if (!habit) throw { status: 404, message: "Habit not found" };

  const d = normalizeUTC(date);
  if (!d) throw { status: 400, message: "Invalid date" };

  const today = normalizeUTC(new Date().toISOString());

  if (!isSameWeek(d, today, { weekStartsOn: 0 }))
    throw { status: 403, message: "Cannot modify past weeks" };

  if (isAfter(d, today))
    throw { status: 400, message: "Cannot modify future days" };

  const validation = validateDateAgainstHabit(d, habit, user.createdAt);
  if (validation) throw { status: 400, message: `Invalid date: ${validation}` };

  return await HabitLog.findOneAndUpdate(
    { userId: user._id, habitId, date: d },
    { status: true },
    { upsert: true, new: true }
  );
};

export const uncompleteHabitForDate = async ({ user, habitId, date }) => {
  const habit = await Habit.findOne({ _id: habitId, userId: user._id });
  if (!habit) throw { status: 404, message: "Habit not found" };

  const d = normalizeUTC(date);
  if (!d) throw { status: 400, message: "Invalid date" };

  const today = normalizeUTC(new Date().toISOString());

  if (!isSameWeek(d, today, { weekStartsOn: 0 }))
    throw { status: 403, message: "Cannot modify past weeks" };

  if (isAfter(d, today))
    throw { status: 400, message: "Invalid future modification" };

  await HabitLog.deleteOne({ userId: user._id, habitId, date: d });

  return { success: true };
};
export const getAnalyticsForRange = async ({ user, startDate, endDate }) => {
  const s = normalizeUTC(startDate);
  const e = normalizeUTC(endDate);
  if (!s || !e) throw { status: 400, message: "Invalid date range" };

  // Fetch user's habits
  const habits = await Habit.find({ userId: user._id })
    .select("_id habitName palette weekFrequency isPositiveHabit")
    .lean();

  // Fetch logs in the range
  const logs = await HabitLog.find({
    userId: user._id,
    date: { $gte: s, $lte: e },
  }).lean();

  // Map logs by habitId
  const grouped = {};
  logs.forEach((log) => {
    const hid = log.habitId.toString();
    if (!grouped[hid]) grouped[hid] = { completed: 0};
    if (log.status === true) grouped[hid].completed++;
  });

  // Final analytics array
  const result = habits.map((habit) => {
    const hid = habit._id.toString();
    const completed = grouped[hid]?.completed || 0;

    const effectiveStart = new Date(Math.max(s.getTime(), habit.createdAt.getTime()));
    const freq = countExpectedDays(effectiveStart,e,habit.weekFrequency) || 0;
    const percentage = freq > 0 ? (completed / freq) * 100 : 0;

    return {
      habitId: hid,
      habitName: habit.habitName,
      isPositiveHabit: habit.isPositiveHabit,
      palette: habit.palette,

      completedHabitsInRange: completed,
      habitFreqInRange: freq,
      completionPercentage: percentage,
    };
  });

  return result;
};
