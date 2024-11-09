import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Conversations,
  Message,
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

  const {
    data: messages,
    refetch,
    isRefetching,
    isPending: loadingMessages,
  } = useQuery({
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
        const response = await axios.post(
          `/api/messages/${selectedConversationId}`,
          messageData
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: (newMessage: Message) => {
      queryClient.setQueryData<MessagesWithParticipantData | null>(
        ["messages"],
        (oldData) => {
          if (!oldData) return null;
          // Append the new message to the existing message list
          return {
            ...oldData,
            messages: [...oldData.messages, newMessage],
          };
        }
      );
      queryClient.setQueryData<Conversations[] | null>(
        ["conversations"],
        (oldConversations) => {
          if (!oldConversations) return null;
          return oldConversations.map((conversation) =>
            conversation._id === selectedConversationId
              ? { ...conversation, lastMessage: newMessage }
              : conversation
          );
        }
      );
    },
  });
  return {
    conversations,
    messages,
    refetch,
    isRefetching,
    sendMessageMutation,
    isPending,
    loadingConversation,
    loadingMessages,
    isError,
  };
};

export default conversationApi;
