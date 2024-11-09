import express from "express";
import protectRoute from "../middlewares/protectRoute";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller";

const router = express.Router();

/**
 * @route GET /
 * @description Retrieves all notifications for the authenticated user
 * @access Protected
 */
router.get("/", protectRoute, getNotifications);

/**
 * @route DELETE /
 * @description Deletes all notifications for the authenticated user
 * @access Protected
 */
router.delete("/", protectRoute, deleteNotifications);

export default router;
