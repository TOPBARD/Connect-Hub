import express from "express";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  commentOnPost,
  getAllPosts,
  getLikedPosts,
  getFollowersPosts,
  getUserPosts
} from "../controllers/post.controller";
import protectRoute from "../middlewares/protectRoute";

const router = express.Router();

/**
 * @route GET /all
 * @description Fetches all posts from all users
 * @access Protected
 */
router.get("/all", protectRoute, getAllPosts);

/**
 * @route GET /liked/:id
 * @description Retrieves all posts liked by a user, specified by user ID
 * @access Protected
 */
router.get("/liked/:id", protectRoute, getLikedPosts);

/**
 * @route GET /followers
 * @description Fetches posts from the authenticated user's followers
 * @access Protected
 */
router.get("/followers", protectRoute, getFollowersPosts);

/**
 * @route GET /user/:username
 * @description Fetches all posts created by a specific user, identified by username
 * @access Public
 */
router.get("/user/:username", getUserPosts);

/**
 * @route POST /create
 * @description Creates a new post
 * @access Protected
 */
router.post("/create", protectRoute, createPost);

/**
 * @route POST /like/:id
 * @description Likes or unlikes a post, identified by post ID
 * @access Protected
 */
router.post("/like/:id", protectRoute, likeUnlikePost);

/**
 * @route POST /comment/:id
 * @description Adds a comment to a post, identified by post ID
 * @access Protected
 */
router.post("/comment/:id", protectRoute, commentOnPost);

/**
 * @route DELETE /:id
 * @description Deletes a post, identified by post ID
 * @access Protected
 */
router.delete("/:id", protectRoute, deletePost);

export default router;
