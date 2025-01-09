import User from "../models/user";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const signToken = (id: string) => {
  //@ts-ignore
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const login = async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send({ message: "Email or password is empty" });
    return;
  }

  const email = req.body.email;
  const user = await User.findOne({ email }, "+password -__v -friends");
  if (
    !user ||
    !(await user.isCorrectPassword(req.body.password, user.password))
  ) {
    res.status(401).send({ message: "Email or password not correct" });
    return;
  }

  const { _id, image, name } = user;
  const uuid = _id.toHexString();
  const token = signToken(uuid);
  // res.send({ uuid: _id, image, userName: name });
  res.status(200).json({
    status: "success",
    token,
    data: { user: { uuid, image, userName: name } },
  });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
      throw new Error("JWT_SECRET or JWT_EXPIRES_IN is missing");
    }

    const token = signToken(newUser._id.toHexString());

    res.status(201).json({ status: "success", token, data: { user: newUser } });
  } catch (error) {
    console.error(error);
  }
};
