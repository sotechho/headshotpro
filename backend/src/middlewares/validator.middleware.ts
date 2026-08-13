import { config } from "@/config";
import logger from "@/utils/logger";
import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export function validateRequest(schema: z.ZodType<unknown>) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      const validated = z.parse(schema, req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            path: issue.path.join("."),
            message: issue.message,
          };
        });

        if (config.env === "development") {
          logger.error("Validation error", error);
        }

        return next(errors);
      }

      if (config.env === "development") {
        logger.error("Failed request validation", error);
      }

      next(error);
    }
  };
}
