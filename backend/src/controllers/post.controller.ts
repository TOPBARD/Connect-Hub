import Post from "../models/post.model";
import User from "../models/user.model";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { Request, Response } from "express";
import Notification from "../models/notification.model";
import { NOTIFICATIONACTION } from "../shared/enum/notificationAction";
import { imageKit } from "../imageKit/ImageKitConfig";

/**
 * Fetches all posts, sorted by the creation date (latest first)
 * @param req - Express Request object
 * @param res - Express Response object
 * @returns - JSON array of all posts or an error response
 */
const getAllPosts = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    // Find all post, populate user(name, username, profileImg), comments.user(name, username, porfileImg).
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "name username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "name username profileImg",
      });

    return res.status(200).json(posts.length ? posts : []);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Fetches all posts liked by a specific user.
 * @param req - Express Request object with userId as a parameter
 * @param res - Express Response object
 * @returns - JSON array of liked posts or an error response
 */
const getLikedPosts = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  const userId = req?.params?.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch all liked post, populate user(name, username, profileImg), comment.user(name, username, profileImg).
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "name username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "name username profileImg",
      });

    return res.status(200).json(likedPosts);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Creates a new post with optional image upload to ImageKit.
 * @param req - Express Request object containing text, optional image, and user ID
 * @param res - Express Response object
 * @returns - JSON object of the created post or an error response
 */
const createPost = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const { text }: { text: string } = req?.body;
    let { img }: { img: string } = req?.body;

    // Check at least 1 of text or img filed is present.
    if (!text && !img) {
      return res.status(400).json({ error: "Text or img fields is required" });
    }

    const userId = req?.user?._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate text length
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    // Upload image to ImageKit if provided
    let uploadedResponse;
    if (img) {
      try {
        uploadedResponse = await imageKit.upload({
          file: img,
          fileName: "uploaded_image.jpg",
          folder: "Connect-Hub",
        });
        img = uploadedResponse.url;
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
      imgFileId: uploadedResponse?.fileId,
    });
    await newPost.save();

    return res.status(201).json(newPost);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Fetches a single post by ID.
 * @param req - Express Request object with postId as a parameter
 * @param res - Express Response object
 * @returns - JSON object of the post or an error response
 */
const getPost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const post = await Post.findById(req?.params?.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Deletes a post by ID.
 * @param req - Express Request object with postId as a parameter
 * @param res - Express Response object
 * @returns - JSON message of successful deletion or an error response
 */
const deletePost = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const post = await Post.findById(req?.params?.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check to prevent deleting other user post
    if (post?.user.toString() !== req?.user?._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post" });
    }

    // If post has a image, remove it from imageKit
    if (post?.imgFileId) {
      await imageKit.deleteFile(post.imgFileId);
    }

    await Post.findByIdAndDelete(req?.params?.id);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Likes or unlikes a post.
 * @param req - Express Request object with postId and userId
 * @param res - Express Response object
 * @returns - Updated list of likes or an error response
 */
const likeUnlikePost = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id: postId } = req?.params;
    const userId = req?.user?._id;

    const post = await Post.findById(postId);

    if (!post || !userId) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post?.likes?.includes(userId);

    if (userLikedPost) {
      // Unlike post
      try {
        await Promise.all([
          Post.updateOne({ _id: postId }, { $pull: { likes: userId } }),
          User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }),
        ]);

        const updatedLikes = post.likes.filter(
          (id) => id.toString() !== userId.toString()
        );

        return res.status(200).json(updatedLikes);
      } catch (error) {
        return res.status(500).json({ error: "Failed to unlike post" });
      }
    } else {
      // Like post
      try {
        post.likes.push(userId);
        await Promise.all([
          User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }),
          post.save(),

          // Create new notification for liking post
          new Notification({
            from: userId,
            to: post.user,
            type: NOTIFICATIONACTION.LIKE,
          }).save(),
        ]);

        const updatedLikes = post.likes;

        return res.status(200).json(updatedLikes);
      } catch (error) {
        return res.status(500).json({ error: "Failed to like post" });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Adds a comment to a post by ID.
 * @param req - Express Request object with postId and comment text
 * @param res - Express Response object
 * @returns - Updated post with the new comment or an error response
 */
const commentOnPost = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const { text }: { text: string } = req?.body;
    const postId = req?.params?.id;
    const userId = req?.user?._id;

    // Validate text is present.
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Fetches posts from users that the current user is following.
 * @param req - Express Request object with userId
 * @param res - Express Response object
 * @returns - JSON array of posts from followed users or an error response
 */
const getFollowersPosts = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req?.user?._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following;

    // Fetch all post posted by following user, populate user(name, username, profileImg), comment.user(name, username, profileImg).
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "name username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "name username profileImg",
      });

    return res.status(200).json(feedPosts);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Fetches our posts.
 * @param req - Express Request object with our username
 * @param res - Express Response object
 * @returns - JSON array of our posts or an error response
 */
const getUserPosts = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const { username } = req?.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch all our post , populate user(name, username, profileImg), comment.user(name, username, profileImg).
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "name username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "name username profileImg",
      });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  commentOnPost,
  getFollowersPosts,
  getUserPosts,
};
