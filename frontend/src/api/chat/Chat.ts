import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Conversations,
  MessageData,
  MessagesWithParticipantData,
} from "@/shared/interface/Chat";
/**
 * Custom hook for managing user login.
 * @returns{
 * - A mutation function for user login.
 * - The pending state while user login.
 * - The error state while user login
 * }
 */

const conversationApi = (selectedConversationId?: string) => {
  const queryClient = useQueryClient();
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

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      try {
        if (!selectedConversationId) return null;
        const messagesData = await axios.get<MessagesWithParticipantData>(
          `/api/messages/${selectedConversationId}`
        );
        return messagesData.data;
      } catch (error) {
        throw new Error();
      }
    },
  });

  const {
    mutate: sendMessageMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async (messageData: MessageData) => {
      try {
        await axios.post(`/api/messages/${selectedConversationId}`, messageData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
  return {
    conversations,
    messages,
    refetch,
    sendMessageMutation,
    isPending,
    loadingConversation,
    isError,
  };
};

export default conversationApi;
