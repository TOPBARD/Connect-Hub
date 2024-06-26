import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  likePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
} from "../controllers/postController";
import protectRoute from "../middlewares/protectRoute";

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likePost);
router.put("/reply/:id", protectRoute, replyToPost);

export default router;
