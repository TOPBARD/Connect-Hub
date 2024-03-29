import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ChangeEvent, useRef, useState } from "react";
import usePreviewImg from "../../hooks/UsePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import postsAtom from "../../recoil-atoms/post-atom";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Post } from "../../shared/interface/Post";
import axios from "axios";

const MAX_CHAR = 500;

const CreatePost = () => {
  // State and hooks initialization
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState<string>("");
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const imageRef = useRef<HTMLInputElement>(null);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState<Post[]>(postsAtom);
  const { username } = useParams();

  // Handler for text input change
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  // Handler for creating a new post
  const handleCreatePost = async () => {
    setLoading(true);
    const postData = {
      postedBy: user?._id,
      text: postText,
      img: imgUrl,
    };
    try {
      const postDataResponse = await axios.post(`/api/posts/create`, postData);
      toast.success("Post created successfully");
      if (username === user?.username) {
        setPosts([postDataResponse.data, ...posts]);
      }
      onClose();
      setPostText("");
      setImgUrl("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button to open the create post modal */}
      <Button
        position={"fixed"}
        bottom={10}
        right={5}
        bg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
        size={{ base: "sm", sm: "md" }}
      >
        <AddIcon />
      </Button>

      {/* Modal for creating a new post */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              {/* Textarea for post content */}
              <Textarea
                placeholder="Post content goes here.."
                onChange={handleTextChange}
                value={postText}
              />
              {/* Remaining character count */}
              <Text
                fontSize="xs"
                fontWeight="bold"
                textAlign={"right"}
                m={"1"}
                color={"gray.800"}
              >
                {remainingChar}/{MAX_CHAR}
              </Text>

              {/* Input for image upload */}
              <Input
                type="file"
                hidden
                ref={imageRef}
                onChange={handleImageChange}
              />

              {/* Icon for image upload */}
              <BsFillImageFill
                style={{ marginLeft: "5px", cursor: "pointer" }}
                size={16}
                onClick={() => imageRef?.current?.click()}
              />
            </FormControl>

            {/* Preview of the selected image */}
            {imgUrl && (
              <Flex mt={5} w={"full"} position={"relative"}>
                <Image src={imgUrl} alt="Selected img" />
                {/* Close button for removing the selected image */}
                <CloseButton
                  onClick={() => {
                    setImgUrl("");
                  }}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={2}
                  right={2}
                />
              </Flex>
            )}
          </ModalBody>

          {/* Modal footer with button for creating the post */}
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
