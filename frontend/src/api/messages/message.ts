import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Conversations, Message } from "../../shared/interface/Chat";

/**
 * Custom hook to fetch message data.
 */

const messageApi = (participantId?: string) => {
  // Fetch all conversations
  const { data: conversations, isPending: loadingConversation } = useQuery<
    Conversations[]
  >({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        const conversationData = await axios.get("/api/messages/conversations");
        return conversationData.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  // Fetch all messages of a conversation.
  const {
    data: messages,
    refetch,
    isRefetching,
    isPending: loadingMessages,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      try {
        if (!participantId) return null;
        const messageData = await axios.get<Message[]>(
          `/api/messages/${participantId}`
        );
        return messageData.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  return {
    conversations,
    messages,
    refetch,
    isRefetching,
    loadingConversation,
    loadingMessages,
  };
};

export default messageApi;