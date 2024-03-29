import { atom } from "recoil";
import { Post } from "../shared/interface/Post";

const postsAtom = atom<Post[]>({
  key: "postsAtom",
  default: [],
});

export default postsAtom;
