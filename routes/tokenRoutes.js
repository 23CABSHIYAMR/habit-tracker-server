import express from "express";

const router = express.Router();

router.post("/set-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token missing" });
  }

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: true,       // ✅ in localhost HTTPS this should be false unless behind proxy
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  }); 

  return res.json({ success: true });
});

router.get("/get-token", (req, res) => {
  const token = req.cookies.authToken;
  return res.json({ token });
});

router.get("/delete-token", (req, res) => {
  res.clearCookie("authToken");
  return res.json({ success: true });
});

export default router;
