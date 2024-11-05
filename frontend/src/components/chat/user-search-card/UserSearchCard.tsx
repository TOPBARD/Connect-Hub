import { User } from "@/shared/interface/User";
import { useSocket } from "@/socket/Socket";
import { Link } from "react-router-dom";

const UserSearchCard = ({ user }: { user: User }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.includes(user._id);
  return (
    <Link
      to={"#"}
      className="flex items-center w-full h-full gap-3 p-2 lg:p-4 border border-transparent hover:border hover:border-primary rounded cursor-pointer"
    >
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={user?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <div>
        <div className="font-semibold text-ellipsis line-clamp-1">
          {user?.name}
          {isOnline && (
            <span className=" inline-block w-2 h-2 ml-2 bg-green-500 rounded-full"></span>
          )}
        </div>
        <p className="text-sm text-ellipsis line-clamp-1">@{user?.username}</p>
      </div>
    </Link>
  );
};

export default UserSearchCard;
