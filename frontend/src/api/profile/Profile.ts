import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "../../shared/interface/User";

/**
 * Custom hook to fetch profile data based on type.
 */

const profileApi = (username?: string) => {
  // Fetch profile data with username
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

  // Fetch suggested user data
  const { data: suggestedUsers, isLoading: isSuggesting } = useQuery<User[]>({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const suggestedUserData = await axios.get("/api/users/suggested");
        return suggestedUserData.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  return {
    user,
    isLoading,
    refetch,
    isRefetching,
    suggestedUsers,
    isSuggesting,
  };
};

export default profileApi;
