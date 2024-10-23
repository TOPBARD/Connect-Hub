import User from "../models/user.model";
import Post from "../models/post.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { UserResponse } from "../shared/interface/User";
import Notification from "../models/notification.model";
import { NotificationAction } from "../shared/enum/notificationAction";

/**
 * Get user profile by username
 * @param req Request object containing the username
 * @param res Response object with user data
 */
const getUserProfile = async (req: Request, res: Response) => {
  const { username } = req?.params;
  try {
    const user = await User.findOne({ username })
      .select("-password")
      .select("-updatedAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Follow/unfollow a user
 * @param req Request object containing the userId of the user to follow/unfollow
 * @param res Response object
 */
const followUnfollowUser = async (req: CustomRequest, res: Response) => {
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
      res.status(200).json({ message: "User Unfollowed Successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $push: { following: id } });
      const newNotification = new Notification({
        type: NotificationAction.FOLLOW,
        from: currentUserId,
        to: userToModify?._id,
      });
      await newNotification.save();
      res.status(200).json({ message: "User Followed Successfully" });
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
    currentPassword,
    newPassword,
    bio,
    link,
  }: {
    name: string;
    email: string;
    username: string;
    currentPassword: string;
    newPassword: string;
    bio: string;
    link: string;
  } = req.body;
  let { profileImg, coverImg }: { profileImg: string; coverImg: string } =
    req?.body;

  const userId = req?.user?._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (newPassword && !currentPassword) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    //Upload Img to Cloudinary
    if (profileImg) {
      if (user?.profileImg) {
        const filename = user?.profileImg?.split("/")?.pop()?.split(".")[0];
        if (filename) {
          await cloudinary.uploader.destroy(filename);
        }
      }
    }
    if (coverImg) {
      if (user?.coverImg) {
        const filename = user?.coverImg?.split("/")?.pop()?.split(".")[0];
        if (filename) {
          await cloudinary.uploader.destroy(filename);
        }
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    // Find all posts that this user replied and update username and userprofileImg fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userprofileImg": user.profileImg,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
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

export { followUnfollowUser, updateUser, getUserProfile, getSuggestedUsers };
