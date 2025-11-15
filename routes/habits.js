import express from "express";
import Habit from "../models/HabitSchema.js";
import HabitLog from "../models/habitLogSchema.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ CREATE HABIT — POST /habits
router.post("/", protect, async (req, res) => {
  try {
    const { habitName, habitType, weekFrequency, palette, order } = req.body;
 
    if (!habitName || !Array.isArray(weekFrequency)) {
      return res.status(400).json({ error: "Missing required habit fields" });
    }

    const today = new Date();
    const progress = {
      totalCompleted: 0,
      weekCounts: new Array(53).fill(0),
    };

    const weeklyTarget = weekFrequency.filter(Boolean).length;

    const newHabit = new Habit({
      habitName,
      habitType,
      weekFrequency,
      weeklyTarget,
      palette,
      order,
      userId: req.user._id,
    });

    newHabit.yearlyProgress.set(today.getFullYear().toString(), progress);

    await newHabit.save();
    res.status(201).json(newHabit);

  } catch (err) {
    console.error("POST /habits failed:", err);
    res.status(500).json({ error: "Failed to create habit", details: err.message });
  }
});

// ✅ GET HABITS — GET /habits
router.get("/", protect, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch habits", details: err.message });
  }
});

// ✅ UPDATE HABIT — PUT /habits/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found or unauthorized" });
    }

    Object.assign(habit, req.body); // Apply updates
    await habit.save();

    res.json(habit);

  } catch (err) {
    res.status(400).json({ error: "Failed to update habit", details: err.message });
  }
});

// ✅ DELETE HABIT — DELETE /habits/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found or unauthorized" });
    }

    await HabitLog.deleteMany({ habitId: habit._id });

    res.json({ message: "Habit and logs deleted", habit });

  } catch (err) {
    res.status(400).json({ error: "Failed to delete habit", details: err.message });
  }
});

export default router;
