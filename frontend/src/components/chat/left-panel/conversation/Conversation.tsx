import { FaImage } from "react-icons/fa";
import { Conversations } from "../../../../shared/interface/Chat";
import { useSelectConversation } from "../../../../hooks/useSelectConversation";
import { useSocket } from "../../../../socket/Socket";
import { User } from "../../../../shared/interface/User";
import { useQuery } from "@tanstack/react-query";

const Conversation = ({
  conversations,
}: {
  conversations: Conversations[];
}) => {
  // Conversation custom hook.
  const { handleConversationSelect } = useSelectConversation();

  // Custom socket hook.
  const { onlineUsers } = useSocket();

  // Auth user data.
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });

  return (
    <div>
      {/* map all conversations */}
      {conversations &&
        conversations.map((conv: Conversations) => {
          return (
            <div className="border-b border-gray-700" key={conv._id}>
              <div
                onClick={() => {
                  handleConversationSelect(conv);
                }}
                key={conv?._id}
                className="flex items-center gap-3 py-3 px-2 border transition-all rounded-full duration-300 border-transparent hover:bg-chat-hover cursor-pointer"
              >
                <div className="flex-shrink-0">
                  {/* participant profileImg */}
                  <img
                    src={
                      conv?.participants[0].profileImg ||
                      "/avatar-placeholder.png"
                    }
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-ellipsis line-clamp-1 font-semibold">
                    {conv?.participants[0].username}
                    {onlineUsers.includes(conv.participants[0]._id) && (
                      <span className="inline-block w-2 h-2 ml-2 bg-green-500 rounded-full"></span>
                    )}
                  </h3>
                  <div className="text-slate-500 text-xs flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      {conv.lastMessage && conv?.lastMessage?.isImg && (
                        <div className="flex items-center gap-1">
                          <span>
                            <FaImage />
                          </span>
                          {conv?.lastMessage?.isImg && <span>Image</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row gap-1">
                      <p className="text-ellipsis line-clamp-1">
                        {conv?.lastMessage?.text}
                      </p>
                      {(conv.lastMessage.text || conv.lastMessage.isImg) &&
                        authUser?._id === conv.lastMessage.sender && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill={`${
                              conv.lastMessage.seen
                                ? "rgb(29, 155, 240)"
                                : "currentColor"
                            }`}
                            className="bi bi-check2-all"
                            viewBox="0 0 16 16"
                          >
                            <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0" />
                            <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708" />
                          </svg>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Conversation;
