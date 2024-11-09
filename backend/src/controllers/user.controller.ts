import User from "../models/user.model";
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
 * Fetches a user profile by the given username.
 * @param req - Express request object containing the username in params.
 * @param res - Express response object containing user data or an error message.
 * @returns -  User profile data or error response.
 */
const getUserProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { username } = req?.params;
  try {
    // Find the user by username and exclude the (password, email, updatedAt) field
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
 * Fetches a list of suggested users for the current user.
 * @param req - Custom request object containing user information.
 * @param res - Response object containing suggested users or an error message.
 * @returns - List of suggested users or error response.
 */
const getSuggestedUsers = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req?.user?._id;
    const usersFollowedByYou = await User.findById(userId).select("following");

    // Aggregate to fetch random users excluding the current user
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

    // Filter out users already followed by the current user
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
 * Searches for users based on a given username.
 * @param req - Custom request object with the search query.
 * @param res - Response object containing search results or an error message.
 * @returns - List of matching users or error response.
 */
const getSearchUsers = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  const { username } = req?.params;

  try {
    // Find users based on given username characters. Select (name, username, profileImg) fields
    const searchQuery = new RegExp(username, "i");
    const users = await User.find({
      $or: [{ name: searchQuery }, { username: searchQuery }],
    }).select("name username profileImg");

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Toggles the follow/unfollow status between two users.
 * @param req - Custom request object with the target user's ID.
 * @param res - Response object indicating success or failure.
 * @returns - Success or error response.
 */
const followUnfollowUser = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req?.params;
    const currentUserId = req?.user?._id;
    const [userToModify, currentUser] = await Promise.all([
      User.findById(id),
      User.findById(currentUserId),
    ]);

    // Check to prevent a user to follow/unfollow themselves
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

          // Create new follow notification
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
 * Updates a user's profile information, including name, email, and password.
 * @param req - Custom request object containing user update details.
 * @param res - Response object with updated user data or an error message.
 * @returns- Updated user profile or error response.
 */
const updateUserProfile = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  // Extract details to update from body
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

    // Validate missing details
    if (!name || !username || !email) {
      return res.status(400).json({
        error: "Please provide required details",
      });
    }

    // Check if old password is present before updating new password
    if (newPassword && !currentPassword) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    // Validate email format
    if (!emailValidation(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password
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

    // Update user details
    user.name = name || user?.name;
    user.email = email || user?.email;
    user.username = username || user?.username;
    user.bio = bio || user?.bio;
    user.link = link || user?.link;

    user = await user.save();

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
 * Updates a user's profile or cover image.
 * @param req - Custom request object containing the image details.
 * @param res - Response object with updated user data or an error message.
 * @returns - Updated user images or error response.
 */
const updateUserImg = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  let { profileImg, coverImg }: { profileImg: string; coverImg: string } =
    req?.body;
  const userId = req?.user?._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Upload images using ImageKit
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
  getSearchUsers,
  updateUserProfile,
  getUserProfile,
  getSuggestedUsers,
};
