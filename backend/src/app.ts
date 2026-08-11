import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config";
import cors from "cors";

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "stripe-signature",
    ],
  }),
);

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
