import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    bio: {
      type: String,
      default:
        "Welcome to Connect-Hub! A all in one place to share your adventures 🌟, connect with friends 🌍, chat 💬, and more. Let's explore together! 🚀 Please add an appropriate bio to let others know about you.",
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
