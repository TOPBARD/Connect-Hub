export interface ConversationWithUserData {
  _id: string;
  participants: {
    _id: string;
    username: string;
    profilePic: string;
  }[];
  lastMessage: {
    sender: string;
    text: string;
    seen?: boolean;
  };
  createdAt?: Date;
}

export interface MockConversation extends ConversationWithUserData {
  mock?: boolean;
}
