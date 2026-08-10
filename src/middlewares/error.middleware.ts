import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/api.js";
import { runErrorHandler } from '../utils/errorHandler.js';

export const createErrorMiddleware =
  (errorHandlerSnippet?: string) =>
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    if (errorHandlerSnippet) {
      const result = runErrorHandler(errorHandlerSnippet);

      if (result?.rethrow) {
        throw err;
      }

      if (result?.handled || result?.message) {
        res.status(result.statusCode ?? 500).json({
          message: result.message ?? err.message,
          code: result.code,
          details: result.details,
        });
        return;
      }
    }

    if (err instanceof ApiError) {
      res.status(err.statusCode).json({
        message: err.message,
        code: err.code,
        details: err.details,
      });
      return;
    }

    res.status(500).json({
      message: err.message || "Internal server error",
    });
  };

export const errorMiddleware = createErrorMiddleware();
