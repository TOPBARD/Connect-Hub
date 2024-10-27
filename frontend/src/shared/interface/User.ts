export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profileImg: string;
  coverImg: string;
  followers?: string[];
  following?: string[];
  bio?: string;
  link?: string;
  likedPost?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
