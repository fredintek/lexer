"use client";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronRight,
  UserRound,
  User,
  LogOut,
  ChartCandlestick,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { Dropdown, MenuProps } from "antd";
import { useLogoutMutation } from "@/lib/redux/services/auth.api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Logo from "../icons/Logo";

export default function Navbar() {
  const t = useTranslations();

  const currentUser = useAppSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logout, { isSuccess: isLogoutSuccess }] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("NAV_MARKETS"), href: "#markets" },
    { name: t("NAV_SYNTHETICS"), href: "#synthetics" },
    { name: t("NAV_FEES"), href: "#fees" },
    { name: t("NAV_COMPANY"), href: "#company" },
  ];

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Link
          href="/profile"
          className="flex items-center gap-3 px-1 py-1 text-[11px] font-black uppercase tracking-widest"
        >
          <User size={14} /> {t("NAV_PROFILE")}
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link
          href="/trade"
          className="flex items-center gap-3 px-1 py-1 text-[11px] font-black uppercase tracking-widest"
        >
          <ChartCandlestick size={14} /> {t("NAV_TRADE")}
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "3",
      danger: true,
      label: (
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-1 py-1 text-[11px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} /> {t("NAV_LOGOUT")}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isLogoutSuccess) {
      toast.success(t("LOGOUT_SUCCESS"));
      router.push("/");
    }
  }, [isLogoutSuccess]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-100 transition-all duration-300 border-b ${
        scrolled || isOpen
          ? "py-5 bg-bg/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/60 shadow-sm"
          : "py-5 bg-transparent border-transparent"
      }`}
    >
      <div className="px-6 flex items-center justify-between">
        {/* 1. Logo Section */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center text-white font-bold text-lg">
            <Logo />
          </div>
          <span className="font-bold text-sm tracking-tight text-fg uppercase">
            Bulls Yatirim
          </span>
        </Link>

        {/* 3. Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          {currentUser?.isAuthenticated ? (
            <div className="flex items-center">
              <Link
                href="/trade"
                className="text-[11px] font-black uppercase tracking-widest text-fg px-4"
              >
                {t("NAV_TRADE")}
              </Link>
              <Dropdown
                menu={{ items }}
                trigger={["click"]}
                placement="bottomRight"
              >
                {(currentUser?.user?.avatar as any)?.url ? (
                  <div className="cursor-pointer w-8 h-8 rounded-full">
                    <img
                      src={(currentUser?.user?.avatar as any)?.url}
                      alt="Profile"
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-brand hover:text-white transition-all cursor-pointer outline-none">
                    <UserRound size={20} />
                  </button>
                )}
              </Dropdown>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-[11px] font-black uppercase tracking-widest text-fg px-4"
              >
                {t("NAV_LOGIN")}
              </Link>
              <Link
                href="/auth/register"
                className="bg-fg text-bg dark:bg-white dark:text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
              >
                {t("NAV_OPEN_ACCOUNT")}
              </Link>
            </>
          )}
        </div>

        {/* 4. Mobile Toggle */}
        <button
          className="cursor-pointer md:hidden p-2 text-fg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 5. Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-bg h-max z-[-1] md:hidden transition-all duration-500 ease-in-out border-b shadow-md border-slate-200/60 dark:border-slate-800/60 ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6 pt-24 px-8">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-xl font-black uppercase tracking-tighter text-fg flex items-center justify-between group"
              >
                {link.name}
                <ChevronRight className="text-brand opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href={currentUser?.isAuthenticated ? "/trade" : "/auth/register"}
              className="w-full bg-brand text-white py-5 rounded-2xl text-center font-black uppercase tracking-widest text-sm"
            >
              {t("NAV_START_TRADING")}
            </Link>
            <div className="flex items-center justify-between gap-6 py-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
                {currentUser?.isAuthenticated && (
                  <Link href="/profile" className="">
                    <div className="p-1 bg-gray-300 rounded-full hover:bg-gray-200 transition-colors duration-300">
                      <UserRound size={20} />
                    </div>
                  </Link>
                )}
              </div>
              {currentUser?.isAuthenticated && (
                <div
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-1 py-1 text-[11px] font-black uppercase tracking-widest"
                >
                  <LogOut size={14} /> {t("NAV_LOGOUT")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
