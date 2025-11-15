import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDb } from "./db.js";

// Routes
import habitRoutes from "./routes/habits.js";
import habitLogRoutes from "./routes/logRoutes.js";
import userRoute from "./routes/userRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import authRoutes from "./auth/authRoutes.js";

const port = 5000;
const app = express();

// CORS
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
app.use("/users", userRoute);
app.use("/api", tokenRoutes);
app.use("/auth", authRoutes);
 
// Start Server
connectToDb().then(() => {
  app.listen(port, () => {
    console.log(`Server + DB running on port: ${port}`);
  });
});
