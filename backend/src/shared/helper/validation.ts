import bcrypt from "bcryptjs";

export const emailValidation = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const passwordMatching = async (
  currentPassword: string,
  originalPassword: string
) => {
  return await bcrypt.compare(currentPassword, originalPassword);
};
