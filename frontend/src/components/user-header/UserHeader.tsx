import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Button, Divider, useColorMode } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import { Link as RouterLink } from "react-router-dom";
import useFollowUnfollow from "../../hooks/useFollowUnfollow";
import { User } from "../../shared/interface/User";

// UserHeader component
const UserHeader = ({ user }: { user: User }) => {
  const currentUser = useRecoilValue(userAtom);
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  const { colorMode } = useColorMode();

  // Function to copy the profile URL to clipboard
  // const copyURL = () => {
  //   const currentURL = window.location.href;
  //   navigator.clipboard.writeText(currentURL).then(() => {
  //     toast.success("Profile link copied.");
  //   });
  // };

  return (
    <VStack gap={4} alignItems={"start"}>
      {/* User information */}
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          {/* User name and username */}
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            flexDirection={"column"}
          >
            <Text fontSize={"2xl"} fontWeight={"bold"}>
              {user.name}
            </Text>
            <Text fontSize={"sm"} color={"gray"}>
              @{user.username}
            </Text>
          </Flex>
          <Flex flexDirection={"row"} ml={5} mt={5} gap={3}>
            <Flex
              flexDirection={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Text fontSize={"x-large"}>{user?.followers?.length}</Text>
              <Text fontSize={"large"}>Followers</Text>
            </Flex>
            <Divider
              orientation="vertical"
              height="60px"
              borderColor={colorMode === "dark" ? "white" : "black"}
            />
            <Flex
              flexDirection={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Text fontSize={"x-large"}>{user?.following?.length}</Text>
              <Text fontSize={"large"}>Following</Text>
            </Flex>
          </Flex>
        </Box>
        {/* User profile picture */}
        <Box>
          <Flex
            gap={5}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {user.profilePic && (
              <Avatar
                src={user.profilePic}
                size={{
                  base: "md",
                  md: "xl",
                }}
              />
            )}
            {!user.profilePic && (
              <Avatar
                src="https://bit.ly/broken-link" // Placeholder image if user profile picture is not available
                size={{
                  base: "md",
                  md: "xl",
                }}
              />
            )}
            {/* Button to update profile (visible only to the logged-in user) */}
            {currentUser?._id === user._id && (
              <Link as={RouterLink} to="/update">
                <Button size={"sm"} borderWidth="3px" borderRadius="lg">
                  Update Profile
                </Button>
              </Link>
            )}

            {/* Button to follow/unfollow user (visible only to other users) */}
            {currentUser?._id !== user._id && (
              <Button
                size={"sm"}
                onClick={handleFollowUnfollow}
                isLoading={updating}
              >
                {following ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Flex>
        </Box>
      </Flex>

      {/* User bio */}
      <Box mt={3} mb={3} width={"80%"}>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Bio
        </Text>
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
          {user.bio}
        </Text>
      </Box>

      {/* Navigation tabs for Posts */}
      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={
            colorMode === "dark" ? "1.5px solid white" : "1.5px solid black"
          }
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}> Posts</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
