import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    habitName: { type: String, required: true },
    isPositiveHabit: { type: Boolean, default: true },
    weekFrequency: {
      type: [Boolean],
      default: [true, true, true, true, true, true, true],
      validate: (v) => v.length === 7,
    },
    weeklyTarget: {
      type: Number,
      required: true,
    },
    palette: { type: String, default: "#009bff" },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

const Habit = mongoose.model("Habit", habitSchema, "habits");

export default Habit;
