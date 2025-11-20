import express from "express";

const router = express.Router();

const COOKIE_NAME = "token";

router.post("/set-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token missing" });
  }

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.json({ success: true });
});

router.get("/get-token", (req, res) => {
  const token = req.cookies[COOKIE_NAME] || null;
  return res.json({ token });
});

router.get("/delete-token", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none" ,
    path: "/",
  });
  return res.json({ success: true });
});

export default router;
