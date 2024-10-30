export interface UpdateProfileProps {
  name: string;
  username: string;
  email: string;
  bio: string;
  link: string;
  newPassword: string;
  currentPassword: string;
}

export interface UpdateUserImgProps {
  profileImg: string | null;
  coverImg: string | null;
}
