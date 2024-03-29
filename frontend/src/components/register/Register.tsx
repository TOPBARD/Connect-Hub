import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../../recoil-atoms/auth-atom";
import axios from "axios";
import toast from "react-hot-toast";
import { User } from "../../shared/interface/User";
import { AuthScreen } from "../../shared/enums/AuthScreens";

export default function Register() {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // State to manage the current authentication screen
  const setAuthScreen = useSetRecoilState<AuthScreen>(authScreenAtom);
  // State to manage input values
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  // Function to handle user signup
  const handleSignup = async () => {
    const { name, username, email, password } = inputs;
    // Validate input fields
    if (!name || !username || !email || !password) {
      toast.error("Please fill the required fields");
      return;
    }
    try {
      // Send signup request to the server
      const registerUser = await axios.post<User>(`/api/users/signup`, inputs);

      // If signup is successful, show success message and switch to login screen
      if (registerUser.status === 201) {
        toast.success("Registration Successful");
        setAuthScreen(AuthScreen.LOGIN);
      }
    } catch (error) {
      // Handle error response from server
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    }
  };

  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            {/* Input fields for name and username */}
            <HStack>
              <Box>
                <FormControl isRequired>
                  <FormLabel>Full name</FormLabel>
                  <Input
                    type="text"
                    onChange={(e) =>
                      setInputs({ ...inputs, name: e.target.value })
                    }
                    value={inputs.name}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    onChange={(e) =>
                      setInputs({ ...inputs, username: e.target.value })
                    }
                    value={inputs.username}
                  />
                </FormControl>
              </Box>
            </HStack>
            {/* Input field for email */}
            <FormControl isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
                value={inputs.email}
              />
            </FormControl>
            {/* Input field for password with toggle button */}
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                  value={inputs.password}
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            {/* Button to submit signup */}
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{
                  bg: useColorModeValue("gray.700", "gray.800"),
                }}
                onClick={handleSignup}
              >
                Sign up
              </Button>
            </Stack>
            {/* Link to switch to login screen */}
            <Stack pt={6}>
              <Text align={"center"}>
                Already a user?{" "}
                <Link
                  color={"blue.400"}
                  onClick={() => setAuthScreen(AuthScreen.LOGIN)}
                >
                  Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
