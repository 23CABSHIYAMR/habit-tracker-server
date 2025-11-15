import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// --------------------------------------------------
// ✅ Token Generator
// --------------------------------------------------
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// --------------------------------------------------
// ✅ REGISTER (email + password)
// POST /api/users/register
// --------------------------------------------------
router.post("/register", async (req, res) => {
  console.log("Body:", req.body);

  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "User already exists" });

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --------------------------------------------------
// ✅ SIGN-UP (your custom signup method)
// POST /auth/sign-up
// --------------------------------------------------
router.post("/sign-up", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      agreedToTerms,
      oauthSignup,
    } = req.body; 

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "User already exists" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      agreedToTerms,
      oauthSignup,
    });

    return res.status(200).json({
      status: 200,
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --------------------------------------------------
// ✅ LOGIN
// POST /api/users/login
// --------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    console.log(isMatch, user);

    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });

    return res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --------------------------------------------------
// ✅ GET LOGGED-IN USER
// GET /api/users/me
// --------------------------------------------------
router.get("/me", protect, async (req, res) => {
  return res.json(req.user);
});

export default router;
