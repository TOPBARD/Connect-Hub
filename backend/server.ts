import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/connectDB";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/userRoutes";
import postRoutes from "./src/routes/postRoutes";
import messageRoutes from "./src/routes/messageRoutes";
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
app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })); // To parse form data in the req.body
app.use(cookieParser());

// Api Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from backend" });
});

server.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
