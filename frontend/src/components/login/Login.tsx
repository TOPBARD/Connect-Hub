import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
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
import userAtom from "../../recoil-atoms/user-atom";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthScreen } from "../../shared/enums/AuthScreens";
import { User } from "../../shared/interface/User";

export default function Login() {
  // State for controlling password visibility, setting authentication screen, user data, and loading state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const setAuthScreen = useSetRecoilState<AuthScreen>(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const [loading, setLoading] = useState<boolean>(false);

  // State for input fields
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  // Function to handle login
  const handleLogin = async () => {
    const { username, password } = inputs;
    if (!username || !password) {
      toast.error("Please fill the required fields");
      return;
    }
    setLoading(true);
    try {
      const loginResponse = await axios.post<User>(`/api/users/login`, inputs);
      if (loginResponse.status === 200) {
        toast.success(`Login Successful`);
        const userDataString = JSON.stringify(loginResponse.data);
        localStorage.setItem("userData", userDataString);
        setUser(loginResponse.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Login
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
          w={{
            base: "full",
            sm: "400px",
          }}
        >
          <Stack spacing={4}>
            {/* Username input */}
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={inputs.username}
                onChange={(e) =>
                  setInputs((inputs) => ({
                    ...inputs,
                    username: e.target.value,
                  }))
                }
              />
            </FormControl>
            {/* Password input */}
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs((inputs) => ({
                      ...inputs,
                      password: e.target.value,
                    }))
                  }
                />
                {/* Toggle button for password visibility */}
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
            <Stack spacing={10} pt={2}>
              {/* Login button */}
              <Button
                loadingText="Logging in"
                size="lg"
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{
                  bg: useColorModeValue("gray.700", "gray.800"),
                }}
                onClick={handleLogin}
                isLoading={loading}
              >
                Login
              </Button>
            </Stack>
            <Stack pt={6}>
              {/* Link to signup */}
              <Text align={"center"}>
                Don&apos;t have an account?{" "}
                <Link
                  color={"blue.400"}
                  onClick={() => setAuthScreen(AuthScreen.SIGNUP)}
                >
                  Sign up
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
