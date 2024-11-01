import ChatArea from "../../components/chat/chat-area/ChatArea";
import RightPanel from "../../components/chat/right-panel/RightPanel";

const ChatPage = () => {
  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen flex w-full mx-auto bg-left-panel overflow-hidden">
      <RightPanel />
      <ChatArea />
    </div>
  );
};
export default ChatPage;
