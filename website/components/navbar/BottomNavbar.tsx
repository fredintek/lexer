"use client";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Briefcase,
  Home,
  LayoutDashboard,
  Plus,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {};

const BottomNavbar = (props: Props) => {
  const t = useTranslations();
  const pathname = usePathname();
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg border-t border-slate-200 dark:border-slate-800 flex">
      {/* Home */}
      <Link
        href="/"
        className={`flex-1 flex flex-col items-center gap-1 py-2 ${
          pathname === "/trade" ? "text-brand" : "text-slate-400"
        }`}
      >
        <Home size={20} />
        <span className="text-[9px] font-black uppercase tracking-wider">
          {t("HOME")}
        </span>
      </Link>

      {/* Markets */}
      <Link
        href="/markets"
        className={`flex-1 flex flex-col items-center gap-1 py-2 ${
          pathname === "/trade/markets" ? "text-brand" : "text-slate-400"
        }`}
      >
        <LayoutDashboard size={20} />
        <span className="text-[9px] font-black uppercase tracking-wider">
          {t("MARKETS")}
        </span>
      </Link>

      {/* Trade CTA */}
      <Link
        href="/trade"
        className="flex-1 flex flex-col items-center gap-1 py-2"
      >
        <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center -mt-3 shadow-lg shadow-brand/30">
          <Plus size={20} className="text-white" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          {t("TRADES")}
        </span>
      </Link>

      {/* Positions */}
      <Link
        href="/positions"
        className={`flex-1 flex flex-col items-center gap-1 py-2 ${
          pathname === "/trade/positions" ? "text-brand" : "text-slate-400"
        }`}
      >
        <Briefcase size={20} />
        <span className="text-[9px] font-black uppercase tracking-wider">
          {t("POSITIONS")}
        </span>
      </Link>

      {/* Profile */}
      <Link
        href="/profile"
        className={`flex-1 flex flex-col items-center gap-1 py-2 ${
          pathname === "/trade/profile" ? "text-brand" : "text-slate-400"
        }`}
      >
        <UserRound size={20} />
        <span className="text-[9px] font-black uppercase tracking-wider">
          {t("PROFILE")}
        </span>
      </Link>
    </div>
  );
};

export default BottomNavbar;
