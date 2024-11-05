import express from "express";
import protectRoute from "../middlewares/protectRoute";
import {
  followUnfollowUser,
  getUserProfile,
  updateUserImg,
  updateUserProfile,
  getSuggestedUsers,
  getSearchUsers,
} from "../controllers/user.controller";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/search/:username", protectRoute, getSearchUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update/image", protectRoute, updateUserImg);
router.post("/update/profile", protectRoute, updateUserProfile);

export default router;
