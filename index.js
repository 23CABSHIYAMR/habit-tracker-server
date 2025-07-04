const express = require("express");
const cors = require("cors");
const { connectToDb } = require("./db");
const habitRoutes = require("./routes/habits");
const habitLogRoutes = require("./routes/logRoutes");

const port = 5000;
const app = express();

app.use(
  cors({
    origin: [`http://localhost:5173`,'https://habit-tracker-lemon-nu.vercel.app/'],
  })
);
app.use(express.json());

app.use("/habits", habitRoutes);
app.use("/habitLog", habitLogRoutes);
connectToDb().then(() => {
  app.listen(port, () => {
    console.log("serving and DB is running on port:", port);
  });
});
