import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from "@chakra-ui/react";
import { FormEvent, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import usePreviewImg from "../../hooks/UsePreviewImg";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User } from "../../shared/interface/User";

export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom);
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    name: user?.name,
    username: user?.username,
    email: user?.email,
    bio: user?.bio,
    password: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);

  const { handleImageChange, imgUrl } = usePreviewImg();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {
      const updateObj = {
        ...inputs,
        profilePic: imgUrl,
      };
      const updatedProfile = await axios.put<User>(
        `/api/users/update/${user?._id}`,
        updateObj
      );
      if (updatedProfile.status === 200) {
        toast.success("Profile updated successfully");
        setUser(updatedProfile.data);
        navigate(`/${user?.username}`);
      }
      localStorage.setItem("userData", JSON.stringify(updatedProfile.data));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${user?.username}`);
  };
  return (
    <form onSubmit={handleSubmit}>
      <Flex align={"center"} justify={"center"} my={6}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.dark")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
            User Profile Edit
          </Heading>
          <FormControl id="userName">
            <Stack direction={["column", "row"]} spacing={6}>
              <Center>
                <Avatar
                  size="xl"
                  boxShadow={"md"}
                  src={imgUrl || user?.profilePic}
                />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef?.current?.click()}>
                  Change Avatar
                </Button>
                <Input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={handleImageChange}
                />
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Full name</FormLabel>
            <Input
              placeholder="John Doe"
              value={inputs.name}
              onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              _placeholder={{ color: "gray.500" }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>User name</FormLabel>
            <Input
              placeholder="johndoe"
              value={inputs.username}
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
              _placeholder={{ color: "gray.500" }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input
              placeholder="your-email@example.com"
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              _placeholder={{ color: "gray.500" }}
              type="email"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              placeholder="Your bio."
              value={inputs.bio}
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
              _placeholder={{ color: "gray.500" }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="password"
              value={inputs.password}
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
              _placeholder={{ color: "gray.500" }}
              type="password"
            />
          </FormControl>
          <Stack spacing={6} direction={["column", "row"]}>
            <Button
              onClick={handleCancel}
              bg={"red.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "red.500",
              }}
            >
              Cancel
            </Button>
            <Button
              bg={"green.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "green.500",
              }}
              type="submit"
              isLoading={updating}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
}
