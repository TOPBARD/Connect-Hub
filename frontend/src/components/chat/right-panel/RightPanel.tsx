import { ListFilter, MessageSquareDiff, Search } from "lucide-react";
import { Input } from "../../ui/input";
import { conversations } from "../../../shared/dummy/dummydata";
import Conversation from "../conversation/Conversation";
import UserListDialog from "../user-list-dialog/UserListDialog";

const RightPanel = () => {
  return (
    <div className="w-1/4 border-gray-600 border-r">
      <div className="sticky top-0 bg-left-panel z-10">
        {/* Header */}
        <div
          className="flex justify-end bg-gray-primary items-center"
          style={{ padding: "1.37rem" }}
        >
          <UserListDialog/>
        </div>
        <div className="p-3 flex items-center">
          {/* Search */}
          <div className="relative h-10 mx-3 flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search or start a new chat"
              className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-gray-primary focus-visible:ring-transparent"
            />
          </div>
          <ListFilter className="cursor-pointer" />
        </div>
      </div>

      {/* Chat List */}
      <div className="my-3 flex flex-col gap-0 max-h-[80%] overflow-auto">
        {conversations?.map((conversation) => (
          <Conversation key={conversation._id} conversation={conversation} />
        ))}

        {conversations?.length === 0 && (
          <>
            <p className="text-center text-gray-500 text-sm mt-3">
              No conversations yet
            </p>
            <p className="text-center text-gray-500 text-sm mt-3 ">
              We understand {"you're"} an introvert, but {"you've"} got to start
              somewhere 😊
            </p>
          </>
        )}
      </div>
    </div>
  );
};
export default RightPanel;