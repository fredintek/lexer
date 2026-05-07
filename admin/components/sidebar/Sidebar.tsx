"use client";
import { LogOut, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { navlinks } from "./data";
import { useLogoutMutation } from "@/lib/redux/services/auth.api";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Logo from "../icons/Logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [logout, { isSuccess: isLogoutSuccess }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    if (isLogoutSuccess) {
      toast.success("logout successful");
      router.refresh();
    }
  }, [isLogoutSuccess]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-60 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 h-screen left-0 z-70 w-56 bg-bg border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 1. Brand Section */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center text-white font-bold text-lg">
              <Logo />
            </div>
            <span className="font-bold text-sm tracking-tight text-fg uppercase">
              Bulls Yatirim
            </span>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="cursor-pointer lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Navigation Section */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-8 py-4">
          {navlinks.map((group) => (
            <div key={group.label}>
              <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-600 mb-2 tracking-widest uppercase">
                {t(group.label)}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive(item.href)
                        ? "bg-brand/10 text-brand"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-fg"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={
                        isActive(item.href)
                          ? "text-brand"
                          : "text-slate-400 group-hover:text-fg"
                      }
                    />
                    <span className="text-sm font-semibold">
                      {t(item.name)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* 3. Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 w-full px-3 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-semibold text-sm"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
