// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const Habit = require("../models/taskSchema");
const HabitLog = require("../models/habitLogSchema");

// POST /habits - Create a new habit
router.post("/", async (req, res) => {
  try {
    const { habitName, habitType, weekFrequency, palette, order } = req.body;
    if (!habitName || !Array.isArray(weekFrequency)) {
      return res.status(400).json({ error: "Missing required habit fields" });
    }
    const today=new Date();
    const progress={
      totalCompleted:0,
      weekCounts:new Array(53).fill(0)
    }
    const newHabit = new Habit({ habitName, habitType, weekFrequency, palette, order });
    newHabit.yearlyProgress.set(today.getFullYear().toString(),progress)
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    console.error("POST /habits failed:", err);
    res.status(500).json({ error: "Failed to create habit", details: err.message });
  }
});

router.get("/",async(req,res)=>{
  try{
    const AllHabits=await Habit.find();
    res.json(AllHabits);

  }
  catch(err){
    res.status(500).json({ error: "Failed to fetch habit", details: err.message });
  }
})
// PUT /habits/:id - Update a habit
router.put("/:id", async (req, res) => {
  try {
    const updated = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Habit not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update habit", details: err.message });
  }
});

// DELETE /habits/:id - Delete a habit and associated logs
router.delete("/:id", async (req, res) => {
  try { 
    const habitId = req.params.id;
    await HabitLog.deleteMany({ habitId }); // cascade delete logs
    const deleted = await Habit.findByIdAndDelete(habitId);
    if (!deleted) return res.status(404).json({ error: "Habit not found" });

    res.json({ message: "Habit and logs deleted", habit: deleted });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete habit", details: err.message });
  }
});

module.exports = router;
