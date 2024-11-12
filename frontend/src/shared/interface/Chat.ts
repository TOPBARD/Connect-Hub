export interface Conversations {
  _id: string;
  participants: [
    {
      _id: string;
      username: string;
      profileImg: string;
    }
  ];
  lastMessage: {
    text: string;
    sender: string;
    isImg: Boolean;
    seen: boolean;
  };
  createdAt: Date;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  text: string;
  img: string;
  isImg: Boolean;
  seen: boolean;
  createdAt: Date;
}

export interface MessageData {
  text: string;
  img: string;
  isMock?: boolean;
}
