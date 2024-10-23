import Post from "../models/post.model";
import User from "../models/user.model";
import { v2 as cloudinary } from "cloudinary";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { Request, Response } from "express";
import Notification from "../models/notification.model";
import { NotificationAction } from "../shared/enum/notificationAction";

/**
 * Create a new post
 * @param req Request object containing postedBy (user ID), text, and optionally an image
 * @param res Response object
 */
const createPost = async (req: CustomRequest, res: Response) => {
  try {
    const { text }: { text: string } = req?.body;
    let { img }: { img: string } = req?.body;

    if (!text) {
      return res.status(400).json({ error: "Text fields is required" });
    }
    const userId = req?.user?._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Limit max length of the post to 500
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    // Upload image to cloudinary if provided
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ user: userId, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a post by ID
 * @param req Request object containing the post ID
 * @param res Response object
 */
const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req?.params?.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a post by ID
 * @param req Request object containing the post ID
 * @param res Response object
 */
const deletePost = async (req: CustomRequest, res: Response) => {
  try {
    const post = await Post.findById(req?.params?.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post?.user.toString() !== req?.user?._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post" });
    }

    // If post has a image, remove it from Cloudinary
    if (post?.img) {
      const imgId = post?.img?.split("/")?.pop()?.split(".")[0];
      await cloudinary.uploader.destroy(imgId as string);
    }

    await Post.findByIdAndDelete(req?.params?.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Like/Unlike a post by ID
 * @param req Request object containing the post ID
 * @param res Response object
 */
const likeUnlikePost = async (req: CustomRequest, res: Response) => {
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
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: NotificationAction.LIKE,
      });
      await notification.save();
      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Reply to a post by ID
 * @param req Request object containing the post ID and reply text
 * @param res Response object
 */
const commentOnPost = async (req: CustomRequest, res: Response) => {
  try {
    const { text }: { text: string } = req.body;
    const postId = req?.params?.id;
    const userId = req?.user?._id;

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

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Returns all Posts
 * @param req Request object
 * @param res Response object
 */
const getAllPosts = async (req: CustomRequest, res: Response) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all Posts liked by user
 * @param req Request object
 * @param res Response object
 */
const getLikedPosts = async (req: CustomRequest, res: Response) => {
  const userId = req?.params?.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all Posts by followers
 * @param req Request object containing the username
 * @param res Response object
 */
const getFollowersPosts = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user Posts
 * @param req Request object containing the username
 * @param res Response object
 */
const getUserPosts = async (req: CustomRequest, res: Response) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -createdAt -updatedAt -isFrozen -bio -followers -following -likedPosts -link",
      });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
