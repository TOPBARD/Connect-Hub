import express from "express";
import protectRoute from "../middlewares/protectRoute";
import {
  followUser,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
  getSuggestedUsers,
} from "../controllers/userController";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUser); // Toggle state(follow/unfollow)
router.put("/update/:id", protectRoute, updateUser);

export default router;
