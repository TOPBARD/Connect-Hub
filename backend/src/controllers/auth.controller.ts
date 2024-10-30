import User from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { LoginProps, SignupProps } from "../shared/interface/AuthProps";
import generateTokenAndSetCookie from "../shared/helper/generateTokenAndSetCookie";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { addDefaultFollowers } from "../shared/helper/addDefaultFollowers";
import { emailValidation, passwordMatching } from "../shared/helper/validation";

/**
 * Sign up a new user
 * @body user details (name, email, username, password)
 * @param req Request object
 * @param res Response object with user data
 */
const signupUser = async (req: Request, res: Response) => {
  try {
    const { name, email, username, password }: SignupProps = req?.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Please fill the required fields" });
    }
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
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    if (newUser) {
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
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Log in a user
 * @body object containing user credentials (username, password)
 * @param req Request object
 * @param res Response object with user data and token
 */
const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginProps = req?.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please fill the required fields" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    if (!passwordMatching(password, user.password))
      return res.status(400).json({ error: "Invalid username or password" });

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
 * Log out a user
 * @param req Request object with jwtAuthToken
 * @param res Response object without token
 */
const logoutUser = (req: Request, res: Response) => {
  try {
    res.cookie("jwtAuthToken", "", { maxAge: 0 });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user data for authenticated user
 * @param req Request object with user id
 * @param res Response object with user data
 */

const getUserData = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const user = await User.findById(userId).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export { signupUser, loginUser, logoutUser, getUserData };
