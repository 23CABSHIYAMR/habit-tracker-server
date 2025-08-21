const mongoose = require("mongoose");

const weekProgressSchema = new mongoose.Schema({
  totalCompleted: { type: Number, default: 0 },
  weekCounts: {
    type: [Number],
    default: () => Array(53).fill(0),
  },
});

const HabitSchema = new mongoose.Schema(
  {
    habitName: { type: String, required: true },
    habitType: { type: String, default: "To-Do" },
    weekFrequency: {
      type: [Boolean],
      default: [true, true, true, true, true, true, true],
    },
    weeklyTarget:{type:Number,default:0}
    ,
    palette: { type: String, default: "#009bff" },
    order: { type: Number, required: true },
    
    yearlyProgress: {
      type: Map,
      of: weekProgressSchema,
      default: {},
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
          }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", HabitSchema, "habits");
