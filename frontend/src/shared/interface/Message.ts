export interface Messages {
  _id: string;
  conversationId: string;
  sender: string;
  text?: string;
  seen?: boolean;
  img?: string;
  createdAt: Date;
}
