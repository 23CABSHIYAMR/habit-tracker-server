import express from "express";
import protect from "#middleware/authMiddleware.js";
import * as logController from "#controllers/logController.js";

const router = express.Router();

router.get("/date/:date", protect, logController.getLogsForDate);
router.get("/range", protect, logController.getLogsInRange);
router.post("/complete", protect, logController.completeHabit);
router.delete("/uncomplete", protect, logController.uncompleteHabit);

export default router;
