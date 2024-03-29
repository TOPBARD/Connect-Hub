import mongoose from "mongoose";

export interface Post {
  _id: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  text?: string;
  img?: string;
  likes?: mongoose.Types.ObjectId[];
  replies?: PostReply[];
  createdAt: Date;
}

export interface PostReply {
  userId: mongoose.Types.ObjectId;
  text: string;
  userProfilePic?: string;
  username?: string;
}
