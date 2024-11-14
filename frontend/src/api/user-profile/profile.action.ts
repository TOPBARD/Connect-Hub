import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import {
  UpdateProfileProps,
  UpdateUserImgProps,
} from "../../shared/interface/UpdateProfile";

/**
 * Custom hook to handle profile actions.
 */

const profileActionApi = () => {
  const token = localStorage.getItem("jwtAuthToken");
  const queryClient = useQueryClient();

  // Update profile image
  const { mutateAsync: updateProfileImage, isPending: isUpdatingProfileImage } =
    useMutation({
      mutationFn: async (imageObj: UpdateUserImgProps) => {
        try {
          const udpateProfileImage = await axios.post(
            `${process.env.BACKEND_URL}/api/users/update/image`,
            imageObj,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return udpateProfileImage.data;
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
          queryClient.invalidateQueries({ queryKey: ["posts"] }),
        ]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // Update profile data
  const {
    mutateAsync: updateProfileDetails,
    isPending: isUpdatingProfileDetails,
  } = useMutation({
    mutationFn: async (formData: UpdateProfileProps) => {
      try {
        const udpateProfile = await axios.post(
          `${process.env.BACKEND_URL}/api/users/update/profile`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation for following a user
  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      try {
        await axios.post(
          `${process.env.BACKEND_URL}/api/users/follow/${userId}`,{},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  return {
    updateProfileImage,
    isUpdatingProfileImage,
    updateProfileDetails,
    isUpdatingProfileDetails,
    follow,
    isPending,
  };
};

export default profileActionApi;
