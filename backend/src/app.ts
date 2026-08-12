import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config";
import cors from "cors";
import v1Routes from "./routes/v1";

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
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

app.use(config.apiVersionPrefix.v1, v1Routes);

// TODO: 404

// TODO: ERROR HANDLING

export default app;
