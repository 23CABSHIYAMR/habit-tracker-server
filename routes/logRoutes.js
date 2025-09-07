const express = require("express");
const HabitLog = require("../models/habitLogSchema");
const Habit = require("../models/HabitSchema");
const router = express.Router();
const { getWeek, getYear } =require("date-fns");

router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const { userId } = req.query;
    if (!date || !userId) {
      return res.status(400).json({ message: "Missing date or userId to fetch" });
    }

    let logs = await HabitLog.find({
      date,
      userId
    }).populate("habitId");

    if (logs.length === 0) {
      const habits = await Habit.find({userId});
      
      const d = new Date(date);
      const weekOfYear = getWeek(d); 
      const year = getYear(d); 
      const newLogs = habits.map((habit) => ({
        userId: habit.userId,    
        habitId: habit._id,
        date,
        weekOfYear,
        year,
        status: "pending",
      }));
      await HabitLog.insertMany(newLogs);
      logs = await HabitLog.find({ date }).populate("habitId");
    }

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing date range" });
    }

    const logs = await HabitLog.find({
      date: { $gt: new Date(startDate), $lt: new Date(endDate) },
    }).populate("habitId");
    res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Mark a date as completed
 * - Creates a log entry if not exists
 */

router.post("/complete", async (req, res) => {
  try {
    const { userId,habitId, date } = req.body;

    if (!habitId || !date || !userId) {
      return res.status(400).json({ message: "Missing habitId, date, or userId" });
    }
    console.log("date->",date);
    let log = await HabitLog.findOne({ habitId, date, userId });
      const d = new Date(date);
      const weekOfYear = getWeek(d); 
      const year = getYear(d); 

    if (!log) {
      log = new HabitLog({
        habitId,
        userId,
        date,
        status: "completed",
        weekOfYear,
        year,
      });
      await log.save();
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


/**
 * Unmark a completed log (set back to pending/inactive)
 * - Removes the log since we only persist completed ones
 */
router.delete("/uncomplete", async (req, res) => {
  try {
    const {userId, habitId, date } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ message: "Missing habitId or date" });
    }
    console.log(req.body);
    await HabitLog.deleteOne({ habitId, date });

    res.json({
      message: "Log removed, fallback to pending/inactive in frontend",
    });
  } catch (err) {
    console.error("Error removing log:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
