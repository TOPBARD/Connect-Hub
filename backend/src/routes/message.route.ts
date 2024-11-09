import express from "express";
import protectRoute from "../middlewares/protectRoute";
import {
  getMessages,
  sendMessage,
  getConversations,
} from "../controllers/message.controller";

const router = express.Router();

/**
 * @route GET /conversations
 * @description Retrieves all conversations for the authenticated user
 * @access Protected
 */
router.get("/conversations", protectRoute, getConversations);

/**
 * @route GET /:participantId
 * @description Retrieves all messages between the authenticated user and a specific participant
 * @access Protected
 */
router.get("/:participantId", protectRoute, getMessages);

/**
 * @route POST /:participantId
 * @description Sends a new message to a specific participant
 * @access Protected
 */
router.post("/:participantId", protectRoute, sendMessage);

export default router;
