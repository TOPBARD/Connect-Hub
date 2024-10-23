import User from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { LoginProps, SignupProps } from "../shared/interface/AuthProps";
import generateTokenAndSetCookie from "../shared/helper/generateTokenAndSetCookie";
import { CustomRequest } from "../shared/interface/CustomRequest";

/**
 * Sign up a new user
 * @param req Request object containing user details (name, email, username, password)
 * @param res Response object
 */
const signupUser = async (req: Request, res: Response) => {
  try {
    const { name, email, username, password }: SignupProps = req?.body;
    if (!name || !email || !username || !password) {
      res.status(400).json({ error: "Please fill the required fields" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        followers: newUser.followers,
        following: newUser.following,
        bio: newUser.bio,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Log in a user
 * @param req Request object containing user credentials (username, password)
 * @param res Response object with user data and token
 */
const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginProps = req?.body;
    if (!username || !password) {
      res.status(400).json({ error: "Please fill the required fields" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }
    generateTokenAndSetCookie(user.id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      followers: user.followers,
      following: user.following,
      bio: user.bio,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Log out a user
 * @param req Request object
 * @param res Response object
 */
const logoutUser = (req: Request, res: Response) => {
  try {
    res.cookie("jwtAuthToken", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const addDefaultFollowers = async (id: string) => {
  const idsToFollow = [
    `${process.env.RJ_USERID}`,
    `${process.env.INSTAGRAM_USERID}`,
    `${process.env.SNAPCHAT_USERID}`,
    `${process.env.BOT_USERID}`,
    `${process.env.CONNECT_HUB_USERID}`,
  ];
  for (const idToFollow of idsToFollow) {
    await User.findByIdAndUpdate(idToFollow, { $push: { followers: id } });
    await User.findByIdAndUpdate(id, { $push: { following: idToFollow } });
  }
};

/**
 * Get user data for authenticated user
 * @param req Request object
 * @param res Response object
 */

const getUserData = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const user = await User.findById(userId).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export { signupUser, loginUser, logoutUser, getUserData };
