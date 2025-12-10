import Habit from "#models/Habit.js";
import HabitLog from "#models/HabitLog.js";

export const createHabit = async ({
  userId,
  habitName,
  isPositiveHabit,
  weekFrequency,
  palette,
}) => {
  if (
    !habitName ||
    !Array.isArray(weekFrequency) ||
    weekFrequency.length !== 7
  ) {
    throw { status: 400, message: "Invalid habit fields" };
  }

  const weeklyTarget = weekFrequency.filter(Boolean).length;
  const lastHabit = await Habit.findOne({ userId })
    .sort({ order: -1 })
    .select("order");

  const order = lastHabit ? lastHabit.order + 1 : 1;
  const newHabit = await Habit.create({
    userId,
    habitName,
    isPositiveHabit,
    weekFrequency,
    weeklyTarget,
    palette,
    order,
  });

  return {
    id: newHabit._id,
    habitName: newHabit.habitName,
    isPositiveHabit: newHabit.isPositiveHabit,
    weekFrequency: newHabit.weekFrequency,
    weeklyTarget: newHabit.weeklyTarget,
    palette: newHabit.palette,
    order: newHabit.order,
  };
};

export const getHabits = async (userId) => {
  return Habit.find({ userId }).sort({ order: 1 });
};

export const updateHabit = async ({ userId, habitId, updates }) => {
  const allowedFields = ["habitName", "isPositiveHabit", "palette", "order"];
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) throw { status: 404, message: "Habit not found" };

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      habit[key] = updates[key];
    }
  }

  await habit.save();

  return {
    id: habit._id,
    habitName: habit.habitName,
    isPositiveHabit: habit.isPositiveHabit,
    weekFrequency: habit.weekFrequency,
    weeklyTarget: habit.weeklyTarget,
    palette: habit.palette,
    order: habit.order,
  };
};

export const deleteHabit = async ({ userId, habitId }) => {
  const [deletedHabit] = await Promise.all([
    Habit.findOneAndDelete({ _id: habitId, userId }),
    HabitLog.deleteMany({ habitId }),
  ]);

  if (!deletedHabit)
    throw { status: 404, message: "Habit not found or unauthorized" };

  return { message: "Habit and logs deleted" };
};
