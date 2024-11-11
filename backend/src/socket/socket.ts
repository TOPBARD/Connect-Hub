import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";

dotenv.config();
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["GET", "POST"],
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
  socket.join(userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  io.emit("online-users", Object.keys(userSocketMap));

  socket.on(
    "mark-message-as-seen",
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
        io.to(userSocketMap[userId]).emit("messages-seen", { conversationId });
      } catch (error) {
        console.log(error);
      }
    }
  );
  //Socket Connection Off
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("online-users", Object.keys(userSocketMap));
  });
});

export { io, server, app };
