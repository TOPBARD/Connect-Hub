import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { FormEvent, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { FaRegSmile } from "react-icons/fa";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../../recoil-atoms/message-atom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillImageFill } from "react-icons/bs";
import usePreviewImg from "../../hooks/UsePreviewImg";
import axios from "axios";
import { Messages } from "../../shared/interface/Message";
import toast from "react-hot-toast";

interface MessageInputProps {
  setMessages: React.Dispatch<React.SetStateAction<Messages[]>>;
}

const MessageInput: React.FC<MessageInputProps> = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const imageRef = useRef<HTMLInputElement>(null);
  const { onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);

  // Handle sending message
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;

    setIsSending(true);

    try {
      const messageObj = {
        message: messageText,
        recipientId: selectedConversation?.userId,
        img: imgUrl,
      };
      const sendMessageResponse = await axios.post<Messages>(
        `/api/messages`,
        messageObj
      );
      setMessages((messages) => [...messages, sendMessageResponse.data]);

      // Update last message for the conversation
      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation?._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: sendMessageResponse.data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      setMessageText("");
      setImgUrl("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Flex gap={2} alignItems={"center"}>
      {/* Message input form */}
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            w={"full"}
            placeholder="Type a message"
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
          />
          {/* Send button */}
          <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
            <IoSendSharp />
          </InputRightElement>
        </InputGroup>
      </form>
      {/* Image upload button */}
      <Flex flex={5} cursor={"pointer"}>
        <BsFillImageFill size={20} onClick={() => imageRef?.current?.click()} />
        <Input
          type={"file"}
          hidden
          ref={imageRef}
          onChange={handleImageChange}
        />
      </Flex>
      {/* Smile icon */}
      <FaRegSmile size={21} />

      {/* Modal for displaying the image preview */}
      <Modal
        isOpen={!!imgUrl}
        onClose={() => {
          onClose();
          setImgUrl("");
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Image preview */}
            <Flex mt={5} w={"full"}>
              <Image src={imgUrl ?? undefined} />
            </Flex>
            <Flex justifyContent={"flex-end"} my={2}>
              {/* Send button or spinner */}
              {!isSending ? (
                <IoSendSharp
                  size={24}
                  cursor={"pointer"}
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={"md"} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
