import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8000,
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/headshotpro",
  },
  apiVersionPrefix: {
    v1: "/api/v1",
  },
  frontendUrl:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : "http://localhost:3000",
  logger: {
    directory: "logs",
    files: {
      error: "error.log",
      combined: "combined.log",
    },
  },
};
