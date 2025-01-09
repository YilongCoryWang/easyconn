import mongoose, { Schema, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

// https://mongoosejs.com/docs/typescript/statics-and-methods.html
interface IUser {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  image: string;
  isCalling: boolean;
  friends: (typeof Schema.ObjectId)[];
}

// Put all user instance methods in this interface:
interface IUserMethods {
  isCorrectPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
}
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Email is invalid"],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      minLength: 8,
      select: false,
      validate: {
        // only works for CREATE & SAVE, not work for update
        validator: function (el: string): boolean {
          //typescript takes 'this' as current function, but it actually refers to the current document
          //@ts-ignore
          return el === this.password;
        },
        message: "Password and confirm are not the same",
      },
    },
    image: {
      type: String,
      required: false,
    },
    isCalling: {
      type: Boolean,
      required: true,
      default: false,
    },
    friends: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  //12 is CPU cost which makes the hashed password stronger
  this.password = await bcrypt.hash(this.password, 12);
  console.log(this.password);
  //do not persist passwordConfirm to db
  //@ts-ignore
  this.passwordConfirm = undefined;
  next();
});

userSchema.virtual("uuid").get(function () {
  return this._id.toHexString();
});

userSchema.methods.isCorrectPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
