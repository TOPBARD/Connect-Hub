import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";
import { PostReply } from "../../shared/interface/Post";

// Component for rendering a single comment
const Comment = ({
  reply,
  lastReply,
}: {
  reply: PostReply;
  lastReply: boolean;
}) => {
  return (
    <>
      {/* Comment content */}
      <Flex gap={4} py={2} my={2} w={"full"}>
        {/* User avatar */}
        <Avatar src={reply.userProfilePic} size={"sm"} />

        {/* Comment text and username */}
        <Flex gap={1} w={"full"} flexDirection={"column"}>
          {/* Username */}
          <Flex
            w={"full"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Text fontSize="sm" fontWeight="bold">
              {reply.username}
            </Text>
          </Flex>

          {/* Comment text */}
          <Text>{reply.text}</Text>
        </Flex>
      </Flex>

      {/* Divider */}
      {!lastReply ? <Divider /> : null}
    </>
  );
};

export default Comment;
