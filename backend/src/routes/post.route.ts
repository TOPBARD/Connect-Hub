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

router.get("/all", protectRoute, getAllPosts);
router.get("/liked/:id", protectRoute, getLikedPosts);
router.get("/followers", protectRoute, getFollowersPosts);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;
