import mongoose from "mongoose";

export interface Users {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  profileImg: string;
  coverImg: string;
  followers?: mongoose.Types.ObjectId[];
  following?: mongoose.Types.ObjectId[];
  bio?: string;
  link?: string;
  likedPost?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface UpdateUserProps {
  name: string;
  email: string;
  username: string;
  currentPassword: string;
  newPassword: string;
  bio: string;
  link: string;
}
