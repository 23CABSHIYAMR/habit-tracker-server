import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDb } from "./db.js";

import habitRoutes from "#routes/habits.js";
import habitLogRoutes from "#routes/log.js";
import tokenRoutes from "#routes/token.js";
import authRoutes from "#routes/auth/index.js";

const port = 5000;
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routing
app.use("/habits", habitRoutes);
app.use("/habitLog", habitLogRoutes);
app.use("/api", tokenRoutes);
app.use("/auth", authRoutes);
 
// Start Server
connectToDb().then(() => {
  app.listen(port, () => {
    console.log(`Server + DB running on port: ${port}`);
  });
});
