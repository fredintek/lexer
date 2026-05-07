import { Bell, Info, MoreVertical, ShieldAlert, Zap } from "lucide-react";

type Props = {
  type: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
};

const styles: Record<string, any> = {
  security: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  system: { icon: Zap, color: "text-brand", bg: "bg-brand/10" },
  transaction: {
    icon: Info,
    color: "text-brand-secondary",
    bg: "bg-brand-secondary/10",
  },
  info: {
    icon: Bell,
    color: "text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
  },
};

const NotificationItem = ({
  type,
  title,
  description,
  time,
  isRead,
}: Props) => {
  const config = styles[type] || styles.info;

  return (
    <div
      className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer group ${
        isRead
          ? "bg-bg border-slate-200 dark:border-slate-800 opacity-70"
          : "bg-bg border-brand/20 shadow-sm shadow-brand/5"
      }`}
    >
      {/* Unread Indicator Dot */}
      {!isRead && (
        <div className="absolute top-6 left-2 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
      )}

      {/* Icon */}
      <div
        className={`h-12 w-12 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}
      >
        <config.icon size={22} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3
            className={`text-sm font-bold ${isRead ? "text-slate-600 dark:text-slate-400" : "text-fg"}`}
          >
            {title}
          </h3>
          <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {time}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;
