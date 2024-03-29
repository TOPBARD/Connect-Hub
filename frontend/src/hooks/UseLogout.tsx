import toast from "react-hot-toast";
import userAtom from "../recoil-atoms/user-atom";
import { useSetRecoilState } from "recoil";
import axios from "axios";
import { selectedConversationAtom } from "../recoil-atoms/message-atom";

const useLogout = () => {
  const setUser = useSetRecoilState(userAtom);
  const setConversation = useSetRecoilState(selectedConversationAtom);

  const logout = async () => {
    try {
      const logoutResponse = await axios.post(`/api/users/logout`);

      if (logoutResponse.status === 200) {
        toast.success("User logout successfully!");
        localStorage.removeItem("userData");
        setUser(null);
        setConversation(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`${error.response.data.error}`);
      }
    }
  };

  return logout;
};

export default useLogout;
