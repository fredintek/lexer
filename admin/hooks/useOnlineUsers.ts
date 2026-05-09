"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/users`;

export const useOnlineUsers = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("online_users_count", (count: number) => {
      setOnlineCount(count);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return { socket, onlineCount };
};
