import mongoose from "mongoose";

export interface ConversationWithUserData {
  _id: mongoose.Types.ObjectId;
  participants: {
    _id: mongoose.Types.ObjectId;
    username: string;
    profilePic: string;
  };
  lastMessage: {
    sender: mongoose.Types.ObjectId;
    text: string;
    seen: boolean;
  };
  createdAt: Date;
}
