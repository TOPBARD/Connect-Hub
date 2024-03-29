import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import Actions from "../../components/actions/Actions";
import { useEffect } from "react";
import Comment from "../../components/comment/Comment";
import useGetUserProfile from "../../hooks/useGetUserProfile";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import { DeleteIcon } from "@chakra-ui/icons";
import postsAtom from "../../recoil-atoms/post-atom";
import { Post } from "../../shared/interface/Post";
import toast from "react-hot-toast";
import axios from "axios";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState<Post[]>(postsAtom);
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  const currentPost = posts[0];

  useEffect(() => {
    const getPost = async () => {
      setPosts([]);
      try {
        const postData = await axios.get(`/api/posts/${pid}`);
        setPosts([postData.data]);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(`${error.response.data.error}`);
        }
      }
    };
    getPost();
  }, [pid, setPosts]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const deletePostResponse = await axios.delete(
        `/api/posts/${currentPost._id}`
      );
      if (deletePostResponse.status === 200) {
        toast.success("Post deleted");
      }
      navigate(`/${user?.username}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    }
  };

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!currentPost) return null;

  return (
    <>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src={user?.profilePic} size={"md"} />
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user?.username}
            </Text>
            <Image src="/verified.png" w="4" h={4} ml={4} />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={"center"}>
          <Text
            fontSize={"xs"}
            width={36}
            textAlign={"right"}
            color={"gray.light"}
          >
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>

          {currentUser?._id === user?._id && (
            <DeleteIcon
              bgSize={20}
              cursor={"pointer"}
              onClick={handleDeletePost}
            />
          )}
        </Flex>
      </Flex>

      <Text my={3}>{currentPost.text}</Text>

      {currentPost.img && (
        <Box
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid"}
          borderColor={"gray.light"}
        >
          <Image src={currentPost.img} w={"full"} />
        </Box>
      )}

      <Flex gap={3} my={3}>
        <Actions post={currentPost} />
      </Flex>

      <Divider my={4} />

      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>👋</Text>
          <Text color={"gray.light"}>Get the app to like, reply and post.</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>

      <Divider my={4} />
      {currentPost?.replies?.map((reply, index) => (
        <Comment
          key={index}
          reply={reply}
          lastReply={index === (currentPost?.replies?.length ?? 0) - 1}
        />
      ))}
    </>
  );
};

export default PostPage;
