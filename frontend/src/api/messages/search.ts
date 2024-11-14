import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "../../shared/interface/User";

/**
 * Custom hook to search user with (username or name).
 */

const searchApi = (search: string) => {
  const token = localStorage.getItem("jwtAuthToken");
  const {
    data: searchUser,
    refetch,
    isRefetching: searchingUser,
  } = useQuery({
    queryKey: ["searchUser"],
    queryFn: async () => {
      try {
        if (!search) return null;
        const searchUser = await axios.get<User[]>(
          `${process.env.BACKEND_URL}/api/users/search/${search}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return searchUser.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  return {
    searchUser,
    searchingUser,
    refetch,
  };
};

export default searchApi;
