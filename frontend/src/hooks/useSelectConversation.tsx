import { Conversations } from "../shared/interface/Chat";
import { createContext, useContext, useState, ReactNode } from "react";

interface SelectConversationType {
  selectedConversation: Conversations | null;
  handleConversationSelect: (conversation: Conversations | null) => void;
}

const SelectConversationContext = createContext<
  SelectConversationType | undefined
>(undefined);

interface SocketContextProviderProps {
  children: ReactNode;
}

export const SelectConversationContextProvider = ({
  children,
}: SocketContextProviderProps) => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversations | null>(null);

  // Handle conversation change
  const handleConversationSelect = (conversation: Conversations | null) => {
    setSelectedConversation(conversation);
  };

  return (
    <SelectConversationContext.Provider
      value={{
        selectedConversation,
        handleConversationSelect,
      }}
    >
      {children}
    </SelectConversationContext.Provider>
  );
};
export const useSelectConversation = () => {
  const context = useContext(SelectConversationContext);
  if (!context) {
    throw new Error(
      "useSelectConversation must be used within a SelectConversationContextProvider"
    );
  }
  return context;
};
