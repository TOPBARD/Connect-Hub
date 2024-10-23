import express from "express";
import {
  loginUser,
  logoutUser,
  signupUser,
  getUserData,
} from "../controllers/auth.controller";
import protectRoute from "../middlewares/protectRoute";

const router = express.Router();

router.get("/me", protectRoute, getUserData);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
