require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { connectToDb } = require("./db");
const habitRoutes = require("./routes/habits");
const habitLogRoutes = require("./routes/logRoutes");
const userRoute = require("./routes/userRoutes");
const port = 5000;
const app = express();


app.use(cors(  ));
app.use(express.json());

app.use("/habits", habitRoutes);
app.use("/habitLog", habitLogRoutes);
app.use("/users",userRoute);
connectToDb().then(() => {
  app.listen(port, () => {
    console.log("serving and DB is running on port:", port);
  });
});
