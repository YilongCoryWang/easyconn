import fs from "fs";
import mongoose from "mongoose";
import User from "../src/models/user";

if (!process.env.DB_URL || !process.env.DB_PASSWORD || !process.env.DB_SERVER) {
  throw new Error("DB_URL or DB_PASSWORD is missing");
}

const DB_URL = process.env.DB_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
).replace("<DB_SERVER>", process.env.DB_SERVER);

mongoose
  .connect(DB_URL)
  .then(async () => {
    console.log("DB connected successfully.");
    if (process.argv[2] === "--import") {
      await importData();
      console.log("Seed imported successfully.");
    } else if (process.argv[2] === "--delete") {
      await deleteData();
      console.log("Seed removed successfully.");
    }
  })
  .catch((e) => console.error(e))
  .finally(() => process.exit());

const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, "utf-8")
);

const importData = async () => {
  try {
    await User.create(usersData);
  } catch (error) {
    console.error(error);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
  } catch (error) {
    console.error(error);
  }
};
