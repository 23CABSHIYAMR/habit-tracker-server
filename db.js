const mongoose = require("mongoose");

async function connectToDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://shiyamramesh01:admin@habit-tracker-cluster.4qp1bsn.mongodb.net/habitTrackerDB"
    );
    console.log("db connected");
  } catch (err) {
    console.log("db connection failed due to:", err.message);
    process.exit(1);
  }
}

module.exports = { connectToDb };
