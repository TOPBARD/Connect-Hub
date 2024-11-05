import { HiDotsVertical } from "react-icons/hi";
import conversationApi from "@/api/chat/Chat";
import { useSocket } from "@/socket/Socket";
import { FaAngleLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/shared/interface/User";
import moment from "moment";
import { useEffect } from "react";
import MessageInput from "./message-input/MessageInput";
import { useSelectConversation } from "@/hooks/useSelectConversation";

const ChatArea = () => {
  const {
    participantId,
    selectedConversationId,
    handleConversationSelect,
    handleParticipantSelect,
  } = useSelectConversation();
  const { messages, refetch } = conversationApi(participantId);
  const { onlineUsers } = useSocket();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const participant = messages?.participant;
  const allMessages = messages?.messages;
  const isOnline = onlineUsers.includes(participant?._id as string);

  useEffect(() => {
    refetch();
  }, [selectedConversationId, refetch]);
  return (
    <div className="flex flex-col h-full w-full">
      <header className="sticky top-0 h-16  flex justify-between items-center px-4 z-10">
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
            <img width={50} height={50} src={participant?.profileImg} />
          </div>
          <div>
            <h3 className="font-semibold text-lg my-0 text-ellipsis line-clamp-1">
              {participant?.username}
            </h3>
            <p className="-my-2 text-sm">
              {isOnline ? (
                <span className="text-primary">online</span>
              ) : (
                <span className="text-slate-400">offline</span>
              )}
            </p>
          </div>
        </div>

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
        <div className="flex flex-col gap-2 py-2 mx-2">
          {allMessages &&
            allMessages.map((msg) => {
              const isSentByAuthUser = msg.sender === authUser?._id;
              return (
                <div
                  key={msg._id}
                  className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md bg-gray-800 ${
                    isSentByAuthUser ? " text-white ml-auto" : " text-gray-200"
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
                  <p className="ml-auto w-fit text-xs">
                    {moment(msg.createdAt).format("hh:mm")}
                  </p>
                </div>
              );
            })}
        </div>
      </section>
      <MessageInput />
    </div>
  );
};

export default ChatArea;
