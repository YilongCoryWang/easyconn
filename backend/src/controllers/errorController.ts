import AppError from "../utils/appError";
import { NextFunction, Request, Response } from "express";
import { CastError } from "mongoose";

const globelErrorHandler = (
  err: AppError | unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    handleAppError(err, res);
  } else if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    err.name === "CastError"
  ) {
    handleDbCastError(err as CastError, res);
  } else if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    err.code === 11000
  ) {
    handleDbDupKey(err, res);
  } else if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    err.name === "ValidationError"
  ) {
    handleDbValidationError(err, res);
  } else {
    handleDefaultError(err, res);
  }
};

function createDevError(err: unknown, code: number) {
  let message = "";
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    message = err.message;
  }
  const error = new AppError(message, code);

  if (
    err &&
    typeof err === "object" &&
    "stack" in err &&
    typeof err.stack === "string"
  ) {
    error.stack = err.stack;
  }

  if (
    err &&
    typeof err === "object" &&
    "statusCode" in err &&
    typeof err.statusCode === "number"
  ) {
    error.statusCode = err.statusCode;
  }

  if (
    err &&
    typeof err === "object" &&
    "status" in err &&
    typeof err.status === "string"
  ) {
    error.status = err.status;
  }
  return error;
}

function handleDbValidationError(err: unknown, res: Response) {
  if (process.env.NODE_ENV === "development") {
    const error = createDevError(err, 400);
    sendDevError(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let message = "Validation Error";
    if (
      err &&
      typeof err === "object" &&
      "errors" in err &&
      typeof err.errors === "object"
    ) {
      const invalidFields = Object.values(
        err.errors as Record<string, { message: string }>
      )
        .map((el) => el.message)
        .join(" ");
      message = `Validation Error: ${invalidFields}`;
    }
    const error = new AppError(message, 500);
    sendProdError(error, res);
  }
}

function handleDbDupKey(err: unknown, res: Response) {
  if (process.env.NODE_ENV === "development") {
    const error = createDevError(err, 400);
    sendDevError(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let message = "Dupliated key value";
    if (err && typeof err === "object" && "keyValue" in err) {
      message = `Dupliated key value: ${JSON.stringify(err.keyValue)}`;
    }
    const error = new AppError(message, 500);
    sendProdError(error, res);
  }
}

function handleDefaultError(err: unknown, res: Response) {
  if (process.env.NODE_ENV === "development") {
    const error = createDevError(err, 500);
    sendDevError(error, res);
  } else if (process.env.NODE_ENV === "production") {
    const error = new AppError("Something went wrong", 500);
    sendProdError(error, res);
  }
}

function handleAppError(err: AppError, res: Response) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendProdError(err, res);
  }
}

function handleDbCastError(err: CastError, res: Response) {
  if (process.env.NODE_ENV === "development") {
    const message = err.message;
    const error = new AppError(message, 400);
    error.status = "error";
    sendDevError(error, res);
  } else if (process.env.NODE_ENV === "production") {
    const error = new AppError(`Invalid ${err.path}:${err.value}`, 400);
    sendProdError(error, res);
  }
}

function sendDevError(err: AppError, res: Response) {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendProdError(err: AppError, res: Response) {
  if (err.isOperational) {
    // operation error: invalid user input, not found resources...
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // coding error (bug)
    console.error(err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}
export default globelErrorHandler;
