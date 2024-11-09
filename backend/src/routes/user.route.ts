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

/**
 * @route GET /profile/:username
 * @description Fetches the profile information of a user based on their username
 * @access Protected
 */
router.get("/profile/:username", protectRoute, getUserProfile);

/**
 * @route GET /suggested
 * @description Retrieves a list of suggested users for the authenticated user
 * @access Protected
 */
router.get("/suggested", protectRoute, getSuggestedUsers);

/**
 * @route GET /search/:username
 * @description Searches for users based on a username
 * @access Protected
 */
router.get("/search/:username", protectRoute, getSearchUsers);

/**
 * @route POST /follow/:id
 * @description Follows or unfollows a user based on their ID
 * @access Protected
 */
router.post("/follow/:id", protectRoute, followUnfollowUser);

/**
 * @route POST /update/image
 * @description Updates the profile image of the authenticated user
 * @access Protected
 */
router.post("/update/image", protectRoute, updateUserImg);

/**
 * @route POST /update/profile
 * @description Updates the profile information of the authenticated user
 * @access Protected
 */
router.post("/update/profile", protectRoute, updateUserProfile);

export default router;
