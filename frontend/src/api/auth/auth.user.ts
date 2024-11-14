import axios from "axios";
import { User } from "../../shared/interface/User";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch auth user data.
 */

const getUserApi = () => {
  const token = localStorage.getItem("jwtAuthToken");
  const { data: authUser, isLoading } = useQuery<User | null>({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const currentUser = await axios.get(
          `${process.env.BACKEND_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!currentUser.data) return null;
        return currentUser.data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  return { authUser, isLoading };
};

export default getUserApi;
