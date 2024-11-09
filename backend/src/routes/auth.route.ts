import express from "express";
import {
  loginUser,
  logoutUser,
  signupUser,
  getUserData
} from "../controllers/auth.controller";
import protectRoute from "../middlewares/protectRoute";

const router = express.Router();

/**
 * @route GET /me
 * @description Retrieves the authenticated user's data
 * @access Protected
 */
router.get("/me", protectRoute, getUserData);

/**
 * @route POST /signup
 * @description Handles user registration and creates a new user account
 * @access Public
 */
router.post("/signup", signupUser);

/**
 * @route POST /login
 * @description Authenticates a user and provides a token
 * @access Public
 */
router.post("/login", loginUser);

/**
 * @route POST /logout
 * @description Logs out the authenticated user and invalidates the token
 * @access Public
 */
router.post("/logout", logoutUser);

export default router;
