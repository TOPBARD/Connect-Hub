import ChatArea from "@/components/chat/chat-area/ChatArea";
import LeftSidebar from "@/components/chat/left-panel/sidebar/LeftSidebar";
import { useSelectConversation } from "@/hooks/useSelectConversation";

const ChatPage = () => {
  const { selectedConversationId } = useSelectConversation();
  return (
    <>
      <div className="flex flex-row w-full h-screen max-h-screen">
        <section
          className={`bg-left-panel w-full sm:w-1/2  md:w-1/2 lg:w-2/5 ${
            selectedConversationId && "hidden"
          } lg:block`}
        >
          <LeftSidebar />
        </section>

        {/**message component**/}
        <section
          className={` w-full h-full lg:flex flex-col items-center justify-center ${
            !selectedConversationId && "hidden"
          }`}
        >
          <ChatArea selectedConversationId={selectedConversationId} />
        </section>
      </div>
    </>
  );
};

export default ChatPage;
