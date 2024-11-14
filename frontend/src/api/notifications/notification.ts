import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Notification } from "../../shared/interface/Notification";

/**
 * Custom hook to fetch user notifications.
 */

const notificationApi = () => {
  const token = localStorage.getItem("jwtAuthToken");
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const notifications = await axios.get(
          `${process.env.BACKEND_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return notifications.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  return { notifications, isLoading };
};

export default notificationApi;
