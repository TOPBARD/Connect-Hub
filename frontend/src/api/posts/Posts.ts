import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { CreatePost, Posts } from "../../shared/interface/Post";

const postApi = (POST_ENDPOINT?: string) => {
  const queryClient = useQueryClient();
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

  const {
    mutate: createPost,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async (postData: CreatePost) => {
      try {
        const createdPost = await axios.post("/api/posts/create", postData);
        return createdPost.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },

    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    posts,
    createPost,
    isPending,
    isLoading,
    refetch,
    isRefetching,
    isError,
  };
};

export default postApi;
