"use client";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useAppSelector } from "@/lib/redux/store";
import React from "react";

type Props = { children: React.ReactNode };

const AppWrapper = ({ children }: Props) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const { onlineCount } = useOnlineUsers(currentUser?.user?.id as string);
  return <>{children}</>;
};

export default AppWrapper;
