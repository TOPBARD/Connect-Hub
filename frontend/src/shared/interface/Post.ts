import { User } from "./User";

export interface Posts {
  _id: string;
  user: User;
  text: string;
  img?: string;
  likes?: string[];
  comments?: PostComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostComment {
  _id: string;
  user: User;
  text: string;
}

export interface CreatePost {
  text: string;
  img: string | null;
}
