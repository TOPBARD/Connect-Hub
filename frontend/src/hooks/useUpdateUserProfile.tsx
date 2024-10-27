import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { UpdateProfileProps } from "../shared/interface/UpdateProfile";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  // Update Profile mutation with success and error handling
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData: UpdateProfileProps) => {
        try {
          const udpateProfile = await axios.post(`/api/users/update`, formData);
          return udpateProfile.data;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            throw toast.error(`${error.response.data.error}`);
          }
        }
      },
      onSuccess: () => {
        toast.success("Profile updated successfully");
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        ]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
