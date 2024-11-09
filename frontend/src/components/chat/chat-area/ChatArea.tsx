import { HiDotsVertical } from "react-icons/hi";
import conversationApi from "@/api/chat/Chat";
import { useSocket } from "@/socket/Socket";
import { FaAngleLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/shared/interface/User";
import moment from "moment";
import { useEffect, useRef } from "react";
import MessageInput from "./message-input/MessageInput";
import { useSelectConversation } from "@/hooks/useSelectConversation";
import LoadingSpinner from "@/shared/loading-spinner/LoadingSpinner";
import RightPanelSkeleton from "@/components/right-panel/RightPanelSkeleton";

const ChatArea = () => {
  const {
    participantId,
    selectedConversationId,
    handleConversationSelect,
    handleParticipantSelect,
  } = useSelectConversation();
  const { messages, refetch, loadingMessages, isRefetching } =
    conversationApi(participantId);
  const { onlineUsers } = useSocket();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const participant = messages?.participant;
  const allMessages = messages?.messages;
  const isOnline = onlineUsers.includes(participant?._id as string);

  const currentMessage = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessages]);

  useEffect(() => {
    refetch();
  }, [selectedConversationId, refetch]);
  return (
    <div className="flex flex-col h-full w-full">
      <header className="sticky top-0 h-16  flex justify-between items-center px-1 z-10 bg-chat-header">
        {loadingMessages || isRefetching ? (
          <RightPanelSkeleton />
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                handleConversationSelect(""), handleParticipantSelect("");
              }}
              className="lg:hidden"
            >
              <FaAngleLeft size={25} />
            </button>
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
              <p className="-my-2 text-xs">
                {isOnline ? (
                  <span className="text-primary">online</span>
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
            allMessages &&
            allMessages.map((msg) => {
              const isSentByAuthUser = msg.sender === authUser?._id;
              return (
                <div
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
                    <p
                      className={`${
                        isSentByAuthUser ? "text-right mr-1" : "text-left ml-1"
                      } text-xs`}
                    >
                      {moment(msg.createdAt).format("hh:mm")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
      <MessageInput />
    </div>
  );
};

export default ChatArea;
