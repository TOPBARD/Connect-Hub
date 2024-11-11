import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "../../shared/interface/User";

/**
 * Custom hook to fetch profile data based on type.
 */

const profileApi = (username: string) => {
  // Fetch user profile by username
  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<User>({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const userData = await axios.get(`/api/users/profile/${username}`);
        return userData.data;
      } catch (error) {
        throw new Error();
      }
    },
    enabled: !!username,
  });

  return {
    user,
    isLoading,
    refetch,
    isRefetching,
  };
};

export default profileApi;
