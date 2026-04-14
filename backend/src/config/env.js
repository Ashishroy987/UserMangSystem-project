import dotenv from "dotenv";

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/purple-merit-assessment",
  jwtSecret: process.env.JWT_SECRET || "development-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  seedOnStartup: process.env.SEED_ON_STARTUP !== "false",
};

export default env;
