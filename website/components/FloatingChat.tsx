"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { io, Socket } from "socket.io-client";
import { chatApi, useGetChatHistoryQuery } from "@/lib/redux/services/chat.api";

export default function FloatingChat() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: history, isLoading: isHistoryLoading } = useGetChatHistoryQuery(
    undefined,
    {
      skip: !user,
    },
  );

  // 1. Initialize Connection
  useEffect(() => {
    if (!user) return;

    const s = io(`${process.env.NEXT_PUBLIC_BASE_URL}/chat`, {
      transports: ["websocket"],
    });

    s.emit("joinRoom", { roomId: user.id });

    s.on("newMessage", (msg) => {
      // Only adding if it's not already in history (to prevent duplicates)
      setChatHistory((prev) => {
        const exists = prev.find((m) => m.id === msg.id);
        return exists ? prev : [...prev, msg];
      });

      // Re-sort the sidebar queue
      dispatch(chatApi.util.invalidateTags(["Chat"]));
    });

    setSocket(s);
    return () => {
      setChatHistory([]);
      s.disconnect();
    };
  }, [user]);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [chatHistory, isOpen]);

  useEffect(() => {
    if (history) {
      setChatHistory(history);
    }
  }, [history]);

  const handleSend = () => {
    if (!message.trim() || !socket || !user) return;

    const payload = {
      roomId: user.id,
      content: message,
      senderId: user.id,
      isAdmin: false,
    };

    socket.emit("sendMessage", payload);
    setMessage("");
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-999 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-87.5 h-125 bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-5 bg-brand text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <User size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight">
                  Lexer Support
                </h4>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                  Always Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-2 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-transparent custom-scrollbar"
          >
            {chatHistory.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  How can we help today?
                </p>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.isAdmin
                      ? "bg-slate-100 dark:bg-slate-900 text-fg rounded-tl-none"
                      : "bg-brand text-white rounded-tr-none shadow-md shadow-brand/10"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message support..."
                className="flex-1 bg-transparent border-none outline-none text-xs px-3 font-bold text-fg placeholder:text-slate-400"
              />
              <button
                onClick={handleSend}
                className="h-10 w-10 bg-brand text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer h-16 w-16 bg-brand text-white rounded-[1.75rem] shadow-2xl shadow-brand/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}

        {/* Unread Indicator Pulse */}
        {!isOpen && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-up border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
