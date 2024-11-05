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
  seen: boolean;
  createdAt: Date;
}

export interface MessagesWithParticipantData {
  participant: {
    _id: string;
    username: string;
    profileImg: string;
  };
  messages: Message[];
}

export interface MessageData {
  text: string;
  img: string;
}
