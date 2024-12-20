import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Conversations, Message } from "../../shared/interface/Chat";

/**
 * Custom hook to fetch message data.
 */

const messageApi = (participantId?: string) => {
  const token = localStorage.getItem("jwtAuthToken");
  // Fetch all conversations
  const { data: conversations, isPending: loadingConversation } = useQuery<
    Conversations[]
  >({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        const conversationData = await axios.get(
          `${process.env.BACKEND_URL}/api/messages/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
          `${process.env.BACKEND_URL}/api/messages/${participantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
