import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { Response } from "express";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { imageKit } from "../imageKit/ImageKitConfig";
import { getRecipientSocketId, io } from "../socket/socket";
import User from "../models/user.model";

/**
 * Sends a message between two participants.
 * @param req - Express Request object containing the sender's ID, recipient's ID, message content, and optionally an image
 * @param res - Express Response object to send back the response
 * @returns - A response with the created message or an error message
 */
async function sendMessage(
  req: CustomRequest,
  res: Response
): Promise<Response> {
  try {
    const { participantId } = req.params;
    const { text }: { text: string } = req?.body;
    let { img }: { img: string } = req?.body;
    const senderId = req?.user?._id;

    if (!senderId || !participantId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Verify at least 1 field should be present.
    if (!text && !img) {
      return res
        .status(400)
        .json({ error: "Message or Image field is missing" });
    }

    // Find or create a conversation between the sender and recipient
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, participantId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, participantId],
        lastMessage: {
          text: text || "",
          isImg: img ? true : false,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    // If an image is provided, upload it to ImageKit
    let uploadedResponse;
    if (img) {
      try {
        uploadedResponse = await imageKit.upload({
          file: img,
          fileName: "uploaded_image.jpg",
          folder: "Connect-Hub-Messages",
        });
        img = uploadedResponse.url;
      } catch (error) {}
    }

    const newMessage = new Message({
      conversationId: conversation?._id,
      sender: senderId,
      text: text || "",
      img: img || "",
      isImg: img ? true : false,
      imgFileId: uploadedResponse?.fileId,
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: text || "",
          isImg: img ? true : false,
          sender: senderId,
        },
      }),
    ]);

    // Emit a real-time update to the recipient if their socket is connected
    const recipientSocketId = getRecipientSocketId(participantId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new-message", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Create a mock conversation between two participants.
 * @param req - Express Request object containing the sender's ID, recipient's ID and isMock flag
 * @param res - Express Response object to send back the response
 * @returns - A response with the created message or an error message
 */
const createMockConversation = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  const { isMock } = req?.body;
  const { participantId } = req.params;
  const senderId = req?.user?._id;
  try {
    if (!senderId || !participantId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, participantId] },
    });
    if (conversation) {
      return res.status(201).json(conversation);
    }

    // Create a mock conversation
    let mockConversation;
    if (isMock) {
      const mockConversation = new Conversation({
        participants: [senderId, participantId],
        lastMessage: {
          text: "",
          isImg: false,
          sender: senderId,
        },
      });
      await mockConversation.save();

      // Remove the current user from the participants list
      mockConversation.participants = mockConversation.participants.filter(
        (id) => id.toString() !== senderId.toString()
      );
    }
    return res.status(201).json(mockConversation);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieves messages for a given conversation.
 * @param req - Express Request object containing the user's ID and the conversation participant ID
 * @param res - Express Response object to send back the response
 * @returns - A response with the conversation's messages or an error message
 */
async function getMessages(
  req: CustomRequest,
  res: Response
): Promise<Response> {
  const { participantId } = req?.params;
  const userId = req?.user?._id;

  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Retrieve participant details (username and profile image)
    const participant = await User.findById(participantId).select(
      "username profileImg"
    );

    const messages = await Message.find({
      conversationId: conversation?._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ participant, messages });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Retrieves all conversations for the current user.
 * @param req - Express Request object containing the user's ID
 * @param res - Express Response object to send back the response
 * @returns - A response with the user's conversations or an error message
 */
async function getConversations(
  req: CustomRequest,
  res: Response
): Promise<Response> {
  const userId = req?.user?._id;

  try {
    // Retrieve conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profileImg",
    });

    // Remove the current user from the participants list in each conversation
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

export { sendMessage, getMessages, getConversations, createMockConversation };
