import catchAsync from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
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
    await User.deleteOne({ _id: id });
    res
      .status(200)
      .json({ status: "success", message: `User ${id} has been deleted` });
  }
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/img/user");
  },
  filename: function (req, file, cb) {
    const extension = (function () {
      if (file.mimetype.split("/")[1] === "svg+xml") {
        return ".svg";
      } else {
        return "." + file.mimetype.split("/")[1];
      }
    })();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Only image types are allowed", 400));
}
const upload = multer({ storage, fileFilter });
export const uploadProfileImage = upload.single("image");

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const body = req.body;
    const r = req as typeof req & { file: File };
    const fields: { [key: string]: string } = {};
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        fields[key] = body[key];
      }
    }
    if (r.file) {
      fields["image"] = r.file.filename;
    }
    const updatedUser = await User.findByIdAndUpdate(id, fields, {
      new: true,
    }).populate({ path: "friends", select: "-__v -friends -password" });

    res.status(200).json({ status: "success", data: { user: updatedUser } });
  }
);
