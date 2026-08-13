import { config } from "@/config";
import logger from "@/utils/logger";
import app from "./app";
import connectDB from "./database/connection";

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () =>
      logger.info(`Server is running on http://localhost:${config.port}`),
    );

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        logger.error(
          `Port ${config.port} is already in use. Please choose a different port.`,
          error,
        );
      } else {
        logger.error("Error starting the server:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error("Error starting the server:", error);
    // process.exit(1);
  }
};

startServer();
