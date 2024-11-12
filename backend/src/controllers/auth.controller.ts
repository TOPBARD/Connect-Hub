import User from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { LoginProps, SignupProps } from "../shared/interface/AuthProps";
import generateTokenAndSetCookie from "../shared/helper/generateTokenAndSetCookie";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { addDefaultFollowers } from "../shared/helper/addDefaultFollowers";
import { emailValidation } from "../shared/helper/validation";

/**
 * Handle user signup.
 * @param req - Express request object containing name, email, username, and password in the body.
 * @param res - Express response object to send back the created user details or error.
 *  @returns - A response with the newly create user or an error message
 */
const signupUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, username, password }: SignupProps = req?.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Please fill the required fields" });
    }

    // Validate email format
    if (!emailValidation(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim().replace(/\s+/g, " "),
      email,
      username,
      password: hashedPassword,
    });

    // Save the new user and add default followers
    addDefaultFollowers(newUser._id.toString());
    await newUser.save();

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
      link: newUser.link,
      bio: newUser.bio,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Handle user login.
 * @param req - Express request object containing username and password in the body.
 * @param res - Express response object to send back the user details and token or error.
 * @returns - A response with the user details and a access token or an error message
 */
const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, password }: LoginProps = req?.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Please fill the required fields" });
    }

    const user = await User.findOne({ username });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    // Verify the password
    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });

    // Generate JWT token and set it as a cookie
    generateTokenAndSetCookie(user.id, res);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      link: user.link,
      followers: user.followers,
      following: user.following,
      likedPosts: user.likedPosts,
      bio: user.bio,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Handle user logout
 * @param req - Express request object.
 * @param res - Express response object to send back a success message or error.
 * @returns - A response with the logout successful message or an error message
 */
const logoutUser = (req: Request, res: Response): Response => {
  try {
    res.cookie("jwtAuthToken", "", { maxAge: 0 });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Fetch authenticated user's data.
 * @param req - Custom request object containing the user ID.
 * @param res - Express response object to send back user data or error.
 * @returns - A response with the authenticated user data or an error message
 */
const getUserData = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req?.user?._id;

    // Find the user by ID and exclude the password field
    const user = await User.findById(userId).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export { signupUser, loginUser, logoutUser, getUserData };
