import { HiDotsVertical } from "react-icons/hi";
import { useSocket } from "../../../socket/Socket";
import { FaAngleLeft } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../../../shared/interface/User";
import moment from "moment";
import { useEffect, useRef } from "react";
import MessageInput from "./message-input/MessageInput";
import { useSelectConversation } from "../../../hooks/useSelectConversation";
import LoadingSpinner from "../../../shared/loading-spinner/LoadingSpinner";
import RightPanelSkeleton from "../../../components/right-panel/RightPanelSkeleton";
import messageApi from "../../../api/messages/message";
import { Conversations, Message } from "../../../shared/interface/Chat";

const ChatArea = ({
  selectedConversation,
}: {
  selectedConversation: Conversations;
}) => {
  const queryClient = useQueryClient();

  // Conversation custom hook.
  const { handleConversationSelect } = useSelectConversation();

  // Custom Socket hook.
  const { onlineUsers, socket } = useSocket();

  // Extract details from message data.
  const participant = selectedConversation.participants[0];
  const isOnline = onlineUsers.includes(participant?._id as string);

  // Fetch message data from API.
  const { messages, refetch, loadingMessages, isRefetching } = messageApi(
    participant._id
  );

  // Auth user data.
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });

  // Current message reference.
  const currentMessage = useRef<HTMLInputElement | null>(null);

  // Update current message feed and last message of conversation on new-message
  useEffect(() => {
    if (socket) {
      socket.on("new-message", (message: Message) => {
        queryClient.setQueryData<Message[] | null>(["messages"], (oldData) => {
          if (!oldData || oldData.length === 0) {
            return [message];
          }
          if (message.conversationId !== oldData[0]?.conversationId) {
            return oldData;
          }
          return [...oldData, message];
        });
        queryClient.setQueryData<Conversations[] | null>(
          ["conversations"],
          (oldConversations) => {
            if (!oldConversations) return null;
            return oldConversations.map((conversation) => {
              if (conversation._id === message.conversationId) {
                return {
                  ...conversation,
                  lastMessage: message, // Update the last message
                };
              }
              return conversation;
            });
          }
        );
      });

      // Cleanup function to remove the listener
      return () => {
        socket.off("new-message");
      };
    }
    return;
  }, [socket, selectedConversation._id]);

  // Mark message as seen on opening conversation
  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages &&
      messages.length > 0 &&
      messages[messages.length - 1].sender !== authUser?._id;
    if (lastMessageIsFromOtherUser) {
      socket?.emit("mark-message-as-seen", {
        conversationId: selectedConversation._id,
        userId: messages[0].sender,
      });
    }

    socket?.on("messages-seen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        queryClient.setQueryData<Message[] | null>(["messages"], (oldData) => {
          if (!oldData) return [];
          if (conversationId !== oldData[0].conversationId) {
            return oldData;
          }
          const updatedMessages = oldData.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
        queryClient.setQueryData<Conversations[] | null>(
          ["conversations"],
          (prevConversations) => {
            if (!prevConversations) return null;

            // Update the specific conversation in the list
            return prevConversations.map((conversation) => {
              if (conversation._id === conversationId) {
                return {
                  ...conversation,
                  lastMessage: {
                    ...conversation.lastMessage,
                    seen: true, // Mark the last message as seen
                  },
                };
              }
              return conversation;
            });
          }
        );
      }
    });
    return () => {
      socket?.off("messages-seen");
    };
  }, [socket, authUser?._id, messages, selectedConversation._id]);

  // Scroll to bottom on opening a conversation.
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // Refetch messages on conversation change.
  useEffect(() => {
    refetch();
  }, [selectedConversation._id, refetch]);
  return (
    <>
      {/* Show select user message */}
      {!selectedConversation._id ? (
        <div
          className={`justify-center items-center flex-col gap-2 lg:flex hidden`}
        >
          <div>
            <img src="/verified.png" width={250} alt="logo" />
          </div>
          <p className="text-lg mt-2 text-slate-500">
            Select user to send message
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full">
          <header className="sticky top-0 h-16  flex justify-between items-center px-1 z-10 bg-chat-header">
            {/* Back icon */}
            {loadingMessages || isRefetching ? (
              <RightPanelSkeleton />
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    handleConversationSelect(null);
                  }}
                  className="lg:hidden"
                >
                  <FaAngleLeft size={25} />
                </button>
                {/* Header image */}
                <div>
                  <img
                    width={50}
                    height={50}
                    src={participant?.profileImg || "/avatar-placeholder.png"}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
                    {participant?.username}
                  </h3>
                  {/* Online/Offline status */}
                  <p className="-my-2 text-xs">
                    {isOnline ? (
                      <span className=" text-green-500">online</span>
                    ) : (
                      <span className="text-slate-400">offline</span>
                    )}
                  </p>
                </div>
              </div>
            )}
            <div>
              <button className="cursor-pointer hover:text-primary">
                <HiDotsVertical />
              </button>
            </div>
          </header>

          {/***show all message */}
          <section
            className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50"
            style={{ backgroundImage: "url('/bg-dark.png')" }}
          >
            {/**all message show here */}
            <div className="flex flex-col gap-4 py-2 mx-2" ref={currentMessage}>
              {loadingMessages || isRefetching ? (
                <div className="flex h-10 item-center justify-center">
                  <LoadingSpinner size="xl" />
                </div>
              ) : (
                messages &&
                messages.length > 0 &&
                messages.map((msg) => {
                  const isSentByAuthUser = msg.sender === authUser?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-1 items-start ${
                        isSentByAuthUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={
                              isSentByAuthUser
                                ? authUser.profileImg
                                : participant?.profileImg ||
                                  "/avatar-placeholder.png"
                            }
                            alt="ProfileImg"
                          />
                        </div>
                      </div>
                      <div
                        key={msg._id}
                        className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md bg-green-chat text-white ${
                          isSentByAuthUser ? "ml-auto" : "mr-auto"
                        }`}
                      >
                        <div>
                          {msg?.img && (
                            <img
                              src={msg?.img}
                              className="w-64 h-64 bject-cover rounded"
                            />
                          )}
                        </div>
                        <p className="px-2">{msg.text}</p>
                        <div
                          className={`flex ${
                            isSentByAuthUser && "flex-row-reverse"
                          } gap-1`}
                        >
                          {/* message seen mark */}
                          {isSentByAuthUser && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill={`${
                                msg.seen ? "rgb(29, 155, 240)" : "currentColor"
                              }`}
                              className="bi bi-check2-all"
                              viewBox="0 0 16 16"
                            >
                              <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0" />
                              <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708" />
                            </svg>
                          )}
                          <p className={`text-xs ml-1`}>
                            {moment(msg.createdAt).format("hh:mm")}
                          </p>
                          <div></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
          <MessageInput />
        </div>
      )}
    </>
  );
};

export default ChatArea;
