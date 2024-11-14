import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
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
        const loginUser = await axios.post(
          `${process.env.BACKEND_URL}/api/auth/login`,
          formData
        );
        localStorage.setItem("jwtAuthToken", loginUser.data.token as string);
        return loginUser.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Login Successful");
      queryClient.fetchQuery({ queryKey: ["authUser"] });
      window.location.reload();
    },
  });

  return { loginMutation, isPending, isError };
};

export default loginUserApi;
