import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

interface UserSocketMap {
  [userId: string]: string;
}
const userSocketMap: UserSocketMap = {};

export const getRecipientSocketId = (recipientId: string) => {
  return userSocketMap[recipientId];
};

// Socket Connection On
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on(
    "markMessagesAsSeen",
    async ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      try {
        await Message.updateMany(
          { conversationId: conversationId, seen: false },
          { $set: { seen: true } }
        );
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { "lastMessage.seen": true } }
        );
        io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
      } catch (error) {
        console.log(error);
      }
    }
  );

  //Socket Connection Off
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
