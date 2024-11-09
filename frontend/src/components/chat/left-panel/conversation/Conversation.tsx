import { FaImage } from "react-icons/fa";
import { Conversations } from "../../../../shared/interface/Chat";
import { useSelectConversation } from "../../../../hooks/useSelectConversation";

const Conversation = ({
  conversations,
}: {
  conversations: Conversations[];
}) => {
  const { handleConversationSelect, handleParticipantSelect } =
    useSelectConversation();
  return (
    <div>
      {conversations &&
        conversations.map((conv: Conversations) => {
          return (
            <div className="border-b border-gray-700">
              <div
                onClick={() => {
                  handleConversationSelect(conv._id),
                    handleParticipantSelect(conv.participants[0]._id);
                }}
                key={conv?._id}
                className="flex items-center gap-3 py-3 px-2 border transition-all rounded-full duration-300 border-transparent hover:bg-chat-hover cursor-pointer"
              >
                <div className="flex-shrink-0">
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
                  </h3>
                  <div className="text-slate-500 text-xs flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      {conv.lastMessage && !conv?.lastMessage?.text && (
                        <div className="flex items-center gap-1">
                          <span>
                            <FaImage />
                          </span>
                          {!conv?.lastMessage?.text && <span>Image</span>}
                        </div>
                      )}
                    </div>
                    <p className="text-ellipsis line-clamp-1">
                      {conv?.lastMessage?.text}
                    </p>
                  </div>
                </div>
                {!conv.lastMessage.seen && (
                  <p className="text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full">
                    {1}
                  </p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Conversation;
