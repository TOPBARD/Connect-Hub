import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/shared/interface/User";
/**
 * Custom hook to fetch message data.
 */

const searchApi = (search: string) => {
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
          `/api/users/search/${search}`
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
