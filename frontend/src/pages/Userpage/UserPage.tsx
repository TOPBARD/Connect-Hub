import { useEffect, useState } from "react";
import UserHeader from "../../components/user-header/UserHeader";
import { useParams } from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react";
import useGetUserProfile from "../../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../../recoil-atoms/post-atom";
import toast from "react-hot-toast";
import { User } from "../../shared/interface/User";
import PostComponent from "../../components/post/PostComponent";
import axios from "axios";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return;
      setFetchingPosts(true);
      try {
        const userPosts = await axios.get(
          `/api/posts/user/${username}`
        );
        setPosts(userPosts.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(`${error.response.data.error}`);
        }
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, setPosts, user]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!user && !loading) return <h1>User not found</h1>;

  return (
    <>
      <UserHeader user={user as User} />

      {!fetchingPosts && posts.length === 0 && <h1>User has not posts.</h1>}
      {fetchingPosts && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size={"xl"} />
        </Flex>
      )}

      {posts.map((post) => (
        <PostComponent key={post._id} post={post} postedBy={post.postedBy} />
      ))}
    </>
  );
};

export default UserPage;
