import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter";
import runSocketIOServer from "./socketio/runSocketIOServer";
import { IUser } from "./models/user";
import AppError from "./utils/appError";
import globelErrorHandler from "./controllers/errorController";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  //let server finish all pending requests, then shutdown process abruptly
  process.exit(1);
});

const app = express();
app.use(cors());
app.use(cookieParser());
app.use("/assets", express.static("public"));
app.use(express.json({ limit: "10kb" }));
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 1 hour).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: "Too many reqeusts, please try again later",
});
app.use("/api", limiter); // Apply the rate limiting middleware to /api requests.
app.use("/api/vi/users", userRouter);
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `The requested resource does not exist: ${req.originalUrl}`,
      404
    )
  );
});

app.use(globelErrorHandler);

const httpServer = http.createServer(app);

if (!process.env.DB_URL || !process.env.DB_PASSWORD || !process.env.DB_SERVER) {
  throw new Error("DB_URL, DB_PASSWORD or DB_SERVER is missing");
}

const DB_URL = process.env.DB_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
).replace("<DB_SERVER>", process.env.DB_SERVER);

mongoose
  .connect(DB_URL)
  .then(() => console.log("Server connected to DB successfully!"));

//socketio server
runSocketIOServer(httpServer);

const server = httpServer.listen(9000, () => {
  console.log("Server is running on 9000");
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  //let server finish all pending requests, then shutdown process abruptly
  server.close(() => {
    process.exit(1);
  });
});
