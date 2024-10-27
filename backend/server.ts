import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/db/connectDB";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.route";
import authRoutes from "./src/routes/auth.route";
import postRoutes from "./src/routes/post.route";
import notificationRoutes from "./src/routes/notification.route";
import { Response, Request } from "express";
import cors from "cors";

const app = express();

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Api Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from backend" });
});

app.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
