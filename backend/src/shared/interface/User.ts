import mongoose from "mongoose";

export interface UserResponse {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  profileImg: string;
  coverImg: string;
  link: string;
  followers?: mongoose.Types.ObjectId[];
  following?: mongoose.Types.ObjectId[];
  bio?: string;
  isFrozen?: boolean;
}
