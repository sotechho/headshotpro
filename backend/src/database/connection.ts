import mongoose from "mongoose";
import { config } from "@/config";
import logger from "@/utils/logger";

const connectDB = async () => {
  try {
    await mongoose.connect(config.database.url);
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Error connecting to the database:", error);
    throw error;
  }
};

mongoose.connection.on("error", (error) => {
  logger.error("Database connection error:", error);
  throw error;
});

mongoose.connection.on("disconnected", () => {
  logger.error("Database connection lost");
  throw new Error("Database connection lost");
});

export default connectDB;
