import * as habitService from "#services/habitService.js";

export const createHabit = async (req, res) => {
  try {
    const result = await habitService.createHabit({
      userId: req.user._id,
      habitName: req.body.habitName,
      isPositiveHabit: req.body.isPositiveHabit,
      weekFrequency: req.body.weekFrequency,
      palette: req.body.palette,
      order: req.body.order,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getHabits = async (req, res) => {
  try {
    const habits = await habitService.getHabits(req.user._id);
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch habits" });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const result = await habitService.updateHabit({
      userId: req.user._id,
      habitId: req.params.id,
      updates: req.body,
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const result = await habitService.deleteHabit({
      userId: req.user._id,
      habitId: req.params.id,
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
