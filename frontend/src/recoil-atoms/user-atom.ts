import { atom } from "recoil";
import { User } from "../shared/interface/User";

const userData = localStorage.getItem("userData");

const userAtom = atom<User | null>({
  key: "userAtom",
  default: userData ? JSON.parse(userData) : null,
});

export default userAtom;
