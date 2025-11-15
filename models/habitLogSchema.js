import mongoose from "mongoose";
import { getWeek, getYear, parseISO } from "date-fns";

const habitLogSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

     date:     { type: String, required: true },

    status: {
      type: String,
      enum: ["completed", "inactive", "pending"],
      default: "pending",
    },

    streak: { type: Number, default: 0 },

    year:       { type: Number, required: true },
    weekOfYear: { type: Number, required: true },

    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// ✅ Ensure each habit has only one log per date
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

// ✅ Auto-fill week/year when saving if missing
habitLogSchema.pre("save", function (next) {
  if (!this.year || !this.weekOfYear) {
    const parsed = parseISO(this.date);
    this.year = getYear(parsed);
    this.weekOfYear = getWeek(parsed);
  }
  next();
});

const HabitLog = mongoose.model("Habit_Log", habitLogSchema, "habitLog");

export default HabitLog;
