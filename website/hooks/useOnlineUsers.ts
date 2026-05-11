"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/users`;

export const useOnlineUsers = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      socket?.disconnect();
      setSocket(null);
      return;
    }
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      query: {
        userId,
      },
    });

    setSocket(s);

    s.on("online_users_count", (data) => {
      setOnlineCount(data?.count);
      setOnlineUsers(data?.data);
    });

    return () => {
      s.disconnect();
    };
  }, [userId]);

  return { socket, onlineCount, onlineUsers };
};
