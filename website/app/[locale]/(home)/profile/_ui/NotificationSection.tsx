import { formatDate } from "@/lib/helpers";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useUpdateNotificationSettingsMutation,
} from "@/lib/redux/services/notification.api";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function NotificationsSection({
  user,
}: {
  user: Record<string, any> | null;
}) {
  const t = useTranslations();
  const [filter, setFilter] = useState("all");

  const { data: notifications = [], isLoading } = useGetNotificationsQuery(
    undefined,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [updateSettings, { isLoading: isUpdatingSettings }] =
    useUpdateNotificationSettingsMutation();

  const filteredItems =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  // Handlers
  const handleMarkAllRead = async () => {
    await markAsRead({}).unwrap();
  };

  const handleMarkSingleRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    await markAsRead({ id }).unwrap();
  };

  const handleToggle = async (type: "push" | "email", currentVal: boolean) => {
    await updateSettings({
      [type === "push" ? "pushEnabled" : "emailEnabled"]: !currentVal,
    }).unwrap();
  };

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse font-black uppercase tracking-widest">
        {t("LOADING_FEED")}
      </div>
    );

  const filters = [
    { key: "all", label: t("FILTER_ALL") },
    { key: "trade", label: t("FILTER_TRADE") },
    { key: "wallet", label: t("FILTER_WALLET") },
    { key: "security", label: t("FILTER_SECURITY") },
    { key: "system", label: t("FILTER_SYSTEM") },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            {t("NOTIFICATIONS_TITLE")}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">
            {t("NOTIFICATIONS_SUBTITLE")}
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors"
        >
          {t("MARK_ALL_READ")}
        </button>
      </header>

      {/* --- Filter Bar --- */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`cursor-pointer px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f.key
                ? "bg-white dark:bg-slate-800 text-brand shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* --- Notification List --- */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-4xl text-slate-500 text-xs font-bold uppercase tracking-widest">
            {t("NO_NOTIFICATIONS_FOUND", {
              filter: t(`FILTER_${filter.toUpperCase()}`),
            })}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkSingleRead(item.id, item.isRead)}
              className={`cursor-pointer group relative flex items-start gap-5 p-6 rounded-4xl border transition-all ${
                !item.isRead
                  ? "bg-bg border-slate-200 dark:border-slate-700 shadow-md"
                  : "bg-transparent border-slate-100 dark:border-slate-900 opacity-60"
              } ${item.urgent ? "bg-red-500/5 border-red-500/20" : "hover:border-brand/40"}`}
            >
              <div
                className={`mt-2 h-2 w-2 rounded-full shrink-0 ${
                  item.urgent
                    ? "bg-red-500 animate-pulse"
                    : item.isRead
                      ? "bg-slate-700"
                      : "bg-brand"
                }`}
              />

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-black uppercase tracking-tight ${item.urgent ? "text-red-600 dark:text-red-400" : "text-fg"}`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter tabular-nums">
                    {formatDate(item?.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Notification Settings Toggle --- */}
      <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-1 text-center lg:text-left">
            <h3 className="text-sm font-black uppercase tracking-widest">
              {t("NOTIFICATION_CHANNELS")}
            </h3>
            <p className="text-xs text-slate-400 font-medium italic">
              {t("CHANNELS_SUBTITLE")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.emailEnabled}
                  onChange={() => handleToggle("email", !!user?.emailEnabled)}
                  disabled={isUpdatingSettings}
                />
                <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-brand transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                {t("EMAIL_ALERTS")}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.pushEnabled}
                  onChange={() => handleToggle("push", !!user?.pushEnabled)}
                  disabled={isUpdatingSettings}
                />
                <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-brand transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                {t("PUSH_NOTIFICATIONS")}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
