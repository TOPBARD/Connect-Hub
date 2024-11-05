import { User } from "../../shared/interface/User";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
/**
 * Custom hook for managing user login.
 * @returns{
 * - A mutation function for user login.
 * - The pending state while user login.
 * - The error state while user login
 * }
 */

const searchApi = (query: string) => {
  const {
    data: searchUser,
    isPending: searchingUser,
    refetch,
  } = useQuery<User[]>({
    queryKey: ["search-user"],
    queryFn: async () => {
      try {
        if (!query) return [];
        const searchUser = await axios.get(`/api/users/search/${query}`);
        return searchUser.data;
      } catch (error) {
        throw new Error();
      }
    },
    enabled: false,
    retry: false,
  });
  return {
    searchUser,
    searchingUser,
    refetch,
  };
};

export default searchApi;
