import messageApi from "@/api/message/message";
import messageActionApi from "@/api/message/message.action";
import { useSelectConversation } from "@/hooks/useSelectConversation";
import { Conversations } from "@/shared/interface/Chat";
import { User } from "@/shared/interface/User";
import { useSocket } from "@/socket/Socket";

const UserSearchCard = ({ user }: { user: User }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.includes(user._id);
  const { handleConversationSelect, handleParticipantSelect } =
    useSelectConversation();
  const { conversations } = messageApi();
  const { createMockMutation } = messageActionApi(user._id);
  const handleMockConversation = () => {
    const existingConversation = conversations?.find(
      (conversation: Conversations) =>
        conversation.participants[0]._id === user._id
    );
    console.log(existingConversation);
    if (existingConversation) {
      handleConversationSelect(existingConversation._id);
      handleParticipantSelect(user._id);
    } else {
      createMockMutation(true);
      handleParticipantSelect(user?._id)
    }
  };
  return (
    <button
      onClick={handleMockConversation}
      className="flex items-center w-full h-full gap-3 p-2 lg:p-4 border border-transparent hover:border hover:border-primary rounded cursor-pointer"
    >
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={user?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="font-semibold text-ellipsis line-clamp-1">
          {user?.name}
          {isOnline && (
            <span className="inline-block w-2 h-2 ml-2 bg-green-500 rounded-full"></span>
          )}
        </div>
        <p className="text-sm text-ellipsis line-clamp-1">@{user?.username}</p>
      </div>
    </button>
  );
};

export default UserSearchCard;
