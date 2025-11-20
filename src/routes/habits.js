import express from "express";
import protect from "#middleware/authMiddleware.js";
import * as habitController from "#controllers/habitController.js";

const router = express.Router();

router.post("/", protect, habitController.createHabit);
router.get("/", protect, habitController.getHabits);
router.put("/:id", protect, habitController.updateHabit);
router.delete("/:id", protect, habitController.deleteHabit);

export default router;
