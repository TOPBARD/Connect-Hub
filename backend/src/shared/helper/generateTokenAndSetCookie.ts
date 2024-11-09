import jwt from "jsonwebtoken";
import { Response } from "express";
import mongoose from "mongoose";

const generateTokenAndSetCookie = (
  userId: mongoose.Types.ObjectId,
  res: Response
) => {
  const token = jwt.sign({ userId }, `${process.env.JWT_SECRET}`, {
    expiresIn: 3600, // 1hr
  });

  res.cookie("jwtAuthToken", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1hr
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

export default generateTokenAndSetCookie;
