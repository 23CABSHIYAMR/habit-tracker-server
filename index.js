import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDb } from "./db.js";

import habitRoutes from "#routes/habits.js";
import habitLogRoutes from "#routes/log.js";
import authRoutes from "#routes/auth/index.js";

const port = 5000;
const app = express();

app.use(
  cors({
    origin:process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use("/habits", habitRoutes);
app.use("/habitLog", habitLogRoutes);
app.use("/auth", authRoutes);

connectToDb().then(() => {
  app.listen(port, () => {
    console.log(`Server + DB running on port: ${port}`);
  });
});
