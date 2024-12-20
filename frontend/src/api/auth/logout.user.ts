import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

/**
 * Custom hook for handling user logout.
 */

const logoutUserApi = () => {
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        await axios.post(`${process.env.BACKEND_URL}/api/auth/logout`);
        localStorage.removeItem("jwtAuthToken");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.refetchQueries({ queryKey: ["authUser"] });
      window.location.reload();
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  return { logout };
};

export default logoutUserApi;
