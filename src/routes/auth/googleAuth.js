import express from "express";
import passport from "#auth/googleStrategy.js";
import * as authController from "#controllers/authController.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`,
    session: false,
  }),
  authController.oauthRedirect
);

export default router;
