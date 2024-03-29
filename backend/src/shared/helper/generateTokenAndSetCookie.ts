import jwt from "jsonwebtoken";
import { Response } from "express";
import mongoose from "mongoose";

const generateTokenAndSetCookie = (
  userId: mongoose.Types.ObjectId,
  res: Response
) => {
  const token = jwt.sign({ userId }, `${process.env.JWT_SECRET}`, {
    expiresIn: "15d",
  });

  res.cookie("jwtAuthToken", token, {
    httpOnly: true, // more secure
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "strict", // CSRF
  });

  return token;
};

export default generateTokenAndSetCookie;
