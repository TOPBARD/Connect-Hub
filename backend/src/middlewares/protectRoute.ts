import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../shared/interface/CustomRequest";

/**
 * Middleware to protect routes by verifying and decoding the JWT from cookies.
 * @param req - The request object with a possible user property.
 * @param res - The response object.
 * @param next - The next function to call the next middleware or route handler.
 * @returns- Calls the next middleware if authentication is successful.
 */
const protectRoute = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Retrieve the JWT from the cookies
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify and decode the JWT using the secret key from environment variables
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

    // Attach the user object to the request for further use
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default protectRoute;
