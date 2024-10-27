import express from "express";
import protectRoute from "../middlewares/protectRoute";
import {
  followUnfollowUser,
  getUserProfile,
  updateUser,
  getSuggestedUsers,
} from "../controllers/user.controller";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

export default router;
