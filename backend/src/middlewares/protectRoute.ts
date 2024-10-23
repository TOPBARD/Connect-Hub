// Middleware for Authentication

import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../shared/interface/CustomRequest";

const protectRoute = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string = req?.cookies?.jwtAuthToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(
      token,
      `${process.env.JWT_SECRET}`
    ) as jwt.JwtPayload;
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(decoded?.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default protectRoute;
