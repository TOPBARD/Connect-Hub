export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePic?: string;
  followers?: string[];
  following?: string[];
  bio?: string;
  isFrozen?: boolean;
}
