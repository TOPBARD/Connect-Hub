import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { User } from "../../shared/interface/User";
import {
  UpdateProfileProps,
  UpdateUserImgProps,
} from "../../shared/interface/UpdateProfile";

/**
 * Custom hook for managing user profile.
 * @returns{
 * - The user profile fetched from the API.
 * - A mutation function to update user profile image.
 * - The pending state while user profile is updated.
 * - The loading state while user profile data is fetched
 * - The pending state while refetching profile data
 * - Refetch function
 * }
 */

const profileApi = (username?: string) => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<User>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const userData = await axios.get(`/api/users/profile/${username}`);
        return userData.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  const { mutateAsync: updateProfileImage, isPending: isUpdatingProfileImage } =
    useMutation({
      mutationFn: async (imageObj: UpdateUserImgProps) => {
        try {
          const udpateProfileImage = await axios.post(
            `/api/users/update/image`,
            imageObj
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
        ]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const {
    mutateAsync: updateProfileDetails,
    isPending: isUpdatingProfileDetails,
  } = useMutation({
    mutationFn: async (formData: UpdateProfileProps) => {
      try {
        const udpateProfile = await axios.post(
          `/api/users/update/profile`,
          formData
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
  return {
    updateProfileImage,
    updateProfileDetails,
    isUpdatingProfileImage,
    isUpdatingProfileDetails,
    user,
    isLoading,
    refetch,
    isRefetching,
  };
};

export default profileApi;
