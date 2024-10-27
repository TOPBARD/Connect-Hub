import { NOTIFICATIONACTION } from "../enums/NotificationAction";
import { User } from "./User";

export interface Notification {
  _id: string;
  from: User;
  to: User;
  type: NOTIFICATIONACTION;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
