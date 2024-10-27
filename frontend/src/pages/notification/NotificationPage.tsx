import { Link } from "react-router-dom";
import LoadingSpinner from "../../shared/loading-spinner/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { Notification } from "../../shared/interface/Notification";
import { NOTIFICATIONACTION } from "../../shared/enums/NotificationAction";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  // Fetch notifications using React Query
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const notifications = await axios.get("/api/notifications");
        return notifications.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  // Mutation to delete notifications
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const deleteNotidiaction = await axios.delete("/api/notifications");
        return deleteNotidiaction.data;
      } catch (error) {
        throw new Error();
      }
    },
    onSuccess: () => {
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={() => deleteNotifications()}>
                  Delete all notifications
                </a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {/* Message when there are no notifications */}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {/* Render notifications */}
        {notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification?._id}>
            <div className="flex gap-2 p-4">
              {notification?.type === NOTIFICATIONACTION.FOLLOW && (
                <FaUser className="w-7 h-7 text-primary" />
              )}
              {notification?.type === NOTIFICATIONACTION.LIKE && (
                <FaHeart className="w-7 h-7 text-red-500" />
              )}
              <Link to={`/profile/${notification?.from?.username}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification?.from?.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification?.from?.username}
                  </span>{" "}
                  {notification.type === NOTIFICATIONACTION.FOLLOW
                    ? "followed you"
                    : "liked your post"}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
