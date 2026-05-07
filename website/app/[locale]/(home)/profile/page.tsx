"use client";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Shield,
  Wallet,
  CreditCard,
  Bell,
  LayoutGrid,
} from "lucide-react";
import { useGetMeQuery } from "@/lib/redux/services/user.api";
import { useGetNotificationsQuery } from "@/lib/redux/services/notification.api";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import WalletSection from "./_ui/WalletSection";
import PaymentsSection from "./_ui/PaymentsSection";
import OverviewSection from "./_ui/OverviewSection";
import SecuritySection from "./_ui/SecuritySection";
import NotificationsSection from "./_ui/NotificationSection";
import AssetsSection from "./_ui/AssetsSection";

export default function ProfilePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const { data: user, isLoading } = useGetMeQuery(undefined);

  const { data: notifications = [] } = useGetNotificationsQuery();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const menuItems = [
    { id: "overview", label: t("TAB_OVERVIEW"), icon: <User size={18} /> },
    { id: "wallet", label: t("TAB_WALLET"), icon: <Wallet size={18} /> },
    { id: "assets", label: t("TAB_ASSETS"), icon: <LayoutGrid size={18} /> },
    {
      id: "payments",
      label: t("TAB_PAYMENTS"),
      icon: <CreditCard size={18} />,
    },
    { id: "security", label: t("TAB_SECURITY"), icon: <Shield size={18} /> },
    {
      id: "notifications",
      label: t("TAB_NOTIFICATIONS"),
      icon: <Bell size={18} />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
  };

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  if (isLoading)
    return (
      <div className="p-20 text-center font-black uppercase">
        {t("LOADING_PROFILE")}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-bg text-fg overflow-hidden">
      {/* --- Sidebar Navigation --- */}
      <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-4">
          {t("ACCOUNT_SETTINGS")}
        </h2>
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`shrink-0 cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                activeTab === item.id
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>

              {item.id === "notifications" && unreadCount > 0 && (
                <span
                  className={`flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[9px] font-black leading-none bg-down text-white`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "overview" && (
          <OverviewSection user={user} setActiveTab={setActiveTab} />
        )}
        {activeTab === "wallet" && <WalletSection user={user} />}
        {activeTab === "assets" && <AssetsSection />}
        {activeTab === "payments" && <PaymentsSection />}
        {activeTab === "security" && <SecuritySection user={user} />}
        {activeTab === "notifications" && <NotificationsSection user={user} />}
      </main>
    </div>
  );
}
