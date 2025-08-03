const mongoose = require("mongoose");
const { getWeek, getYear, parseISO } = require("date-fns");
const habitLogSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit" },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["completed", "inactive", "pending"],
      default: "pending",
    },    streak: { type: Number, default: 0 },
    year: { type: Number, required: true },
    weekOfYear: { type: Number, required:true },
    updatedAt: { type: Date, default: Date.now },
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
}
  },
  { timestamps: true }
);
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

habitLogSchema.pre("save", function (next) {
  if (!this.year || !this.weekOfYear) {
    const parsedDate = parseISO(this.date); 
    this.year = getYear(parsedDate);
    this.weekOfYear = getWeek(parsedDate);
  }
  next();
});


module.exports = mongoose.model("Habit_Log", habitLogSchema, "habitLog");
