"use client";
import { Menu, User, ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useTranslations } from "next-intl";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const t = useTranslations();
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <header className="py-4 sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-bg/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between transition-colors duration-300">
      {/* 1. Left Section: Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="cursor-pointer lg:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-4 py-2">
          {/* 2. Text Content */}
          <div className="flex flex-col">
            {/* Breadcrumb style sub-text */}
            <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              <span>Bulls Yatirim</span>
              <ChevronRight size={12} className="mt-px" />
              <span className="text-slate-500 dark:text-slate-300">
                {t("PAGES")}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-xl font-extrabold tracking-tight text-fg">
              {t("ADMIN_DASHBOARD")}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Right Section: Tools & Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        <div className="flex items-center border-r border-slate-400 dark:border-slate-800 pr-2 lg:pr-4 gap-1 lg:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* User Profile Dropdown Placeholder */}
        <button className="cursor-pointer flex items-center gap-3 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-fg capitalize">
              {currentUser?.fullname}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {currentUser?.role?.name}
            </p>
          </div>
          {(currentUser?.avatar as any)?.url ? (
            <div className="cursor-pointer w-9 h-9 rounded-xl">
              <img
                src={(currentUser?.avatar as any)?.url}
                alt="Profile"
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
          ) : (
            <div className="h-9 w-9 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center text-brand">
              <User size={20} />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
