"use client";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { Search, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import AssetSearch from "@/app/[locale]/(home)/trade/_ui/AssetSearch";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";

type Props = {};

const Navbar = (props: Props) => {
  const t = useTranslations();
  const currentUser: any = useAppSelector(selectCurrentUser);
  return (
    <nav>
      {/* MOBILE NAVBAR */}
      <div className="md:hidden py-2 bg-bg text-fg font-sans border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 z-50 fixed top-0 w-full">
        <div className="px-4 flex justify-between items-center">
          {/* left */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center text-white font-bold text-lg">
              <img
                src="/icon-512x512.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* right */}
          <div className="flex gap-4 items-center">
            <Link href="/markets">
              <Search
                size={18}
                className="text-gray-500 dark:text-gray-500 cursor-pointer"
              />
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* DESKTOP NAVBAR */}
      <div className="hidden md:block py-2 bg-bg text-fg font-sans border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 z-50 fixed w-full top-0">
        <div className="px-4 flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-lg overflow-hidden rounded-xl">
              <img
                src="/icon-512x512.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* MIDDLE: Primary Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/markets" className="group flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                {t("NAV_MARKETS")}
              </span>
            </Link>
            <Link href="/positions" className="group flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                {t("POSITIONS")}
              </span>
            </Link>
            <Link href="/trade" className="group flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                {t("TRADE")}
              </span>
            </Link>
          </div>

          {/* RIGHT: Utility & Profile */}
          <div className="flex items-center gap-4">
            {/* Search Trigger */}
            <AssetSearch />

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Divider */}
            <div className="h-8 w-1px bg-gray-200 dark:bg-gray-800 mx-2" />

            {/* Profile */}
            <Link
              href="/profile"
              className="flex items-center gap-3 pl-2 group"
            >
              <div className="text-right hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                  {currentUser?.user?.fullname}
                </p>
                <p className="text-xs font-black text-slate-400 tracking-tight group-hover:text-brand transition-colors">
                  {currentUser?.user?.email}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all">
                <UserRound size={20} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
