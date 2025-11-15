import "dotenv/config";
import mongoose from "mongoose";

export async function connectToDb() {
  try {
    await mongoose.connect(
      process.env.MONGODB_SRV
    );
    console.log("db connected");
  } catch (err) {
    console.log("db connection failed due to:", err.message);
    process.exit(1);
  }
}
 
