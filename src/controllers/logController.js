import * as logService from "#services/logService.js";

export const getLogsForDate = async (req, res) => {
  try {
    const result = await logService.getLogsForDate({
      user: req.user,
      date: req.params.date,
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getLogsInRange = async (req, res) => {
  try {
    const result = await logService.getLogsInRange({
      user: req.user,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const completeHabit = async (req, res) => {
  try {
    const result = await logService.completeHabitForDate({
      user: req.user,
      habitId: req.body.habitId,
      date: req.body.date,
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const uncompleteHabit = async (req, res) => {
  try {
    const result = await logService.uncompleteHabitForDate({
      user: req.user,
      habitId: req.body.habitId,
      date: req.body.date,
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const analyticsForRange = async (req, res) => {
  try {
    const result = await logService.getAnalyticsForRange({
      user: req.user,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      prevStartDate: req.query.prevStart,
      prevEndDate: req.query.prevEnd,
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
