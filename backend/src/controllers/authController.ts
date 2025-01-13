import User from "../models/user";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import util from "util";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

const signToken = (id: string) => {
  //@ts-ignore
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email || !req.body.password) {
      return next(new AppError("Email or password is empty", 400));
    }

    const email = req.body.email;
    const user = await User.findOne({ email }, "+password -__v -friends");
    if (
      !user ||
      !(await user.isCorrectPassword(req.body.password, user.password))
    ) {
      return next(new AppError("Email or password is not correct", 401));
    }

    const { _id, image, name } = user;
    const uuid = _id.toHexString();
    const token = signToken(uuid);
    res.status(200).json({
      status: "success",
      token,
      data: { user: { uuid, image, userName: name } },
    });
  }
);

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
      return next(new AppError("JWT_SECRET or JWT_EXPIRES_IN is missing", 500));
    }

    const token = signToken(newUser._id.toHexString());

    const data = {
      user: {
        email: newUser.email,
        image: newUser.image,
        userName: newUser.name,
        uuid: newUser._id.toHexString(),
      },
    };

    res.status(201).json({ status: "success", token, data });
  }
);

export const auth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to get access.", 401)
      );
    }

    const decoded = (await util.promisify(jwt.verify)(
      token,
      //@ts-ignore
      process.env.JWT_SECRET
    )) as unknown;

    if (decoded && typeof decoded === "object" && "id" in decoded) {
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new AppError("User not found.", 404));
      }
      //if password changed after token was issued which means user found something wrong with the account, then need to log in again
      if ("iat" in decoded && user.hasChangedPassword(decoded.iat as string)) {
        return next(new AppError("Please log in again.", 404));
      }
      req.user = user;
    } else {
      return next(new AppError("Token invalid.", 404));
    }

    next();
  }
);
