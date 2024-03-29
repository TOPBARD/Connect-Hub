import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRecoilValue } from "recoil";
import { io, Socket } from "socket.io-client";
import userAtom from "../recoil-atoms/user-atom";
import { User } from "../shared/interface/User"; // Assuming User interface is defined here

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: User[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
};

interface SocketContextProviderProps {
  children: ReactNode;
}

export const SocketContextProvider = ({
  children,
}: SocketContextProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    let socket: Socket | null = null;

    if (user?._id) {
      socket = io(`${process.env.BACKEND_URL}`, {
        query: {
          userId: user?._id,
        },
      });

      setSocket(socket);

      socket.on("getOnlineUsers", (users: User[]) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      socket && socket.close();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
