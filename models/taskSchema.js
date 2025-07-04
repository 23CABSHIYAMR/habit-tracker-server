const mongoose = require("mongoose");

const weekProgressSchema = new mongoose.Schema({
  totalCompleted: { type: Number, default: 0 },
  weekCounts: {
    type: [Number],
    default: () => Array(53).fill(0),
  },
});

const taskSchema = new mongoose.Schema(
  {
    habitName: { type: String, required: true },
    habitType: { type: String, default: "To-Do" },
    weekFrequency: {
      type: [Boolean],
      default: [true, true, true, true, true, true, true],
    },
    palette: { type: String, default: "#009bff" },
    order: { type: Number, required: true },
    
    yearlyProgress: {
      type: Map,
      of: weekProgressSchema,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", taskSchema, "habits");
