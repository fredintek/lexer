"use client";
import Link from "next/link";
import {
  ChartCandlestick,
  LogOut,
  Menu,
  User,
  UserRound,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/navbar/ThemeToggle";
import LanguageSwitcher from "@/components/navbar/LanguageSwitcher";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useMemo, useState } from "react";
import AssetSearch from "./AssetSearch";
import DepositModal from "./DepositModal";
import Logo from "@/components/icons/Logo";
import { useTranslations } from "next-intl";
import { Dropdown, MenuProps } from "antd";
import { useLogoutMutation } from "@/lib/redux/services/auth.api";
import { useRouter } from "@/i18n/navigation";
import { useGetYfDetailsQuery } from "@/lib/redux/services/yfinance.api";
import TradeForm from "./TradeForm";

type Props = {};

const Navbar = (props: Props) => {
  const t = useTranslations();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const currentUser = useAppSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const { activeSymbol } = useAppSelector((state) => state.yfinanceDataReducer);

  const { data: quoteData, isLoading: quoteDataIsLoading } =
    useGetYfDetailsQuery(activeSymbol, {
      skip: !activeSymbol,
    });

  const hasValidTickData = useMemo(
    () => !quoteDataIsLoading && quoteData && quoteData.price,
    [quoteData, quoteDataIsLoading],
  );

  const openTradeDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

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
          href="/profile?tab=assets"
          className="flex items-center gap-3 px-1 py-1 text-[11px] font-black uppercase tracking-widest"
        >
          <ChartCandlestick size={14} /> {t("NAV_ASSETS")}
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

  const handleOpenDeposit = () => {
    setIsDepositOpen(true);
    setIsOpen(false);
  };

  return (
    <nav className="hidden md:block relative bg-bg text-fg font-sans border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 z-50">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* LEFT SECTION: Logo & Desktop Links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center text-white font-bold text-lg">
              <Logo />
            </div>
            <span className="font-bold text-sm tracking-tight text-fg uppercase">
              Bulls Yatirim
            </span>
          </Link>

          <button
            onClick={openTradeDrawer}
            className="md:hidden shrink-0 bg-up text-white text-[10px] px-3 py-1.5 rounded-md font-bold shadow-md active:scale-95 transition-transform"
          >
            {t("BUY")}
          </button>

          {/* Desktop Links - Hidden on Mobile */}
          <ul className="hidden lg:flex items-center space-x-6 text-[14px] font-medium opacity-80">
            <button
              onClick={handleOpenDeposit}
              className="cursor-pointer bg-brand hover:opacity-90 text-white font-bold py-1.5 px-4 rounded-md transition-all active:scale-95"
            >
              {t("NAV_DEPOSIT")}
            </button>
          </ul>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* SEARCH COMPONENT */}
          <AssetSearch />

          {/* Theme/Lang - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-3 text-gray-400 border-l border-gray-200 dark:border-gray-800 pl-4">
            <ThemeToggle />
            <LanguageSwitcher />
            {currentUser?.isAuthenticated ? (
              <div className="flex items-center">
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

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer lg:hidden p-1 text-gray-500 hover:text-brand transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`
        fixed inset-y-0 right-0 w-64 bg-bg border-l border-gray-200 dark:border-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="flex flex-col p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
            <span className="font-bold text-lg">{t("NAV_MENU")}</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col space-y-4 font-medium">
            {currentUser?.isAuthenticated && (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="py-2 border-b border-gray-50 dark:border-gray-900"
                >
                  {t("NAV_PROFILE")}
                </Link>
                <Link
                  href="/profile?tab=assets"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-brand transition-colors"
                >
                  {t("NAV_ASSETS")}
                </Link>
              </>
            )}
            <button
              onClick={handleOpenDeposit}
              className="w-full bg-brand text-white font-bold py-3 rounded-md"
            >
              {t("NAV_DEPOSIT")}
            </button>
          </nav>

          <div>
            <div className="flex items-center justify-around pt-4 border-t border-gray-100 dark:border-gray-800">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            <div
              onClick={handleLogout}
              className="w-fit ml-auto mt-4 flex items-center justify-end gap-3 px-1 py-1 text-[11px] font-black uppercase tracking-widest text-down"
            >
              <LogOut size={14} /> {t("NAV_LOGOUT")}
            </div>
          </div>

          {!currentUser?.isAuthenticated && (
            <div className="flex flex-col space-y-3 sm:hidden">
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center"
              >
                {t("NAV_LOG_IN")}
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-brand text-white rounded-md flex justify-center items-center"
              >
                {t("NAV_SIGN_UP")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* The Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      {/* TRADE FORM */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 md:hidden ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`absolute bottom-0 left-0 w-full bg-bg rounded-t-2xl p-6 transition-transform duration-300 ease-out shadow-2xl ${isDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
            <h3 className="text-lg font-bold uppercase tracking-wide">
              {t("PLACE_ORDER")}
            </h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          <TradeForm
            selectedSymbol={
              hasValidTickData
                ? {
                    symbol: activeSymbol,
                    price: quoteData.price.regularMarketPrice,
                    change:
                      quoteData.price.regularMarketChangePercent.toFixed(2),
                    name: quoteData.price.shortName || quoteData.price.longName,
                    volume: quoteData.price.regularMarketVolume,
                  }
                : { symbol: activeSymbol, price: 0, change: 0 }
            }
            user={currentUser?.user}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
