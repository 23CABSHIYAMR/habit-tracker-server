import express from "express";
import passport from "./googleStrategy.js";

const router = express.Router();

// ✅ Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Step 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`,
    session: false, // ✅ recommended (you are using JWT, not sessions)
  }),
  (req, res) => {
    const token = req.user.token;

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth?token=${encodeURIComponent(
        token
      )}`
    );
  }
);
 
export default router;
