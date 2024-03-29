import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User } from "../shared/interface/User";
import axios from "axios";
import { useParams } from "react-router-dom";

const useGetUserProfile = () => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const { username } = useParams();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userProfile = await axios.get(`/api/users/profile/${username}`);
        if (userProfile.data.isFrozen) {
          return;
        }
        setUser(userProfile.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(`${error.response.data.error}`);
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [username]);

  return { loading, user };
};

export default useGetUserProfile;
