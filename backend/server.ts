import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/connectDB";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.route";
import authRoutes from "./src/routes/auth.route";
import postRoutes from "./src/routes/post.route";
import notificationRoutes from "./src/routes/notification.route";
import messageRoutes from "./src/routes/message.route";
import { Response, Request } from "express";
import { v2 as cloudinary } from "cloudinary";
import { app, server } from "./src/socket/socket";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_PUBLIC_KEY}`,
  api_secret: `${process.env.CLOUDINARY_SECRET_KEY}`,
});

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Api Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from backend" });
});

server.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
