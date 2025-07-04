// routes/logRoutes.js
const express = require("express");
const router = express.Router();
const Habit = require("../models/taskSchema");
const HabitLog = require("../models/habitLogSchema");
const { getYear, getWeek, parseISO } = require("date-fns");

// Helper to extract year and week
function getYearAndWeek(isoDateString) {
  const parsed = parseISO(isoDateString);
  return { year: getYear(parsed), weekOfYear: getWeek(parsed) };
}

// PUT /log/:id - Update log status
router.put("/log/:id", async (req, res) => {
  try {
    const updatedLog = await HabitLog.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updatedLog) return res.status(404).json({ error: "Log not found" });
    res.json(updatedLog);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update log status", details: err.message });
  }
});

// GET /log/date/:date - Create/fetch logs for a specific date
router.get("/date/:date", async (req, res) => {
  try {
    const dateObj = new Date(req.params.date);

    dateObj.setHours(0);
    dateObj.setDate(dateObj.getDate() + 1);
    const isoDate = dateObj.toISOString().split("T")[0];
    const dayIndex = dateObj.getDay();

    const allHabits = await Habit.find();

    await Promise.all(
      allHabits.map((habit) => {
        const status = habit.weekFrequency[dayIndex] ? "pending" : "inactive";
        return HabitLog.updateOne(
          { habitId: habit._id, date: isoDate },
          { $setOnInsert: { status, ...getYearAndWeek(isoDate) } },
          { upsert: true }
        );
      })
    );

    const logs = await HabitLog.find({ date: isoDate }).populate("habitId");
    res.json(logs);
  } catch (err) {
    console.error("GET /log/date/:date failed:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch or create logs", details: err.message });
  }
});

// GET /log/month/:monthKey - Logs for a given month
router.get("/month/:monthKey", async (req, res) => {
  const [year, month] = req.params.monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const end = new Date(year, month, 1).toISOString().split("T")[0];
  try {
    const logs = await HabitLog.find({
      date: { $gte: start, $lte: end },
    }).populate("habitId");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch month logs" });
  }
});

// POST /log/monthInit/:monthKey - Initialize month logs
router.get("/monthInit/:monthKey", async (req, res) => {
  try {
    const [year, month] = req.params.monthKey.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const allHabits = await Habit.find();

    const upsertPromises = [];
    for (let day = 1; day <= end.getDate(); day++) {
      const current = new Date(year, month - 1, day);
      const isoDate = current.toISOString().split("T")[0];
      const dayIndex = current.getDay();
      for (const habit of allHabits) {
        const isActive = habit.weekFrequency[dayIndex];
        // const status = isActive ? "pending" : "inactive";
        const status = "pending";
        const alreadyLogged = await HabitLog.exists({
          habitId: habit._id,
          date: isoDate,
        });
        if (!alreadyLogged) {
          upsertPromises.push(
            HabitLog.updateOne(
              { habitId: habit._id, date: isoDate },
              { $setOnInsert: { status, ...getYearAndWeek(isoDate) } },
              { upsert: true }
            )
          );
        }
      }
    }

    for (let i = 0; i < upsertPromises.length; i += 50) {
      await Promise.all(upsertPromises.slice(i, i + 50));
    }

    res.json({
      message: "Month logs initialized",
      total: upsertPromises.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to initialize month logs", details: err.message });
  }
});

// GET /log/week/:weekKey - Fetch logs for week
router.get("/week/:weekKey", async (req, res) => {
  try {
    const [year, week] = req.params.weekKey.split("-").map(Number);
    const logs = await HabitLog.find({ year, weekOfYear: week }).populate(
      "habitId"
    );
console.log(logs)
if(logs){
      const grouped = {};
    logs.forEach((log) => {
      const id = log?.habitId?._id;
      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(log);
    });

    res.json({ raw: logs, groupedByHabit: grouped });
}else{
   res
      .status(404)
      .json({ error: "logs not found" });
}
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch week logs", details: err.message });
  }
});

// POST /log - Create or update a log and sync yearly progress
router.post("/", async (req, res) => {
  try {
    const { habitId, date, status } = req.body;
    const result = await updateLogWithStreak(habitId, date, status);
    res.status(201).json(result);
  } catch (err) {
    console.error("Failed to update log with streak:", err);
    res.status(500).json({ error: err.message });
  }
});
const updateLogWithStreak = async (habitId, date, newStatus) => {
  const habit = await Habit.findById(habitId);
  if (!habit) throw new Error("Habit not found");

  const weekFreq = habit.weekFrequency;
  const dateObj = new Date(date);
  const isoDate = dateObj.toISOString().split("T")[0];
  const { year, weekOfYear } = getYearAndWeek(isoDate);

  // Step 1: Get previous day's log
  const prevDate = new Date(dateObj);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevIso = prevDate.toISOString().split("T")[0];
  const prevLog = await HabitLog.findOne({ habitId, date: prevIso });
  let streak = newStatus === "completed" ? (prevLog?.streak || 0) + 1 : 0;

  const prevStatus = (
    await HabitLog.findOne({ habitId, date: isoDate })
  )?.status;

  // Step 2: Update current day
  const bulkOps = [
    {
      updateOne: {
        filter: { habitId, date: isoDate },
        update: {
          $set: {
            status: newStatus,
            streak,
            year,
            weekOfYear,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    },
  ];

  // Step 3: Rebuild future streaks
  let currentStreak = streak;
  let nextDate = new Date(dateObj);

  while (true) {
    nextDate.setDate(nextDate.getDate() + 1);
    const nextIso = nextDate.toISOString().split("T")[0];
    const nextLog = await HabitLog.findOne({ habitId, date: nextIso });
    if (!nextLog || nextLog.status !== "completed") break;

    const nextDay = nextDate.getDay();
    const isActive = weekFreq[nextDay];
    if (!isActive) break;

    currentStreak += 1;

    bulkOps.push({
      updateOne: {
        filter: { habitId, date: nextIso },
        update: { $set: { streak: currentStreak } },
      },
    });
  }

  // Step 4: Write to DB
  await HabitLog.bulkWrite(bulkOps);

  // Step 5: Sync yearly progress
  let progress = habit.yearlyProgress.get(year.toString()) || {
    totalCompleted: 0,
    weekCounts: Array(53).fill(0),
  };

  if (prevStatus === "pending" && newStatus === "completed") {
    progress.totalCompleted += 1;
    progress.weekCounts[weekOfYear - 1] += 1;
  } else if (prevStatus === "completed" && newStatus === "pending") {
    progress.totalCompleted -= 1;
    progress.weekCounts[weekOfYear - 1] -= 1;
  }

  habit.yearlyProgress.set(year.toString(), progress);
  habit.markModified("yearlyProgress");
  await habit.save();

  return { habitId, date: isoDate, status: newStatus, streak };
};




module.exports = router;
