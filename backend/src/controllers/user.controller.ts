import User from "../models/user.model";
import Post from "../models/post.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { CustomRequest } from "../shared/interface/CustomRequest";
import mongoose from "mongoose";
import { UpdateUserProps, Users } from "../shared/interface/User";
import Notification from "../models/notification.model";
import { NOTIFICATIONACTION } from "../shared/enum/notificationAction";
import { imageKit } from "../imageKit/ImageKitConfig";
import { emailValidation, passwordMatching } from "../shared/helper/validation";

/**
 * Get user profile by username
 * @param req Request object with username in params
 * @param res Response object with user data
 */
const getUserProfile = async (req: Request, res: Response) => {
  const { username } = req?.params;
  try {
    const user = await User.findOne({ username })
      .select("-password")
      .select("-email")
      .select("-updatedAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Gets Suggested Users
 * @param req Request object containing current user userId
 * @param res Response object with suggested users
 */
const getSuggestedUsers = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const usersFollowedByYou = await User.findById(userId).select("following");

    const users: Users[] = await User.aggregate([
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
          following: 0,
          link: 0,
          likedPost: 0,
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
    const suggestedUsers: Users[] = filteredUsers.slice(0, 4);

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Follow/Unfollow a user
 * @param req Request object containing the userId of the user to follow/Unfollow
 * @param res Response object
 */
const followUnfollowUser = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req?.params;
    const currentUserId = req?.user?._id;
    const [userToModify, currentUser] = await Promise.all([
      User.findById(id),
      User.findById(currentUserId),
    ]);

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
      try {
        await Promise.all([
          User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } }),
          User.findByIdAndUpdate(currentUserId, { $pull: { following: id } }),
        ]);
        return res
          .status(200)
          .json({ message: "User Unfollowed Successfully" });
      } catch (error) {
        return res.status(500).json({ error: "Failed to unfollow user" });
      }
    } else {
      // Follow user
      try {
        await Promise.all([
          User.findByIdAndUpdate(id, { $push: { followers: currentUserId } }),
          User.findByIdAndUpdate(currentUserId, { $push: { following: id } }),
          new Notification({
            type: NOTIFICATIONACTION.FOLLOW,
            from: currentUserId,
            to: id,
          }).save(),
        ]);
        return res.status(200).json({ message: "User Followed Successfully" });
      } catch (error) {
        return res.status(500).json({ error: "Failed to follow user" });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update user profile
 * @body User update details
 * @param req Request object containing user id
 * @param res Response object
 */
const updateUserProfile = async (req: CustomRequest, res: Response) => {
  const {
    name,
    email,
    username,
    currentPassword,
    newPassword,
    bio,
    link,
  }: UpdateUserProps = req?.body;
  const userId = req?.user?._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!name || !username || !email) {
      return res.status(400).json({
        error: "Please provide required details",
      });
    }
    if (newPassword && !currentPassword) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }
    if (!emailValidation(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (currentPassword && newPassword) {
      if (!passwordMatching(currentPassword, user.password))
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    user.name = name || user?.name;
    user.email = email || user?.email;
    user.username = username || user?.username;
    user.bio = bio || user?.bio;
    user.link = link || user?.link;

    user = await user.save();

    // Find all posts that this user replied and update username
    await Post.updateMany(
      { "comments.user": userId },
      {
        $set: {
          "comments.$[comment].username": user.username,
        },
      },
      { arrayFilters: [{ "comment.user": userId }] }
    );

    return res.status(200).json({
      _id: user?._id,
      name: user?.name,
      email: user?.email,
      username: user?.username,
      profileImg: user?.profileImg,
      coverImg: user?.coverImg,
      bio: user?.bio,
      link: user?.link,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update user Profile/Cover img
 * @body User profile/cover img details
 * @param req Request object containing user id
 * @param res Response object
 */
const updateUserImg = async (req: CustomRequest, res: Response) => {
  let { profileImg, coverImg }: { profileImg: string; coverImg: string } =
    req?.body;
  const userId = req?.user?._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    //Upload Img to imageKit
    if (profileImg) {
      if (user?.profileImg) {
        if (user?.profileImgFileId) {
          await imageKit.deleteFile(user.profileImgFileId);
        }
      }
      const uploadedResponse = await imageKit.upload({
        file: profileImg,
        fileName: "profile_image.jpg",
        folder: "Connect-Hub",
      });
      profileImg = uploadedResponse?.url;
      user.profileImgFileId = uploadedResponse.fileId;
    }
    if (coverImg) {
      if (user?.coverImgFileId) {
        await imageKit.deleteFile(user.coverImgFileId);
      }
      const uploadedResponse = await imageKit.upload({
        file: coverImg,
        fileName: "cover_image.jpg",
        folder: "Connect-Hub",
      });
      coverImg = uploadedResponse?.url;
      user.coverImgFileId = uploadedResponse.fileId;
    }

    user.profileImg = profileImg || user?.profileImg;
    user.coverImg = coverImg || user?.coverImg;

    user = await user.save();
    await Post.updateMany(
      { "comments.user": userId },
      {
        $set: {
          "comments.$[comment].userprofileImg": user.profileImg,
        },
      },
      { arrayFilters: [{ "comment.user": userId }] }
    );
    return res.status(200).json({
      _id: user?._id,
      name: user?.name,
      email: user?.email,
      username: user?.username,
      profileImg: user?.profileImg,
      coverImg: user?.coverImg,
      bio: user?.bio,
      link: user?.link,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export {
  followUnfollowUser,
  updateUserImg,
  updateUserProfile,
  getUserProfile,
  getSuggestedUsers,
};
