import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Image,
  Stack,
  Text,
  WrapItem,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../../recoil-atoms/message-atom";
import { MockConversation } from "../../shared/interface/ConversationWithUserData";

// Component for rendering a single conversation item
const Conversation = ({
  conversation,
  isOnline,
}: {
  conversation: MockConversation;
  isOnline: boolean;
}) => {
  // Fetching the user details for the conversation
  const user = conversation.participants[0];
  const currentUser = useRecoilValue(userAtom);
  const lastMessage = conversation.lastMessage;
  const [selectedConversation, setSelectedConversationWithMock] =
    useRecoilState(selectedConversationAtom);
  const colorMode = useColorMode();

  return (
    <Flex
      gap={4}
      alignItems={"center"}
      p={"1"}
      // Styling for hover effect
      _hover={{
        cursor: "pointer",
        bg: useColorModeValue("gray.600", "gray.dark"),
        color: "white",
      }}
      onClick={() =>
        setSelectedConversationWithMock({
          _id: conversation._id,
          userId: user?._id,
          userProfilePic: user.profilePic,
          username: user.username,
          mock: conversation.mock as boolean,
        })
      }
      // Background color based on whether the conversation is selected
      bg={
        selectedConversation?._id === conversation._id
          ? colorMode.colorMode === "light"
            ? "gray.400"
            : "gray.dark"
          : ""
      }
      borderRadius={"md"}
    >
      {/* Participant avatar */}
      <WrapItem>
        <Avatar
          size={{
            base: "xs",
            sm: "sm",
            md: "md",
          }}
          src={user.profilePic}
        >
          {/* Displaying online status badge if user is online */}
          {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
        </Avatar>
      </WrapItem>

      {/* Participant details and last message */}
      <Stack direction={"column"} fontSize={"sm"}>
        {/* Participant username */}
        <Text fontWeight="700" display={"flex"} alignItems={"center"}>
          {user.username} <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
        {/* Last message content */}
        <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
          {/* Displaying checkmark icon if message is sent by current user and seen */}
          {currentUser?._id === lastMessage.sender ? (
            <Box color={lastMessage.seen ? "blue.400" : ""}>
              <BsCheck2All size={16} />
            </Box>
          ) : (
            ""
          )}
          {/* Truncated message text */}
          {lastMessage.text.length > 18
            ? lastMessage.text.substring(0, 18) + "..."
            : lastMessage.text || <BsFillImageFill size={16} />}
        </Text>
      </Stack>
    </Flex>
  );
};

export default Conversation;
