import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import PostComponent from "../../components/post/PostComponent";
import { useRecoilState } from "recoil";
import postsAtom from "../../recoil-atoms/post-atom";
import toast from "react-hot-toast";
import axios from "axios";
import { Post } from "../../shared/interface/Post";
import SuggestedUsers from "../../components/suggested-users/SuggestedUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const postsData = await axios.get<Post[]>(`/api/posts/feed`);
        setPosts(postsData.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(`${error.response.data.error}`);
        }
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [setPosts]);

  return (
    <Flex gap="10" alignItems={"flex-start"}>
      <Box flex={70}>
        {!loading && posts.length === 0 && (
          <h1>Follow some users to see the feed</h1>
        )}

        {loading && (
          <Flex justify="center">
            <Spinner size="xl" />
          </Flex>
        )}

        {posts.map((post) => (
          <PostComponent key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </Box>
      <Box
        flex={30}
        display={{
          base: "none",
          md: "block",
        }}
      >
        <SuggestedUsers />
      </Box>
    </Flex>
  );
};

export default HomePage;
