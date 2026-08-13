import winston from "winston";
import { config } from "@/config";
import path from "path";
import fs from "fs";

// Ensure the log directory exists
const logDirectory = path.join(process.cwd(), config.logger.directory);

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
  fs.writeFileSync(path.join(logDirectory, ".gitignore"), "*");
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

    // Errors passed directly (like logger.error(err)) need to be explicitly parsed
    winston.format.errors({ stack: true }),

    winston.format.printf(function ({
      level,
      message,
      timestamp,
      ...metadata
    }) {
      let log = `${timestamp} [${level}]: ${message}`;

      // Clean up internal winston metadata flags if they exist
      delete metadata[Symbol.for("splat")];

      if (Object.keys(metadata).length > 0) {
        log += `\n${JSON.stringify(metadata, null, 2)}`;
      }

      return log;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logDirectory, config.logger.files.combined),
    }),
    new winston.transports.File({
      level: "error",
      filename: path.join(logDirectory, config.logger.files.error),
    }),
  ],
});

export default logger;
