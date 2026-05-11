"use client";
import {
  UserPlus,
  Users,
  CheckCircle,
  Clock,
  ShieldAlert,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import InviteUserModal from "./_ui/InviteUserModal";
import { useTranslations } from "next-intl";
import UserTab from "./_ui/UserTab";
import {
  useGetUserDetailsByIdsQuery,
  useGetUserMetricsQuery,
} from "@/lib/redux/services/user.api";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { formatCurrency, getLogoUrl } from "@/lib/helpers";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { Link } from "@/i18n/navigation";

const UsersPage = () => {
  const t = useTranslations();
  const currentUser = useAppSelector(selectCurrentUser);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { data: metrics } = useGetUserMetricsQuery();
  const { onlineCount, onlineUsers } = useOnlineUsers(currentUser?.id);

  const stats = [
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
      onClick: () => setIsOnlineModalOpen(true),
    },
    {
      label: t("TOTAL_BALANCE"),
      value: `₺${formatCurrency(metrics?.totalBalance as number)}`,
      icon: Wallet,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

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
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={stat.onClick}
            className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 ${stat.onClick ? "cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all" : ""}`}
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

      {/* Online Users Modal */}
      {isOnlineModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsOnlineModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-black text-fg tracking-tight">
                  {t("ONLINE_USERS")}
                </h2>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                  {onlineCount}
                </span>
              </div>
              <button
                onClick={() => setIsOnlineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-3">
              {onlineUsers?.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-12">
                  No users online
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {onlineUsers?.map((user: any) => (
                    <Link
                      key={user.id}
                      href={
                        currentUser?.id === user?.id
                          ? "/dashboard/profile"
                          : `/dashboard/users/${user?.id}`
                      }
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10">
                          {getLogoUrl(user?.avatar?.url) ? (
                            <img
                              src={getLogoUrl(user?.avatar?.url)}
                              alt=""
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="text-white w-full h-full bg-brand/50 rounded-2xl flex items-center justify-center font-black">
                              <p className="">{user?.fullname?.slice(0, 2)}</p>
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-fg">
                          {user?.fullname}
                        </span>
                        <span className="text-xs text-slate-400">
                          {user.email}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
