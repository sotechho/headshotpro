import app from "./app";
import { config } from "@/config";

const startServer = () => {
  try {
    const server = app.listen(config.port, () =>
      console.log(`Server is running on http://localhost:${config.port}`),
    );

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${config.port} is already in use. Please choose a different port.`,
        );
      } else {
        console.error("Error starting the server:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
