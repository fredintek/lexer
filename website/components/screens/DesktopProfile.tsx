import NotificationsSection from "@/app/[locale]/(home)/profile/_ui/NotificationSection";
import OverviewSection from "@/app/[locale]/(home)/profile/_ui/OverviewSection";
import PaymentsSection from "@/app/[locale]/(home)/profile/_ui/PaymentsSection";
import SecuritySection from "@/app/[locale]/(home)/profile/_ui/SecuritySection";
import WalletSection from "@/app/[locale]/(home)/profile/_ui/WalletSection";
import { useRouter } from "@/i18n/navigation";
import { useGetNotificationsQuery } from "@/lib/redux/services/notification.api";
import { useGetMeQuery } from "@/lib/redux/services/user.api";
import { Bell, CreditCard, Shield, User, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DesktopProfile() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const { data: user, isLoading } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: notifications = [] } = useGetNotificationsQuery();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const menuItems = [
    { id: "overview", label: t("TAB_OVERVIEW"), icon: <User size={16} /> },
    { id: "wallet", label: t("TAB_WALLET"), icon: <Wallet size={16} /> },
    {
      id: "payments",
      label: t("TAB_PAYMENTS"),
      icon: <CreditCard size={16} />,
    },
    { id: "security", label: t("TAB_SECURITY"), icon: <Shield size={16} /> },
    {
      id: "notifications",
      label: t("TAB_NOTIFICATIONS"),
      icon: <Bell size={16} />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    router.push(`?tab=${id}`, { scroll: false });
  };

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  if (isLoading)
    return (
      <div className="hidden md:flex h-screen items-center justify-center font-black uppercase tracking-widest text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          {t("LOADING_PROFILE")}
        </div>
      </div>
    );

  return (
    <div className="hidden md:block box min-h-[calc(100vh-64px)] bg-bg text-fg">
      {/* --- Horizontal Tabs Navigation --- */}
      <div className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="box">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative shrink-0 cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${
                    isActive
                      ? "bg-fg text-bg dark:bg-white dark:text-black shadow-xl"
                      : "text-slate-500 hover:text-fg hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>

                  {item.id === "notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-down text-white text-[8px] font-black border-2 border-bg">
                      {unreadCount > 9 ? "!" : unreadCount}
                    </span>
                  )}

                  {/* Animated underline for active state */}
                  {isActive && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-brand rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <main className="box pb-10 animate-in fade-in duration-700">
        <div className="mt-4">
          {activeTab === "overview" && (
            <OverviewSection user={user} setActiveTab={setActiveTab} />
          )}
          {activeTab === "wallet" && <WalletSection user={user} />}
          {activeTab === "payments" && <PaymentsSection />}
          {activeTab === "security" && <SecuritySection user={user} />}
          {activeTab === "notifications" && (
            <NotificationsSection user={user} />
          )}
        </div>
      </main>
    </div>
  );
}
