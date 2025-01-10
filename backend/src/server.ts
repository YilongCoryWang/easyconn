import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter";
import runSocketIOServer from "./socketio/runSocketIOServer";
import { IUser } from "./models/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const app = express();
app.use(cors());
app.use("/assets", express.static("public"));
app.use(express.json({ limit: "10kb" }));
app.use("/api/vi/users", userRouter);

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

httpServer.listen(9000, () => {
  console.log("Server is running on 9000");
});
