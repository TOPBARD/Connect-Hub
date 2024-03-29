import { Button, Flex, Link, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../../recoil-atoms/user-atom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../../hooks/UseLogout";
import authScreenAtom from "../../recoil-atoms/auth-atom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { AuthScreen } from "../../shared/enums/AuthScreens";
import { MdOutlineWbSunny } from "react-icons/md";
import { MdSunny } from "react-icons/md";
import { MdLogin } from "react-icons/md";
import { MdSupervisorAccount } from "react-icons/md";

const Header = () => {
  // Color mode and user data from Recoil state
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);

  // Logout function and authentication screen state setter
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Flex justifyContent={"space-between"} mt={6} mb="12">
      {/* Home link */}
      {user && (
        <Link as={RouterLink} to="/">
          <AiFillHome size={24} />
        </Link>
      )}

      {/* Login link */}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen(AuthScreen.LOGIN)}
        >
          <Flex alignItems={"center"} gap={1}>
            <MdLogin size={22} />
            Login
          </Flex>
        </Link>
      )}

      {/* Color mode toggle and user actions */}
      <Flex alignItems={"center"} gap={4}>
        {/* Color mode toggle */}
        {colorMode === "dark" ? (
          <MdOutlineWbSunny size={24} onClick={toggleColorMode} />
        ) : (
          <MdSunny size={24} onClick={toggleColorMode} />
        )}

        {/* User actions */}
        {user && (
          <>
            {/* Profile link */}
            <Link as={RouterLink} to={`/${user.username}`}>
              <RxAvatar size={24} />
            </Link>

            {/* Chat link */}
            <Link as={RouterLink} to={`/chat`}>
              <BsFillChatQuoteFill size={20} />
            </Link>

            {/* Logout button */}
            <Button size={"xs"} onClick={logout}>
              <FiLogOut size={20} />
            </Button>
          </>
        )}
      </Flex>

      {/* Signup link */}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen(AuthScreen.SIGNUP)}
        >
          <Flex alignItems={"center"} gap={1}>
            <MdSupervisorAccount size={22} />
            Signup
          </Flex>
        </Link>
      )}
    </Flex>
  );
};

export default Header;
