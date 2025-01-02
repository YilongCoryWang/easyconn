import { Router } from "express";
import User from "../models/user";
import crypto from "crypto";

const router = Router();

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = crypto.hash("sha1", req.body.password); //test

  const user = await User.findOne({ email, password });
  if (!user) {
    res.status(404).send({ message: "User Not Found" });
    return;
  }

  const { _id, image, name } = user;
  res.send({ uuid: _id, image, userName: name });
});

export default router;
