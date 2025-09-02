import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocketHandle = (userId: string, threadId: string, platform: string, SOCKET_URL: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      query: { userId, threadId, platform },
      transports: ["websocket"],
      timeout: 1200000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    console.log("🔄 New socket created for thread:", threadId);

    return () => {
      newSocket.disconnect();
    };
  }, [threadId, userId, platform, SOCKET_URL]);

  return socket;
};
