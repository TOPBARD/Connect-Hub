import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { CreatePost, Posts } from "../../shared/interface/Post";

/**
 * Custom hook to handle posts actions.
 */

const postActionApi = (post: Posts) => {
  const queryClient = useQueryClient();

  // Create post
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

  // Comment on post
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async ({
      postId,
      comment,
    }: {
      postId: string;
      comment: string;
    }) => {
      try {
        const commentPostData = await axios.post(
          `/api/posts/comment/${postId}`,
          { text: comment }
        );
        return commentPostData.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Like post
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async (postId: string) => {
      try {
        const likePostData = await axios.post(`/api/posts/like/${postId}`);
        return likePostData.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: (updatedLikes: String[]) => {
      queryClient.setQueryData(["posts"], (oldData: Posts[]) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete post
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async (postId: string) => {
      try {
        const deletePostData = await axios.delete(`/api/posts/${postId}`);
        return deletePostData.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    createPost,
    isPending,
    isError,
    deletePost,
    isDeleting,
    commentPost,
    isCommenting,
    likePost,
    isLiking,
  };
};

export default postActionApi;
