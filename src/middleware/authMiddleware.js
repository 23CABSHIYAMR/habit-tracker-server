import "dotenv/config";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function protect(req, res, next) {
  try {
    const token = req.cookies?.token;
    console.log("token in middleware=>",token);
    if (!token) {
      return res.status(401).json({ error: "Not authorized, token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth protect error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
