export interface Post {
  _id: string;
  postedBy: string;
  text?: string;
  img?: string;
  likes?: string[];
  replies?: PostReply[];
  createdAt: Date;
}

export interface PostReply {
  userId: string;
  text: string;
  userProfilePic?: string;
  username?: string;
}
