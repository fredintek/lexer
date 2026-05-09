"use client";
import {
  UserPlus,
  Users,
  CheckCircle,
  Clock,
  ShieldAlert,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import InviteUserModal from "./_ui/InviteUserModal";
import { useTranslations } from "next-intl";
import UserTab from "./_ui/UserTab";
import { useGetUserMetricsQuery } from "@/lib/redux/services/user.api";
import { io } from "socket.io-client";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { formatCurrency } from "@/lib/helpers";

const UsersPage = () => {
  const t = useTranslations();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { data: metrics } = useGetUserMetricsQuery();
  const { onlineCount } = useOnlineUsers();

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
            {t("USER_MANAGEMENT")}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {t("VIEW_EDIT_GUIDE")}
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="w-fit flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all cursor-pointer"
        >
          <UserPlus size={18} />
          <span>{t("ADD_NEW_USER")}</span>
        </button>
      </div>

      {/* 2. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
        {[
          {
            label: t("TOTAL_USERS"),
            value: metrics?.totalUsers,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: t("ACTIVE_USERS"),
            value: metrics?.activeUsers,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: t("PENDING_KYC"),
            value: metrics?.pendingKyc,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: t("SUSPENDED"),
            value: metrics?.suspendedUsers,
            icon: ShieldAlert,
            color: "text-rose-500",
            bg: "bg-rose-50",
          },
          {
            label: t("ONLINE_USERS"),
            value: onlineCount,
            icon: TrendingUp,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
          },
          {
            label: t("TOTAL_BALANCE"),
            value: `₺${formatCurrency(metrics?.totalBalance as number)}`,
            icon: Wallet,
            color: "text-slate-700",
            bg: "bg-slate-100",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} dark:bg-slate-800 flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <h3 className="text-xl font-black text-fg tracking-tight">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <UserTab />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
