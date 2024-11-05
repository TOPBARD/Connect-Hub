import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { Response } from "express";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { imageKit } from "../imageKit/ImageKitConfig";
import { getRecipientSocketId, io } from "../socket/socket";
import User from "../models/user.model";

/**
 * Send a message
 * @param req Request object containing sender's ID, recipient's ID, message content, and optionally an image
 * @param res Response object
 */
async function sendMessage(req: CustomRequest, res: Response) {
  try {
    const { participantId } = req.params;
    const { text }: { text: string } = req?.body;
    let { img }: { img: string } = req?.body;
    const senderId = req?.user?._id;

    // Find or create conversation between sender and recipient
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, participantId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, participantId],
        lastMessage: {
          text,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    // Upload image to cloudinary if provided
    let uploadedResponse;
    if (img) {
      try {
        uploadedResponse = await imageKit.upload({
          file: img,
          fileName: "uploaded_image.jpg",
          folder: "Connect-Hub-Messages",
        });

        // Set img to the URL returned by ImageKit
        img = uploadedResponse.url;
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }

    // Create new message
    const newMessage = new Message({
      conversationId: conversation?._id,
      sender: senderId,
      text,
      img: img || "",
      imgFileId: uploadedResponse?.fileId,
    });

    // Save new message and update last message in conversation
    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text,
          sender: senderId,
        },
      }),
    ]);

    // Emit new message event to recipient's socket if available
    const recipientSocketId = getRecipientSocketId(participantId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get messages for a conversation
 * @param req Request object containing user's ID and the other user's ID (conversation partner)
 * @param res Response object
 */
async function getMessages(req: CustomRequest, res: Response) {
  const { participantId } = req?.params;
  const userId = req?.user?._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const participant = await User.findById(participantId).select(
      "username profileImg"
    );

    // Find messages for the conversation and sort by creation date
    const messages = await Message.find({
      conversationId: conversation?._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ participant, messages });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get user conversations
 * @param req Request object containing user's ID
 * @param res Response object
 */
async function getConversations(req: CustomRequest, res: Response) {
  const userId = req?.user?._id;
  try {
    // Find conversations where the user is a participant and populate participant details
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profileImg",
    });

    // Remove the current user from the participants array in each conversation
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant?._id.toString() !== userId?.toString()
      );
    });
    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export { sendMessage, getMessages, getConversations };
