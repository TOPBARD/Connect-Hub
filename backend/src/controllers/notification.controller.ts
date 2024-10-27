import Notification from "../models/notification.model";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { Response } from "express";

/**
 * Get all user Notifications
 * @param req Request object
 * @param res Response object
 */
export const getNotifications = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req?.user?._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Delete all Notifications
 * @param req Request object
 * @param res Response object
 */
export const deleteNotifications = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const userId = req?.user?._id;
    await Notification.deleteMany({ to: userId });
    return res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
