import catchAsync from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import AppError from "../utils/appError";

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!id) {
      return next(new AppError("User id cannot be empty.", 400));
    }
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("No user found.", 404));
    }
    res.status(200).json({ status: "success", data: { user } });
  }
);

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();
    if (users.length === 0) {
      return next(new AppError("No user found.", 404));
    }
    res.status(200).json({ status: "success", data: { users } });
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!id) {
      return next(new AppError("User id cannot be empty.", 400));
    }
    const users = await User.deleteOne({ _id: id });
    res.status(200).json({ status: "success", data: { users } });
  }
);
