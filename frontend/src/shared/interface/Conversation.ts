export interface Conversations {
  _id: string;
  participants: string[];
  lastMessage: LastMessage;
  createdAt: Date;
}

export interface LastMessage {
  sender: string;
  text: string;
  seen: boolean;
}
