import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { selectedConversationAtom } from "../../recoil-atoms/message-atom";
import { useRecoilValue } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";
import { Messages } from "../../shared/interface/Message";

const Message = ({
  ownMessage,
  message,
}: {
  ownMessage: boolean;
  message: Messages;
}) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Function to format time from date string
  const formatTime = (timeString: Date) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Function to format date from date string
  const formatDate = (timeString: Date) => {
    const date = new Date(timeString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
  };
  const messageDate = formatDate(message.createdAt);
  const messageTime = formatTime(message.createdAt);

  return (
    <>
      {/* Render date if it's a new day */}
      {
        <Text alignSelf="center" color="gray.500" fontSize="sm" mb={1}>
          {messageDate}
        </Text>
      }

      <Flex
        gap={2}
        alignSelf={ownMessage ? "flex-end" : "flex-start"} // Updated alignment based on ownMessage
      >
        {/* Render avatar for the other user if it's not an own message */}
        {!ownMessage && (
          <Avatar src={selectedConversation?.userProfilePic} w="7" h={7} />
        )}

        {/* Render text message */}
        {message.text && (
          <Flex
            bg={ownMessage ? "green.800" : "gray.200"}
            maxW={"350px"}
            p={1}
            borderRadius={"md"}
            justifyContent={ownMessage ? "flex-end" : "flex-start"}
          >
            <Flex flexDirection="column">
              <Text color={ownMessage ? "white" : "black"}>{message.text}</Text>
              <Box
                alignSelf="flex-end"
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight="bold"
              >
                {ownMessage && (
                  <>
                    <Flex flexDirection="row" alignItems="center">
                      <Text fontSize="x-small" color="gray.500">
                        {messageTime}
                      </Text>
                      <BsCheck2All size={14} />{" "}
                    </Flex>
                  </>
                )}
                {!ownMessage && (
                  <Text fontSize="x-small" color="gray.500">
                    {messageTime}
                  </Text>
                )}
              </Box>
            </Flex>
          </Flex>
        )}

        {/* Render image message skeleton until image is loaded */}
        {message.img && !imgLoaded && (
          <Flex mt={5} w={"200px"} justifyContent="center">
            <Image
              src={message.img}
              hidden
              onLoad={() => setImgLoaded(true)}
              alt="Message image"
              borderRadius={4}
            />
            <Skeleton w={"200px"} h={"200px"} />
          </Flex>
        )}

        {/* Render image message after it's loaded */}
        {message.img && imgLoaded && (
          <Flex
            mt={5}
            w={"200px"}
            justifyContent={ownMessage ? "flex-end" : "flex-start"}
            flexDirection="column"
          >
            <Image src={message.img} alt="Message image" borderRadius={4} />
            <Box
              alignSelf={"flex-end"}
              ml={1}
              color={message.seen ? "blue.400" : ""}
              fontWeight={"bold"}
            >
              {ownMessage && (
                <>
                  <Flex flexDirection="row" alignItems="center">
                    <Text fontSize="x-small" color="gray.500">
                      {messageTime}
                    </Text>
                    <BsCheck2All size={14} />{" "}
                  </Flex>
                </>
              )}
              {!ownMessage && (
                <Text fontSize="x-small" color="gray.500">
                  {messageTime}
                </Text>
              )}
            </Box>
          </Flex>
        )}

        {/* Render own user's avatar */}
        {ownMessage && <Avatar src={user?.profilePic} w="7" h={7} />}
      </Flex>
    </>
  );
};

export default Message;
