import Post from "../models/postModel";
import User from "../models/userModel";
import { v2 as cloudinary } from "cloudinary";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { Request, Response } from "express";

/**
 * Create a new post
 * @param req Request object containing postedBy (user ID), text, and optionally an image
 * @param res Response object
 */
const createPost = async (req: CustomRequest, res: Response) => {
  try {
    const { postedBy, text }: { postedBy: string; text: string } = req?.body;
    let { img }: { img: string } = req?.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "Postedby and text fields are required" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user?._id.toString() !== req?.user?._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
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

    const newPost = new Post({ postedBy, text, img });
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

    if (post?.postedBy.toString() !== req?.user?._id.toString()) {
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
 * Like/Unlike a post
 * @param req Request object containing the post ID
 * @param res Response object
 */
const likePost = async (req: CustomRequest, res: Response) => {
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
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // Like post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Reply to a post
 * @param req Request object containing the post ID and reply text
 * @param res Response object
 */
const replyToPost = async (req: CustomRequest, res: Response) => {
  try {
    const { text }: { text: string } = req.body;
    const postId = req?.params?.id;
    const userId = req?.user?._id;
    const userProfilePic = req?.user?.profilePic;
    const username = req?.user?.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts for the feed based on user's following
 * @param req Request object
 * @param res Response object
 */
const getFeedPosts = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user?.following;

    const feedPosts = await Post.find({
      postedBy: { $in: following },
    })
      .sort({
        createdAt: -1,
      })
      .select("-updatedAt");

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts by a specific user
 * @param req Request object containing the username
 * @param res Response object
 */
const getUserPosts = async (req: Request, res: Response) => {
  const { username } = req?.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user?._id }).sort({
      createdAt: -1,
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
  likePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
};
