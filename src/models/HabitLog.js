import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

const HabitLog = mongoose.model("Habit_Log", habitLogSchema, "habitLog");

export default HabitLog;
