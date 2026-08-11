import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8000,
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/headshotpro",
  },
};
