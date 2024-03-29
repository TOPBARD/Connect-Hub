import { useState } from "react";
import userAtom from "../recoil-atoms/user-atom";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";
import { User } from "../shared/interface/User";
import axios from "axios";

const useFollowUnfollow = (user: User) => {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(
    user?.followers?.includes(currentUser?._id as string)
  );
  const [updating, setUpdating] = useState(false);

  const handleFollowUnfollow = async () => {
    if (!currentUser) {
      toast.error("Please login to follow");
      return;
    }
    if (updating) return;

    setUpdating(true);
    try {
      await axios.post(`/api/users/follow/${user._id}`);
      if (following) {
        toast.success(`Unfollowed ${user.name}`);
        user?.followers?.pop(); // simulate removing from followers
      } else {
        toast.success(`Followed ${user.name}`);
        user?.followers?.push(currentUser?._id); // simulate adding to followers
      }
      setFollowing(!following);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    } finally {
      setUpdating(false);
    }
  };

  return { handleFollowUnfollow, updating, following };
};

export default useFollowUnfollow;
