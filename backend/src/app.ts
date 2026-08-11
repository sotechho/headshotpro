import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config";

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// TODO: CORS

// TODO: ROUTES
app.get(config.apiVersionPrefix.concat("/health"), (req, res) => {
  res.status(200).json({
    message: "Server is running",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

// TODO: 404

// TODO: ERROR HANDLING

export default app;
