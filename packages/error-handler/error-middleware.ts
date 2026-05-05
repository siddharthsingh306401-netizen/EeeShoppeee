import { NextFunction, Request, Response } from "express";
import { AppError } from "./index";
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const operationalStatusCode = (err as AppError & { statusCode?: number }).statusCode;
  const operationalMessage = err.message || "Unexpected error";
  const operationalDetails = (err as AppError & { details?: unknown }).details;

  if (err instanceof AppError || typeof operationalStatusCode === "number") {
    console.log(`Error: ${req.method} ${req.url} - ${operationalMessage}`);

    return res.status(operationalStatusCode || 500).json({
      status: "error",
      message: operationalMessage,
      ...(operationalDetails && { details: operationalDetails }),
    });
  }
  console.log("unhandled error: ", err);
  return res.status(500).json({
    error: "something went wrong , please try again later",
  });
};
