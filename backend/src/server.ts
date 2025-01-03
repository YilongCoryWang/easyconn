import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routes/serverRouter";
import runSocketIOServer from "./socketio/runSocketIOServer";

const app = express();
app.use(cors());
app.use("/assets", express.static("public"));
app.use(express.json());
app.use(router);
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
