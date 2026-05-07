"use client";
import { useEffect, useMemo, useState } from "react";
import TickerStat from "./TickerStat";
import { Loader2, Plus, Wallet, X } from "lucide-react";
import TradeForm from "./TradeForm";
import TradingChart from "./TradingChart";
import TradeOverview from "./TradeOverview";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { useGetStocksQuery } from "@/lib/redux/services/twelveData.api";
import { formatCurrency, formatVol, getLogoUrl } from "@/lib/helpers";
import TradingStatistics from "./TradingStatistics";
import {
  useGetYfDetailsQuery,
  yfinanceApi,
} from "@/lib/redux/services/yfinance.api";
import TradingNews from "./TradingNews";
import LiveSidebar from "./LiveSidebar";
import DepositModal from "./DepositModal";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import TradeTabs from "./TradeTabs";
import { io } from "socket.io-client";
import { useTranslations } from "next-intl";
import { useGetMeQuery } from "@/lib/redux/services/user.api";

type ViewTab = "Chart" | "Overview" | "Stats" | "News";

const TradeSection = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<ViewTab>("Chart");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeSymbol, exchange } = useAppSelector(
    (state) => state.yfinanceDataReducer,
  );
  const { data: user } = useGetMeQuery(undefined);

  // 1. Fetch from API
  const { data: stocks } = useGetStocksQuery(undefined);

  const { data: quoteData, isLoading: quoteDataIsLoading } =
    useGetYfDetailsQuery(activeSymbol, {
      skip: !activeSymbol,
    });

  // 2. Local state to handle real-time updates
  const [localStocks, setLocalStocks] = useState<any[]>([]);

  const isPositive = useMemo(() => {
    return Number(quoteData?.price?.regularMarketChangePercent) >= 0;
  }, [quoteData]);

  const hasValidTickData = useMemo(
    () => !quoteDataIsLoading && quoteData && quoteData.price,
    [quoteData, quoteDataIsLoading],
  );

  // 3. Initialize local state when API data arrives
  useEffect(() => {
    if (stocks && localStocks.length === 0) {
      setLocalStocks(stocks);
    }
  }, [stocks, localStocks.length]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}/trade`);

    socket.on("marketUpdate", (allStocks) => {
      const currentStockData = allStocks.find(
        (s: any) => s.symbol === activeSymbol,
      );

      if (currentStockData) {
        dispatch(
          yfinanceApi.util.updateQueryData(
            "getYfDetails",
            activeSymbol,
            (draft) => {
              if (draft && draft.price) {
                draft.price.regularMarketPrice = currentStockData.price;
                draft.price.regularMarketChangePercent =
                  currentStockData.change;
                draft.price.regularMarketVolume = currentStockData.volume;
              }
            },
          ),
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeSymbol, dispatch]);

  return (
    <div className="flex flex-col bg-bg text-fg h-[calc(100vh-64px)] overflow-hidden">
      {/* 1. TICKER BAR */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 space-x-8 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center space-x-2 min-w-fit">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              {getLogoUrl(quoteData?.assetProfile?.website) && (
                <div className="w-6 h-6 rounded-full">
                  <img
                    src={getLogoUrl(quoteData?.assetProfile?.website)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="text-sm font-bold leading-none">
                {activeSymbol}
              </span>
            </div>
            {quoteDataIsLoading && (
              <Loader2 size={14} className="animate-spin text-brand mt-1" />
            )}
            {hasValidTickData && (
              <span
                className={`${isPositive ? "text-up" : "text-down"} font-bold text-lg ml-2`}
              >
                {formatCurrency(quoteData.price.regularMarketPrice)}
              </span>
            )}
          </div>
        </div>

        {hasValidTickData && (
          <div className="flex items-center space-x-8">
            <TickerStat
              label={t("CHANGE")}
              value={`${isPositive ? "+" : ""}${quoteData.price.regularMarketChangePercent.toFixed(2)}%`}
              color={isPositive ? "text-up" : "text-down"}
            />
            <TickerStat
              label={t("HIGH_24H")}
              value={formatCurrency(quoteData.price.regularMarketDayHigh)}
            />
            <TickerStat
              label={t("LOW_24H")}
              value={formatCurrency(quoteData.price.regularMarketDayLow)}
            />
            <TickerStat
              label={t("VOLUME")}
              value={formatVol(quoteData.price.regularMarketVolume)}
              color="text-gray-400"
            />
          </div>
        )}

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-6 pr-2">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">
              {t("AVAILABLE_BALANCE")}
            </span>
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-brand" />
              <span className="text-base font-black text-fg tracking-tighter">
                {formatCurrency(Number(user?.balance))} TRY
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsDepositOpen(true)}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col flex-1 border-r border-gray-200 dark:border-gray-800 min-w-0">
          <div className="flex justify-between items-center pr-4">
            <div className="flex items-center bg-bg border-b border-gray-200 dark:border-gray-800 px-4 space-x-6 w-full overflow-x-auto">
              {["Chart", "Overview", "Stats", "News"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as ViewTab)}
                  className={`shrink-0 cursor-pointer py-3 text-sm font-medium transition-all relative ${activeTab === tab ? "text-brand" : "text-gray-500 hover:text-fg"}`}
                >
                  {t(tab.toUpperCase())}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer md:hidden shrink-0 bg-brand text-white text-[10px] px-3 py-1.5 rounded-md font-bold shadow-md active:scale-95 transition-transform"
            >
              {t("VIEW_STOCKS")}
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-[#0b0e14] relative min-h-0">
            {activeTab === "Chart" && (
              <TradingChart symbol={activeSymbol} exchange={exchange} />
            )}
            {activeTab === "Overview" && (
              <div className="flex-1 overflow-hidden">
                <TradeOverview symbol={activeSymbol} />
              </div>
            )}
            {activeTab === "Stats" && (
              <div className="flex-1 overflow-hidden">
                <TradingStatistics symbol={activeSymbol} />
              </div>
            )}
            {activeTab === "News" && (
              <div className="flex-1 overflow-hidden">
                <TradingNews symbol={activeSymbol} />
              </div>
            )}
          </div>

          <TradeTabs />
        </div>

        <div className="hidden xl:flex">
          <LiveSidebar />
        </div>

        <div className="w-72 hidden md:flex flex-col bg-bg border-l border-slate-200 dark:border-slate-800">
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
            user={user}
          />
        </div>
      </div>
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      {/* --- MOBILE DRAWER OVERLAY --- */}
      {/* This only shows when isSidebarOpen is true on mobile */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute left-0 top-0 h-full w-max bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold text-sm uppercase tracking-wider">
              {t("LIVE_MARKETS")}
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
          <div className="h-[calc(100%-60px)] overflow-y-auto">
            <LiveSidebar setIsSidebarOpen={setIsSidebarOpen} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSection;
