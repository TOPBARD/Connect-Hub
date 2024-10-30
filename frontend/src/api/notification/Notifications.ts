import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Notification } from "../../shared/interface/Notification";
import toast from "react-hot-toast";

/**
 * Custom hook for managing notifications.
 * @returns{
 * - The notifications fetched from the API.
 * - A mutation function to delete all notifications.
 * - The loading state while fetching notifications.
 * }
 */

const notificationApi = () => {
  const queryClient = useQueryClient();
  // Fetch all user notifications
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

  // Mutation for deleting all notifications
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
  return { notifications, deleteNotifications, isLoading };
};

export default notificationApi;
