"use client";
import { useState } from "react";
import { Trash2, CheckCheck } from "lucide-react";
import NotificationItem from "../_ui/notification/NotificationItem";

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("All");

  const categories = ["All", "System", "Security", "Transactions"];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 1. Header with Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
              Notifications
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-black">
              12 NEW
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Manage system alerts and administrative broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-bg border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:text-fg transition-colors cursor-pointer">
            <CheckCheck size={16} />
            <span>Mark all as read</span>
          </button>
          <button className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors cursor-pointer">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === cat
                ? "bg-bg text-brand shadow-sm"
                : "text-slate-500 hover:text-fg"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <div className="flex flex-col gap-3">
        {/* Urgent Security Alert */}
        <NotificationItem
          type="security"
          title="Suspicious Login Detected"
          description="Multiple failed login attempts from IP 192.168.1.104 in Istanbul, TR."
          time="2 minutes ago"
          isRead={false}
        />

        {/* System Info */}
        <NotificationItem
          type="system"
          title="Engine Update Successful"
          description="Lexer Synthetic Engine v2.4.0 has been deployed to all production nodes."
          time="4 hours ago"
          isRead={false}
        />

        {/* Transaction Alert */}
        <NotificationItem
          type="transaction"
          title="High Volume Alert"
          description="BIST100_SYNTH volume exceeded $5M in the last 15 minutes."
          time="1 day ago"
          isRead={true}
        />

        {/* General Info */}
        <NotificationItem
          type="info"
          title="Scheduled Maintenance"
          description="Database optimization scheduled for Sunday, 02:00 AM UTC."
          time="2 days ago"
          isRead={true}
        />
      </div>

      {/* 4. Footer Load More */}
      {/* <button className="py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-brand transition-colors cursor-pointer">
        Load older notifications
      </button> */}
    </div>
  );
};

export default NotificationsPage;
