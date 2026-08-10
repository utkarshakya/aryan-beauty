import mongoose from "mongoose";
import client from "./redisClient.js";
import config from "./env.js";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
