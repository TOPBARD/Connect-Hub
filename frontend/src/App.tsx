import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes } from "react-router-dom";
import UserPage from "./pages/Userpage/UserPage";
import PostPage from "./pages/Postpage/PostPage";
import Header from "./components/header/Header";
import AuthPage from "./pages/Authpage/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./recoil-atoms/user-atom";
import HomePage from "./pages/Homepage/HomePage";
import UpdateProfilePage from "./pages/UpdateProfilepage/UpdateProfilePage";
import CreatePost from "./components/create-post/CreatePost";
import ChatPage from "./pages/Chatpage/ChatPage";

function App() {
  const user = useRecoilValue(userAtom);
  return (
    <Box position={"relative"} w="full">
      <Container maxW="1200px">
        <Header />
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={!user ? <AuthPage /> : <Navigate to="/" />}
          />
          <Route
            path="/update"
            element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/:username"
            element={
              user ? (
                <>
                  <UserPage />
                  <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route
            path="/chat"
            element={user ? <ChatPage /> : <Navigate to={"/auth"} />}
          />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
