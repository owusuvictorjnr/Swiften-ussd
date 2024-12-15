import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected successfully...");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connect;
