import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { User } from "../../shared/interface/User";
import { LoginDataProps } from "../../shared/interface/AuthData";

/**
 * Custom hook for handling user login.
 */

const loginUserApi = () => {
  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async (formData: LoginDataProps) => {
      try {
        await axios.post<User>("/api/auth/login", formData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Login Successful");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });
  
  return { loginMutation, isPending, isError };
};

export default loginUserApi;
