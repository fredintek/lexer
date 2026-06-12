"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  User,
  ShieldCheck,
  Clock,
  ChevronLeft,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { io, Socket } from "socket.io-client";
import {
  chatApi,
  useGetRoomMessagesQuery,
  useGetSupportRoomsQuery,
} from "@/lib/redux/services/chat.api";
import { formatDate } from "@/lib/helpers";
import { useTranslations } from "next-intl";

export default function ChatPage() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const currentAdminUser = useAppSelector(selectCurrentUser);

  // State
  const [showList, setShowList] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // API Data
  const { data: rooms, isLoading: loadingRooms } = useGetSupportRoomsQuery();
  const { data: history, isFetching: loadingHistory } = useGetRoomMessagesQuery(
    selectedRoomId!,
    {
      skip: !selectedRoomId,
    },
  );

  const activeRoom = useMemo(
    () => rooms?.find((r) => r.id === selectedRoomId),
    [rooms, selectedRoomId],
  );

  const avatar = activeRoom?.user?.avatar?.url
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${activeRoom?.user?.avatar?.url}`
    : null;

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];

    return rooms.filter((room) => {
      const name = (room.user.fullname || "").toLowerCase();
      const slicedId = `user #${room.user.id.slice(0, 6)}`.toLowerCase();
      const search = searchTerm.toLowerCase();

      return name.includes(search) || slicedId.includes(search);
    });
  }, [rooms, searchTerm]);

  const handleSelectChat = (roomId: string, userId: string) => {
    setSelectedRoomId(roomId);
    setLiveMessages([]);
    setShowList(false);
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
    socket?.emit("joinRoom", { roomId: userId });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedRoomId || !activeRoom || !socket)
      return;

    const payload = {
      roomId: activeRoom.user.id,
      content: messageInput,
      senderId: currentAdminUser?.id,
      isAdmin: true,
    };

    socket?.emit("sendMessage", payload);
    setMessageInput("");
  };

  useEffect(() => {
    if (history) {
      setLiveMessages(history);
    } else {
      setLiveMessages([]);
    }
  }, [history]);

  useEffect(() => {
    if (socket && activeRoom) {
      socket.emit("joinRoom", { roomId: activeRoom.user.id });
    }
  }, [selectedRoomId, socket, activeRoom]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [liveMessages]);

  useEffect(() => {
    if (!currentAdminUser) return;
    const s = io(`${process.env.NEXT_PUBLIC_BASE_URL}/chat`, {
      transports: ["websocket"],
    });

    s.on("newMessage", (msg) => {
      // If message is for the current open chat, add to live view
      setLiveMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);
        return exists ? prev : [...prev, msg];
      });
      // Re-sort the sidebar queue
      dispatch(chatApi.util.invalidateTags(["Chat", "Room"]));
    });

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [dispatch, currentAdminUser]);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4 p-2 md:p-4 overflow-hidden relative">
      {/* 1. Conversations List (Left) */}
      <div
        className={`
        ${showList ? "flex" : "hidden md:flex"} 
        w-full md:w-80 flex-col bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shrink-0
      `}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black tracking-tighter text-fg uppercase mb-4">
            {t("SUPPORT_QUEUE")}
          </h2>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={t("SEARCH_CHATS")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-medium outline-none border-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingRooms ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-brand" />
            </div>
          ) : (
            filteredRooms?.map((room) => (
              <div
                key={room.id}
                onClick={() => handleSelectChat(room.id, room.user.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all ${selectedRoomId === room.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "hover:bg-slate-50 dark:hover:bg-slate-900"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-xs font-bold ${selectedRoomId === room.id ? "text-white" : "text-fg"}`}
                  >
                    {room.user.fullname || `User #${room.user.id.slice(0, 6)}`}
                  </span>
                  {/* THE RED NOTIFICATION BADGE */}
                  {selectedRoomId !== room?.id &&
                    unreadCounts[room?.id] > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-up px-1 text-[9px] font-black text-white animate-pulse">
                        {unreadCounts[room?.id]}
                      </span>
                    )}
                  <span
                    className={`text-[10px] ${selectedRoomId === room.id ? "text-white/70" : "text-slate-400"}`}
                  >
                    {formatDate(room.lastMessageAt)}
                  </span>
                </div>
                <p
                  className={`text-[11px] truncate ${selectedRoomId === room.id ? "text-white/90" : "text-slate-500"}`}
                >
                  {room.status === "OPEN"
                    ? t("ACTIVE_CONVERSATION")
                    : t("CHAT_CLOSED")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Main Chat Window (Middle) */}
      <div
        className={`
        ${!showList ? "flex" : "hidden md:flex"} 
        flex-1 flex-col bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden
      `}
      >
        {selectedRoomId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowList(true)}
                  className="p-2 -ml-2 md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <User size={20} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-fg">
                    {activeRoom?.user.username}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-up animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {t("ONLINE")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30 dark:bg-transparent custom-scrollbar"
            >
              {loadingHistory && (
                <div className="text-center text-xs text-slate-400 uppercase font-bold animate-pulse">
                  {t("LOADING_HISTORY")}
                </div>
              )}
              {liveMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${msg.isAdmin ? "bg-brand text-white rounded-tr-none" : "bg-slate-100 dark:bg-slate-900 text-fg rounded-tl-none"}`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span
                      className={`text-[10px] mt-2 block ${msg.isAdmin ? "text-white/70" : "text-slate-400"}`}
                    >
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 bg-bg border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl">
                <button className="p-2 text-slate-400 hover:text-brand transition-colors">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={t("TYPE_YOUR_RESPONSE")}
                  className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1 font-medium text-fg"
                />
                <button
                  onClick={handleSendMessage}
                  className="h-10 w-10 bg-brand text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
              <MessageCircle size={40} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest">
              {t("NO_CHAT_SELECTED")}
            </h3>
            <p className="text-xs font-medium">{t("SELECT_USER_TO_START")}</p>
          </div>
        )}
      </div>

      {/* 3. User Detail Panel (Right) */}
      {activeRoom && (
        <div className="w-72 hidden xl:flex flex-col gap-4">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="user-avatar"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <User size={40} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-fg uppercase tracking-tight">
                  {activeRoom.user.fullname}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t("TRADER_UID")}: {activeRoom.user.tag}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <DetailRow
                label={t("KYC_STATUS")}
                value={activeRoom?.user?.kyc?.status}
                icon={<ShieldCheck size={16} className="text-up" />}
              />
              <DetailRow
                label={t("ROLE")}
                value={activeRoom?.user?.role?.name}
                icon={<Clock size={16} className="text-brand" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <span className="text-[10px] font-black text-fg uppercase">{value}</span>
    </div>
  );
}
