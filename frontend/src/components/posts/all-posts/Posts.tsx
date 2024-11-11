import Post from "./PostCards";
import PostSkeleton from "../PostSkeleton";
import { useEffect } from "react";
import { FEEDTYPE } from "../../../shared/enums/Feed";
import { getPostEndpoint } from "../../../shared/functions/PostEndpoints";
import { Posts } from "../../../shared/interface/Post";
import postApi from "../../../api/posts/posts";

const AllPosts = ({
  feedType,
  username,
  userId,
}: {
  feedType: FEEDTYPE;
  username?: string;
  userId?: string;
}) => {
  // Extract post endpoint based on given input
  const POST_ENDPOINT = getPostEndpoint(feedType, username, userId);

  // Fetch post data from post API.
  const { posts, isLoading, refetch, isRefetching } = postApi(POST_ENDPOINT);

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
