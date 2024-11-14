import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Conversations,
  Message,
  MessageData,
} from "../../shared/interface/Chat";
import { useSelectConversation } from "../../hooks/useSelectConversation";

/**
 * Custom hook to handle message actions.
 */

const messageActionApi = (participantId: string) => {
  const token = localStorage.getItem("jwtAuthToken");
  const { handleConversationSelect } = useSelectConversation();
  const queryClient = useQueryClient();

  // Send message (on success update existing messages and conversation).
  const {
    mutate: sendMessageMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async (messageData: MessageData) => {
      try {
        const response = await axios.post(
          `${process.env.BACKEND_URL}/api/messages/${participantId}`,
          messageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: (newMessage: Message) => {
      queryClient.setQueryData<Message[] | null>(["messages"], (oldData) => {
        if (!oldData || oldData.length === 0) {
          return [newMessage];
        }
        if (newMessage.conversationId !== oldData[0]?.conversationId) {
          return oldData; // Return the existing data unchanged
        }
        return [...oldData, newMessage];
      });

      queryClient.setQueryData<Conversations[] | null>(
        ["conversations"],
        (oldConversations) => {
          if (!oldConversations) return null;
          return oldConversations.map((conversation) => {
            if (conversation.participants[0]?._id === participantId) {
              return {
                ...conversation,
                lastMessage: newMessage, // Update the last message
              };
            }
            return conversation;
          });
        }
      );
    },
  });

  // Create mock conversation for new user
  const { mutate: createMockMutation } = useMutation({
    mutationFn: async (isMock: boolean) => {
      try {
        const newConversation = await axios.post(
          `${process.env.BACKEND_URL}/api/messages/mock/${participantId}`,
          { isMock },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return newConversation.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: (newConversation: Conversations) => {
      handleConversationSelect(newConversation);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    sendMessageMutation,
    isPending,
    isError,
    createMockMutation,
  };
};

export default messageActionApi;
