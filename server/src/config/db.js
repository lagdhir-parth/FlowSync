import mongoose from "mongoose";
import env from "./env.js";

/**
 * connectDB - Connects to the MongoDB database using Mongoose.
 * Uses the connection string from environment variables and handles connection errors gracefully.
 * @returns {Promise<void>} Resolves when the connection is successful, or exits the process on failure.
 * @throws {Error} If there is an error connecting to the database, the error is logged and the process exits with code 1.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(`${env.MONGODB_URI}/${env.DB_NAME}`);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
