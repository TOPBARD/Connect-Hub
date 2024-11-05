import axios from "axios";
import { User } from "../../shared/interface/User";
import { useQuery } from "@tanstack/react-query";

const getUserApi = () => {
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
  return { authUser, isLoading };
};

export default getUserApi;
