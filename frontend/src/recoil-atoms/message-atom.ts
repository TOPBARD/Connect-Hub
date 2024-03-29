import { atom } from "recoil";
import { ConversationWithUserData } from "../shared/interface/ConversationWithUserData";
import { SelectedConversation } from "../shared/interface/SelectedConversation";

export const conversationsAtom = atom<ConversationWithUserData[]>({
  key: "conversationsAtom",
  default: [],
});

export const selectedConversationAtom = atom<SelectedConversation | null>({
  key: "selectedConversationAtom",
  default: null,
});
