import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link, useNavigate } from "react-router-dom";
import Actions from "../actions/Actions";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import postsAtom from "../../recoil-atoms/post-atom";
import { Post } from "../../shared/interface/Post";
import toast from "react-hot-toast";
import { User } from "../../shared/interface/User";
import axios from "axios";

const PostComponent = ({
  post,
  postedBy,
}: {
  post: Post;
  postedBy: string;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();

  // Get user data based on postedBy Id
  useEffect(() => {
    const getUser = async () => {
      try {
        const postData = await axios.get(`/api/users/profile/` + postedBy);
        setUser(postData.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(`${error.response.data.error}`);
        }
        setUser(null);
      }
    };
    getUser();
  }, [postedBy]);

  // Function to delete post
  const handleDeletePost = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const deletePost = await axios.delete(`/api/posts/${post._id}`);
      if (deletePost.status === 200) {
        toast.success("Post deleted");
      }
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    }
  };

  // If user is not fetched yet, return null
  if (!user) return null;

  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={3} mb={4} py={5}>
        {/* Avatar and user information */}
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Avatar
            size="md"
            src={user?.profilePic}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${user.username}`);
            }}
          />
          <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
          <Box position={"relative"} w={"full"}>
            {/* Show up to three avatars of users who replied to this post */}
            {post?.replies?.length === 0 && (
              <Text textAlign={"center"}>🥱</Text>
            )}
            {post?.replies?.map((reply, index) => (
              <Avatar
                key={index}
                size="xs"
                src={reply.userProfilePic}
                position={"absolute"}
                top={index === 0 ? "0px" : "auto"}
                left={index === 0 ? "15px" : index === 1 ? "-5px" : "4px"}
                bottom={index === 0 ? "auto" : "0px"}
                padding={"2px"}
              />
            ))}
          </Box>
        </Flex>
        <Flex flex={1} flexDirection={"column"} gap={2}>
          {/* Username and post details */}
          <Flex justifyContent={"space-between"} w={"full"}>
            <Flex w={"full"} alignItems={"center"}>
              <Text
                fontSize={"sm"}
                fontWeight={"bold"}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/${user.username}`);
                }}
              >
                {user?.username}
              </Text>
              <Image src="/verified.png" w={4} h={4} ml={1} />
            </Flex>
            {/* Display time ago and delete icon if the current user is the owner of the post */}
            <Flex gap={4} alignItems={"center"}>
              <Text
                fontSize={"xs"}
                width={36}
                textAlign={"right"}
                color={"gray.light"}
              >
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </Text>
              {currentUser?._id === user._id && (
                <DeleteIcon bgSize={20} onClick={(e) => handleDeletePost(e)} />
              )}
            </Flex>
          </Flex>

          {/* Post text */}
          <Text fontSize={"sm"}>{post.text}</Text>

          {/* Display post image if available */}
          {post.img && (
            <Box
              borderRadius={6}
              overflow={"hidden"}
              border={"1px solid"}
              borderColor={"gray.light"}
            >
              <Image src={post.img} w={"full"} />
            </Box>
          )}

          {/* Actions component */}
          <Flex gap={3} my={1}>
            <Actions post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default PostComponent;
