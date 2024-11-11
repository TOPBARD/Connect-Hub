import { BsFillArrowUpLeftCircleFill } from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa";
import LoadingSpinner from "../../../../shared/loading-spinner/LoadingSpinner";
import { useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import UserSearchCard from "../../user-search-card/UserSearchCard";
import Conversation from "../conversation/Conversation";
import { Conversations } from "@/shared/interface/Chat";
import RightPanelSkeleton from "../../../../components/right-panel/RightPanelSkeleton";
import messageApi from "@/api/message/message";
import searchApi from "@/api/message/search";

const LeftSidebar = () => {
  const [search, setSearch] = useState("");
  const { conversations, loadingConversation } = messageApi();
  const { searchUser, searchingUser, refetch } = searchApi(search);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    if (search) refetch();
  }, [search, refetch]);
  return (
    <div className="w-full">
      <div className="h-16 flex items-center">
        <h2 className="text-xl font-bold p-4">Message</h2>
        <button
          onClick={() => {
            if (
              modalRef.current &&
              modalRef.current instanceof HTMLDialogElement
            ) {
              modalRef.current.showModal();
            }
          }}
        >
          <div
            title="add friend"
            className="w-12 h-12 flex justify-center items-center cursor-pointer  rounded"
          >
            <FaUserPlus size={20} />
          </div>
        </button>
      </div>
      <div className="bg-slate-200 p-[0.5px]"></div>

      <dialog ref={modalRef} id="search_user_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md scrollbar">
          <div className="w-full max-w-lg mx-auto mt-10  ">
            <div className="bg-primary rounded h-14 overflow-hidden flex ">
              <input
                type="text"
                placeholder="Search user by name, email...."
                className="w-full outline-none py-1 h-full px-4 text-slate-500"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <div className="h-14 w-14 flex justify-center items-center">
                <IoSearchOutline size={25} />
              </div>
            </div>
            {/**display search user */}
            <div className="mt-2 w-full p-4 rounded">
              {/**no user found */}
              {!searchUser?.length && !searchingUser && (
                <p className="text-center text-slate-500">NO USER FOUND!</p>
              )}
              {searchingUser && (
                <p className="text-center text-slate-500">
                  <LoadingSpinner />
                </p>
              )}
              {searchUser &&
                searchUser?.length > 0 &&
                !searchingUser &&
                searchUser.map((user) => {
                  return <UserSearchCard key={user._id} user={user} />;
                })}
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
      <div className=" h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar">
        {conversations && conversations?.length === 0 && (
          <div className="mt-12">
            <div className="flex justify-center items-center my-4 text-slate-500">
              <BsFillArrowUpLeftCircleFill size={50} />
            </div>
            <p className="text-lg text-center text-slate-400">
              Explore users to start a conversation with.
            </p>
            {/**search user */}
          </div>
        )}
        {loadingConversation ? (
          <div className="flex flex-col justify-center items-center">
            <RightPanelSkeleton />
            <RightPanelSkeleton />
            <RightPanelSkeleton />
          </div>
        ) : (
          <Conversation conversations={conversations as Conversations[]} />
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
