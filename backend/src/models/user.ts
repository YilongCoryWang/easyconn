import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  friends: [
    {
      userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
      },
      isCalling: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
