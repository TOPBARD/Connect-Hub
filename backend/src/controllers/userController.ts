import User from "../models/userModel";
import Post from "../models/postModel";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../shared/helper/generateTokenAndSetCookie";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { UserResponse } from "../shared/interface/User";
import { LoginProps, SignupProps } from "../shared/interface/AuthProps";

/**
 * Get user profile by username or userId
 * @param req Request object containing the username or userId
 * @param res Response object
 */
const getUserProfile = async (req: Request, res: Response) => {
  // We will fetch user profile either with username or userId
  // query is either username or userId
  const { query } = req?.params;

  try {
    let user: UserResponse;

    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

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
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    addDefaultFollowers(newUser?._id.toString());
    await newUser.save();

    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
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
 * @param res Response object
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

    generateTokenAndSetCookie(user?._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user?.bio,
      profilePic: user?.profilePic,
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
    res.cookie("jwtAuthToken", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Follow/unfollow a user
 * @param req Request object containing the userId of the user to follow/unfollow
 * @param res Response object
 */
const followUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req?.user?._id;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (id === currentUserId?.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const objectId = new mongoose.Types.ObjectId(id);
    const isFollowing = currentUser.following.includes(objectId);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update user profile
 * @param req Request object containing updated user details
 * @param res Response object
 */
const updateUser = async (req: CustomRequest, res: Response) => {
  const {
    name,
    email,
    username,
    password,
    bio,
  }: {
    name: string;
    email: string;
    username: string;
    password: string;
    bio: string;
  } = req.body;
  let { profilePic } = req?.body;

  const userId = req?.user?._id;
  const updateUserId = req?.params?.id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (updateUserId !== userId?.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    //Upload profile pic to Cloudinary
    if (profilePic) {
      if (user?.profilePic) {
        const filename = user?.profilePic?.split("/")?.pop()?.split(".")[0];
        if (filename) {
          await cloudinary.uploader.destroy(filename);
        }
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Gets Suggested Users
 * @param req Request object containing updated user userId
 * @param res Response object
 */
const getSuggestedUsers = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const usersFollowedByYou = await User.findById(userId).select("following");

    const users: UserResponse[] = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
      {
        $project: {
          password: 0,
          email: 0,
          followers: 0,
          bio: 0,
          isFrozen: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou?.following.includes(user._id)
    );
    const suggestedUsers: UserResponse[] = filteredUsers.slice(0, 4);

    res.status(200).json(suggestedUsers);
  } catch (error) {
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

export {
  signupUser,
  loginUser,
  logoutUser,
  followUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
};
