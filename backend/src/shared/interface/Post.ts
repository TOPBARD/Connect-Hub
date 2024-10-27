import mongoose from "mongoose";

export interface Posts {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  img?: string;
  likes?: mongoose.Types.ObjectId[];
  comments?: PostReply[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface PostReply {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
}
