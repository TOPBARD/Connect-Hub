import Post from "./PostCards";
import PostSkeleton from "../PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import axios from "axios";
import { FEEDTYPE } from "../../../shared/enums/Feed";
import { getPostEndpoint } from "../../../shared/functions/PostEndpoints";
import { Posts } from "../../../shared/interface/Post";

const AllPosts = ({
  feedType,
  username,
  userId,
}: {
  feedType: FEEDTYPE;
  username?: string;
  userId?: string;
}) => {
  const POST_ENDPOINT = getPostEndpoint(feedType, username, userId);

  // Fetch posts using React Query
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Posts[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const postData = await axios.get(POST_ENDPOINT);
        return postData.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  // Refetch posts when feedType, username, or refetch function changes
  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  return (
    <>
      {/* Loading skeletons while fetching data */}
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {/* Message when no posts are available */}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {/* Render posts when available */}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post: Posts) => (
            <Post key={post?._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default AllPosts;
