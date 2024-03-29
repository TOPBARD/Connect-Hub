import mongoose from "mongoose";

export interface Conversation {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage: LastMessage;
  createdAt: Date;
}

export interface LastMessage {
  sender: mongoose.Types.ObjectId;
  text: string;
  seen: boolean;
}
