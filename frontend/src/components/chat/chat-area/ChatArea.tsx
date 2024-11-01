import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Video, X } from "lucide-react";
import MessageInput from "../message-input/MessageInput";
import MessageContainer from "../MessageContainer/MessageContainer";
import ChatPlaceHolder from "../chat-placeholder/ChatPlaceholder";
import GroupMembersDialog from "../group-members-dialog/GroupMemberDialog";
const ChatArea = () => {
  const selectedConversation = true;
  if (!selectedConversation) return <ChatPlaceHolder />;

  const conversationName = "John Doe";
  const isGroup = true;

  return (
    <div className="w-3/4 flex flex-col">
      <div className="sticky top-0 z-50">
        {/* Header */}
        <div className="flex justify-between bg-gray-primary p-3">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={"/placeholder.png"} className="object-cover" />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>{conversationName}</p>
              {isGroup && <GroupMembersDialog />}
            </div>
          </div>

          <div className="flex items-center gap-7 mr-5">
            <a href="/video-call" target="_blank">
              <Video size={23} />
            </a>
            <X size={16} className="cursor-pointer" />
          </div>
        </div>
      </div>
      {/* CHAT MESSAGES */}
      <MessageContainer />

      {/* INPUT */}
      <MessageInput />
    </div>
  );
};
export default ChatArea;