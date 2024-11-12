import messageApi from "../../../api/message/message";
import messageActionApi from "../../../api/message/message.action";
import { useSelectConversation } from "../../../hooks/useSelectConversation";
import { Conversations } from "../../../shared/interface/Chat";
import { User } from "../../../shared/interface/User";
import { useSocket } from "../../../socket/Socket";

const UserSearchCard = ({ user }: { user: User }) => {
  // Custom socket hook
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.includes(user._id);

  // Conversation custom hook.
  const { handleConversationSelect } = useSelectConversation();

  // Fetch conversation data from API.
  const { conversations } = messageApi();

  // Fetch mock conversation action.
  const { createMockMutation } = messageActionApi(user._id);

  // Handle mock conversation
  const handleMockConversation = () => {
    const existingConversation = conversations?.find(
      (conversation: Conversations) =>
        conversation.participants[0]._id === user._id
    );
    if (existingConversation) {
      handleConversationSelect(existingConversation);
    } else {
      createMockMutation(true);
    }
  };

  return (
    <button
      onClick={handleMockConversation}
      className="flex items-center w-full h-full gap-3 p-2 lg:p-4 border border-transparent hover:border hover:border-primary rounded cursor-pointer"
    >
      {/* Display Search user */}
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
