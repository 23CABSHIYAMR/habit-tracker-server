import express from "express";
import HabitLog from "../models/habitLogSchema.js";
import Habit from "../models/HabitSchema.js";
import { getWeek, getYear } from "date-fns";

const router = express.Router();

// ------------------------------------------------------------
// ✅ Utility: Convert date string safely
// ------------------------------------------------------------
const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

// ------------------------------------------------------------
// ✅ GET logs for a specific date (auto-create missing logs)
// ------------------------------------------------------------
router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const { userId } = req.query;

    if (!userId || !date)
      return res.status(400).json({ message: "Missing userId or date" });

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate)
      return res.status(400).json({ message: "Invalid date format" });

    // ✅ Find logs for this user & date
    let logs = await HabitLog.find({
      userId,
      date: normalizedDate,
    }).populate("habitId");

    // ✅ Auto-create logs if missing
    if (logs.length === 0) {
      const habits = await Habit.find({ userId });

      const d = new Date(normalizedDate);
      const weekOfYear = getWeek(d);
      const year = getYear(d);

      const newLogs = habits.map((habit) => ({
        userId,
        habitId: habit._id,
        date: normalizedDate,
        status: "pending",
        weekOfYear,
        year,
      }));

      await HabitLog.insertMany(newLogs);

      logs = await HabitLog.find({
        userId,
        date: normalizedDate,
      }).populate("habitId");
    }

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------------------------------
// ✅ GET logs for a date range
// ------------------------------------------------------------
router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    if (!userId || !startDate || !endDate)
      return res.status(400).json({ message: "Missing userId or date range" });

    const s = new Date(startDate);
    const e = new Date(endDate);

    if (isNaN(s) || isNaN(e))
      return res.status(400).json({ message: "Invalid date range" });

    const logs = await HabitLog.find({
      userId,
      date: { $gte: s, $lte: e },
    }).populate("habitId");

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------------------------------------------------
// ✅ Complete a habit for a date
// ------------------------------------------------------------
router.post("/complete", async (req, res) => {
  try {
    const { userId, habitId, date } = req.body;

    if (!userId || !habitId || !date)
      return res
        .status(400)
        .json({ message: "Missing userId, habitId or date" });

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate)
      return res.status(400).json({ message: "Invalid date format" });

    const d = new Date(normalizedDate);
    const weekOfYear = getWeek(d);
    const year = getYear(d);

    let log = await HabitLog.findOne({
      userId,
      habitId,
      date: normalizedDate,
    });

    if (!log) {
      log = await HabitLog.create({
        userId,
        habitId,
        date: normalizedDate,
        status: "completed",
        weekOfYear,
        year,
      });
    } else {
      log.status = "completed";
      await log.save();
    }

    res.json(log);
  } catch (err) {
    console.error("Error marking completed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------------------------------
// ✅ Un-complete a habit → set back to pending
// ------------------------------------------------------------
router.delete("/uncomplete", async (req, res) => {
  try {
    const { userId, habitId, date } = req.body;

    if (!userId || !habitId || !date)
      return res
        .status(400)
        .json({ message: "Missing userId, habitId or date" });

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate)
      return res.status(400).json({ message: "Invalid date format" });
 
    const log = await HabitLog.findOne({
      userId,
      habitId,
      date: normalizedDate,
    });

    if (log) {
      log.status = "pending";
      await log.save();
    }

    res.json({ message: "Updated to pending" });
  } catch (err) {
    console.error("Error uncompleting habit:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
