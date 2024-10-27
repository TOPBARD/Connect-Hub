export interface UpdateProfileProps {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  link?: string;
  newPassword?: string;
  currentPassword?: string;
  profileImg?: string | null;
  coverImg?: string | null;
}
