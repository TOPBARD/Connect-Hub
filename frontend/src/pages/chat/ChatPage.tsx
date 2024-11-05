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
          className={`ml-1 w-full h-full lg:flex flex-col items-center justify-center ${
            !selectedConversationId && "hidden"
          }`}
        >
          {selectedConversationId ? (
            <ChatArea />
          ) : (
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
          )}
        </section>
      </div>
    </>
  );
};

export default ChatPage;
