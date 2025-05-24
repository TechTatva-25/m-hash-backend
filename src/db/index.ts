import mongoose from "mongoose";

import { Logger } from "../libs/logger";

export async function connectToDatabase(logger: Logger): Promise<void> {
  mongoose.connection.on("connected", () => {
    logger.logger.info("Connected to MongoDB");
  });
  mongoose.connection.on("open", () => {
    logger.logger.info("Connection to MongoDB is open");
  });
  mongoose.connection.on("disconnected", () => {
    logger.logger.info("Disconnected from MongoDB");
  });
  mongoose.connection.on("reconnected", () => {
    logger.logger.info("Reconnected to MongoDB");
  });
  mongoose.connection.on("error", (err) => {
    logger.logger.error(
      `MongoDB connection error: ${JSON.stringify(err, null, 2)}`
    );
  });
  try {
    await mongoose.connect(
      process.env.MONGO_DB_URI ?? "mongodb://localhost:27017/test",
      {
        dbName: process.env.MONGO_DB_NAME ?? "test",
      }
    );
  } catch (err) {
    logger.logger.error(err);
    process.exit(1);
  }
}
