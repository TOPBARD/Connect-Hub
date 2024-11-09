import Notification from "../models/notification.model";
import { CustomRequest } from "../shared/interface/CustomRequest";
import { Response } from "express";

/**
 * Fetch all user Notifications
 * @param req Request object with user ID.
 * @param res Response object
 */
export const getNotifications = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req?.user?._id;

    // Fetch all notificatons , populate user(username, profileImg).
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    // Mark all notification to read after user read them.
    await Notification.updateMany({ to: userId }, { read: true });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Delete all Notifications
 * @param req Request object with user ID.
 * @param res Response object with message of Notifications deleted.
 */
export const deleteNotifications = async (
  req: CustomRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req?.user?._id;
    await Notification.deleteMany({ to: userId });

    return res
      .status(200)
      .json({ message: "Notifications deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
