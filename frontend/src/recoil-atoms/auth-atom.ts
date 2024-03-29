import { atom } from "recoil";
import { AuthScreen } from "../shared/enums/AuthScreens";

const authScreenAtom = atom({
  key: "authScreenAtom",
  default: AuthScreen.LOGIN,
});

export default authScreenAtom;
