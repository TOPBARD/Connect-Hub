import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { User } from "../../shared/interface/User";
import { RegisterDataProps } from "../../shared/interface/AuthData";

/**
 * Custom hook for handling user signup.
 */

const signupUserApi = () => {
  const queryClient = useQueryClient();

  const {
    mutate: signupMutation,
    isError,
    isPending,
  } = useMutation({
    mutationFn: async (formData: RegisterDataProps) => {
      try {
        await axios.post<User>("/api/auth/signup", formData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { signupMutation, isPending, isError };
};

export default signupUserApi;
