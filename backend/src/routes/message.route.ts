import express from "express";
import protectRoute from "../middlewares/protectRoute";
import {
  getMessages,
  sendMessage,
  getConversations,
} from "../controllers/message.controller";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:participantId", protectRoute, getMessages);
router.post("/:participantId", protectRoute, sendMessage);

export default router;
