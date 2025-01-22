import User from "../models/user";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import util from "util";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import sendEmail from "../utils/sendEmail";

const signToken = (payload: object, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

function setCookie(res: Response, expiresIn: string, token: string) {
  return res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000),
  });
}

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

    if (
      !process.env.JWT_SECRET ||
      !process.env.JWT_EXPIRES_IN ||
      !process.env.JWT_COOKIE_EXPIRES_IN
    ) {
      return next(
        new Error(
          "JWT_SECRET, JWT_EXPIRES_IN or JWT_COOKIE_EXPIRES_IN is missing"
        )
      );
    }
    const token = signToken(
      { id: uuid },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN
    );
    res = setCookie(res, process.env.JWT_COOKIE_EXPIRES_IN, token);
    res.status(200).json({
      status: "success",
      token,
      data: { user: { uuid, image, email, userName: name } },
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
      role: req.body.role,
    });

    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
      return next(new Error("JWT_SECRET or JWT_EXPIRES_IN is missing"));
    }

    const data = {
      user: {
        email: newUser.email,
        image: newUser.image,
        userName: newUser.name,
        uuid: newUser._id.toHexString(),
      },
    };

    if (!process.env.JWT_COOKIE_EXPIRES_IN) {
      return next(
        new AppError(
          "Environment variable JWT_COOKIE_EXPIRES_IN doesn't exist",
          500
        )
      );
    }
    res.status(201).json({ status: "success", data });
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

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return next(
    new AppError("You are not authorized to perform this operation.", 401)
  );
};

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    if (!email) {
      return next(new AppError("User email cannot be empty.", 400));
    }
    const user = await User.findOne({ email: email }, "password email");
    if (!user) {
      return next(new AppError("Your email cannot be found.", 400));
    }

    if (!process.env.PASSWORD_RESET_EXPIRES_IN) {
      return next(new Error("PASSWORD_RESET_EXPIRES_IN doesn't exist."));
    }

    //make token only valid one time: https://www.jbspeakr.cc/howto-single-use-jwt/
    const resetToken = signToken(
      { id: user._id },
      user.password,
      process.env.PASSWORD_RESET_EXPIRES_IN
    );
    const resetLink = `${process.env.FRONTEND_SERVER}/reset-password/${resetToken}`;

    try {
      const options = {
        from: "admin <admin@t.tt>",
        to: user.email,
        subject: "Reset Password",
        content: resetLink,
      };
      await sendEmail(options);
    } catch (error) {
      return next(new AppError(`Cannot send email: ${error}`, 500));
    }
    res.status(200).json({
      status: "success",
      message: "Password reset link send to user's email address",
    });
  }
);

function getTokenPayload(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;
    if (!token) {
      return next(new AppError("Token cannot be empty.", 400));
    }

    const { id } = getTokenPayload(token);
    if (!id) {
      return next(new AppError("Token is invalid.", 400));
    }

    const user = await User.findById(id, "password");
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    //make token only valid one time: https://www.jbspeakr.cc/howto-single-use-jwt/
    await util.promisify(jwt.verify)(
      token,
      //@ts-ignore
      user.password
    );

    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    if (!password || !passwordConfirm) {
      return next(
        new AppError("User password or password confirm cannot be empty.", 400)
      );
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    if (!process.env.JWT_COOKIE_EXPIRES_IN) {
      return next(
        new AppError(
          "Environment variable JWT_COOKIE_EXPIRES_IN doesn't exist",
          500
        )
      );
    }

    res.status(200).json({ status: "success", message: "Password updated" });
  }
);
