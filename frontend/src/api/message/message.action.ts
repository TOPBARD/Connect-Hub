import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Conversations,
  Message,
  MessageData,
  MessagesWithParticipantData,
} from "@/shared/interface/Chat";
import { useSelectConversation } from "@/hooks/useSelectConversation";
/**
 * Custom hook to handle message actions.
 */

const messageActionApi = (participantId: string) => {
  const { handleConversationSelect } = useSelectConversation();
  const queryClient = useQueryClient();

  const {
    mutate: sendMessageMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async (messageData: MessageData) => {
      try {
        const response = await axios.post(
          `/api/messages/${participantId}`,
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
          if (
            newMessage.conversationId !== oldData.messages[0].conversationId
          ) {
            return oldData; // Return the existing data unchanged
          }
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
          return oldConversations.map((conversation) => {
            if (conversation.participants[0]._id === participantId) {
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

  const { mutate: createMockMutation } = useMutation({
    mutationFn: async (isMock: boolean) => {
      try {
        const newConversation = await axios.post(
          `/api/messages/mock/${participantId}`,
          { isMock }
        );
        return newConversation.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: (newConversation: Conversations) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      handleConversationSelect(newConversation._id);
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
