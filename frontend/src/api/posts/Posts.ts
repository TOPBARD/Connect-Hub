import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Posts } from "../../shared/interface/Post";

/**
 * Custom hook to fetch posts based on feed type.
 */

const postApi = (POST_ENDPOINT?: string) => {
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Posts[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const postData = await axios.get(POST_ENDPOINT as string);
        return postData.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  return {
    posts,
    isLoading,
    refetch,
    isRefetching,
  };
};

export default postApi;
