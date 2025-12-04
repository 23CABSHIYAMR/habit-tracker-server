import express from "express";
import * as authController from "#controllers/authController.js";
import protect from "#middleware/authMiddleware.js";

const router = express.Router();

router.post("/sign-up", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);
router.delete("/logout",protect,authController.logout)
export default router;
