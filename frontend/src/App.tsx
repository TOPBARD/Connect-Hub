import { Navigate, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import HomePage from "./pages/home/HomePage";
import Sidebar from "./components/sidebar/Sidebar";
import RightPanel from "./components/right-panel/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import axios from "axios";
import ProfilePage from "./pages/profile/ProfilePage";
import LoadingSpinner from "./shared/loading-spinner/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { User } from "./shared/interface/User";

function App() {
  // Fetch authenticated user data; disable retry on failure
  const { data: authUser, isLoading } = useQuery<User | null>({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const currentUser = await axios.get("/api/auth/me");
        if (!currentUser.data) return null;
        return currentUser.data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  // Show loading spinner while authentication is in progress
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="flex max-w-7xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {authUser && <RightPanel />}
    </div>
  );
}

export default App;
