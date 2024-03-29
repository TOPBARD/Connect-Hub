import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useFollowUnfollow from "../../hooks/useFollowUnfollow";
import { User } from "../../shared/interface/User";

const SuggestedUser = ({ user }: { user: User }) => {
  // Custom hook to handle follow/unfollow functionality
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

  return (
    <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
      {/* Left side: User profile information */}
      <Flex gap={2} as={Link} to={`${user.username}`}>
        {/* User avatar */}
        <Avatar src={user.profilePic} />
        <Box>
          {/* Username */}
          <Text fontSize={"sm"} fontWeight={"bold"}>
            {user.username}
          </Text>
          {/* User's name */}
          <Text color={"gray.light"} fontSize={"sm"}>
            {user.name}
          </Text>
        </Box>
      </Flex>
      {/* Right side: Follow/Unfollow button */}
      <Button
        size={"sm"}
        color={following ? "black" : "white"}
        bg={following ? "white" : "blue.400"}
        onClick={handleFollowUnfollow}
        isLoading={updating}
        _hover={{
          color: following ? "black" : "white",
          opacity: ".8",
        }}
      >
        {following ? "Unfollow" : "Follow"}
      </Button>
    </Flex>
  );
};

export default SuggestedUser;
