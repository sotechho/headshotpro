import { config } from "@/config";
import v1Routes from "@/routes/v1";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { errorResponse } from "@/utils/responses";
import { errorHandler } from "./middlewares/error.middleware";

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

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

// TODO: ROUTES
app.use(config.apiVersionPrefix.v1, v1Routes);

// 404 Routes
app.use(function (req: Request, res: Response) {
  return errorResponse(res, 404, "Route not found", [
    {
      path: req.originalUrl,
      message: "Route not found",
    },
  ]);
});

// ERROR HANDLING
app.use(errorHandler);

export default app;
