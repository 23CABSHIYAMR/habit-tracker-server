const express = require("express");
const router = express.Router();
const Habit = require("../models/HabitSchema");
const HabitLog = require("../models/habitLogSchema");
const protect = require('../middleware/authMiddleware');

// POST /habits - Create a new habit
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
    const weeklyTarget=weekFrequency.filter(Boolean).length;
    const newHabit = new Habit({
      habitName,
      habitType,
      weekFrequency,
      weeklyTarget,
      palette,
      order,
      userId: req.user._id, // Associate habit with logged-in user
    });

    newHabit.yearlyProgress.set(today.getFullYear().toString(), progress);

    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    console.error("POST /habits failed:", err);
    res.status(500).json({ error: "Failed to create habit", details: err.message });
  }
});

// GET /habits - Get all habits for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const allHabits = await Habit.find({ userId: req.user._id }); // Only user's habits
    res.json(allHabits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch habits", details: err.message });
  }
});

// PUT /habits/:id - Update a habit (only if it belongs to the user)
router.put("/:id", protect, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ error: "Habit not found or unauthorized" });

    Object.assign(habit, req.body);
    await habit.save();

    res.json(habit);
  } catch (err) {
    res.status(400).json({ error: "Failed to update habit", details: err.message });
  }
});

// DELETE /habits/:id - Delete a habit and associated logs (if user owns it)
router.delete("/:id", protect, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ error: "Habit not found or unauthorized" });

    await HabitLog.deleteMany({ habitId: habit._id }); // Cascade delete logs

    res.json({ message: "Habit and logs deleted", habit });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete habit", details: err.message });
  }
});

module.exports = router;
