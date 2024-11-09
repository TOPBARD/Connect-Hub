import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * Custom hook to handle notifications action.
 */

const notificationActionApi = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const deleteNotidiaction = await axios.delete("/api/notifications");
        return deleteNotidiaction.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
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

  return { deleteNotifications };
};

export default notificationActionApi;
