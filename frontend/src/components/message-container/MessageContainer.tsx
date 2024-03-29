import {
  Avatar,
  Divider,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Message from "../message/Message";
import MessageInput from "../message-input/MessageInput";
import { useEffect, useRef, useState } from "react";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../../recoil-atoms/message-atom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import { useSocket } from "../../socket/Socket";
import messageSound from "../../assets/sounds/message.mp3";
import { Messages } from "../../shared/interface/Message";
import axios from "axios";
import toast from "react-hot-toast";

const MessageContainer = () => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState<Messages[]>([]);
  const currentUser = useRecoilValue(userAtom);
  const { socket } = useSocket();
  const setConversations = useSetRecoilState(conversationsAtom);
  const messageEndRef = useRef(null);

  // Effect to handle new message events
  useEffect(() => {
    if (!socket) return () => {}; // Return a no-op function if socket is not available

    socket.on("newMessage", (message: Messages) => {
      if (selectedConversation?._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
      }

      // Play a sound notification for new messages
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      // Update last message for the conversation
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text || "",
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, selectedConversation, setConversations]);

  // Effect to handle message seen events
  useEffect(() => {
    if (!socket) return;
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser?._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation?._id,
        userId: selectedConversation?.userId,
      });
    }

    socket.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser?._id, messages, selectedConversation]);

  // Effect to scroll to the bottom of the message container when new messages are added
  useEffect(() => {
    if (messageEndRef.current) {
      (messageEndRef.current as HTMLElement)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Effect to fetch messages when conversation changes
  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation?.mock) return;
        const conversationResponse = await axios.get(
          `/api/messages/${selectedConversation?.userId}`
        );
        setMessages(conversationResponse.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(`${error.response.data.error}`);
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [selectedConversation?.userId, selectedConversation?.mock]);

  return (
    <Flex
      flex="70"
      bg={useColorModeValue("gray.200", "gray.dark")}
      borderRadius={"md"}
      p={2}
      flexDirection={"column"}
    >
      {/* Message header */}
      <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
        <Avatar src={selectedConversation?.userProfilePic} size={"sm"} />
        <Text display={"flex"} alignItems={"center"}>
          {selectedConversation?.username}{" "}
          <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
      </Flex>

      <Divider />

      <Flex
        flexDir={"column"}
        gap={4}
        my={4}
        p={2}
        height={"400px"}
        overflowY={"auto"}
      >
        {loadingMessages &&
          [...Array(5)].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems={"center"}
              p={1}
              borderRadius={"md"}
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={"7"} />}
              <Flex flexDir={"column"} gap={2}>
                <Skeleton h="8px" w="250px" />
                <Skeleton h="8px" w="250px" />
                <Skeleton h="8px" w="250px" />
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={"7"} />}
            </Flex>
          ))}

        {!loadingMessages &&
          messages.map((message) => (
            <Flex
              key={message._id}
              direction={"column"}
              ref={
                messages.length - 1 === messages.indexOf(message)
                  ? messageEndRef
                  : null
              }
            >
              <Message
                message={message}
                ownMessage={currentUser?._id === message.sender}
              />
            </Flex>
          ))}
      </Flex>

      <MessageInput setMessages={setMessages} />
    </Flex>
  );
};

export default MessageContainer;
