import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";

const useFollow = () => {
  const queryClient = useQueryClient();

  // Mutation for following a user
  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      try {
        await axios.post(`/api/users/follow/${userId}`);
        return;
      } catch (error) {
        throw new Error();
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
};

export default useFollow;
