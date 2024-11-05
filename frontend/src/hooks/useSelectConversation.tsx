import { createContext, useContext, useState, ReactNode } from "react";

interface SelectConversationType {
  selectedConversationId: string;
  participantId: string;
  handleConversationSelect: (conversationId: string) => void;
  handleParticipantSelect: (participantId: string) => void;
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
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>("");
  const [participantId, setParticipantId] = useState<string>("");
  console.log(participantId);
  console.log(selectedConversationId);
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };
  const handleParticipantSelect = (participantId: string) => {
    setParticipantId(participantId);
  };

  return (
    <SelectConversationContext.Provider
      value={{
        participantId,
        selectedConversationId,
        handleConversationSelect,
        handleParticipantSelect,
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