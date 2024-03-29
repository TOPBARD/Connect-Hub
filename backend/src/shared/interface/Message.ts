import mongoose from "mongoose";

export interface Message {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text?: string;
  seen?: boolean;
  img?: string;
  createdAt: Date;
}
