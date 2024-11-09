import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import getUserApi from "@/api/auth/auth.user";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: String[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketContextProviderProps {
  children: ReactNode;
}

export const SocketContextProvider = ({
  children,
}: SocketContextProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<String[]>([]);
  const { authUser } = getUserApi();
  useEffect(() => {
    if (authUser?._id) {
      const newSocket = io(`${process.env.BACKEND_URL}`, {
        query: { userId: authUser._id },
      });
      setSocket(newSocket);

      // Listen for "online-users" event
      newSocket.on("online-users", (users: string[]) => {
        setOnlineUsers(users);
      });
      return () => {
        newSocket.close();
      };
    }
    return undefined;
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
};
