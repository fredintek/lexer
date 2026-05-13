"use client";
import React, { JSX, useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
  List,
  Search,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { useRouter } from "@/i18n/navigation";
import {
  selectActiveAsset,
  setActiveAsset,
} from "@/lib/redux/features/yfinanceData.slice";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} from "@/lib/redux/services/yfinance.api";
import { io } from "socket.io-client";
import { formatCurrency, formatVol } from "@/lib/helpers";
import DataTable, { Column } from "../dataTable/DataTable";

type MarketTab = "all" | "gainers" | "losers" | "watchlist" | "volume";

const DesktopMarkets = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const currentAsset = useAppSelector(selectActiveAsset);
  const router = useRouter();

  const [marketData, setMarketData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<MarketTab>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 500);

  const { data: favorites = [] } = useGetFavoritesQuery();
  const [toggleFavoriteApi] = useToggleFavoriteMutation();

  const toggleFavorite = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    toggleFavoriteApi(symbol);
  };

  const handleSelect = (stock: any) => {
    dispatch(
      setActiveAsset({
        symbol: stock.symbol,
        name: stock.shortName || stock.longName,
        exchange: stock.exchange,
      }),
    );
    router.push("/");
  };

  const columns: Column<any>[] = useMemo(
    () => [
      {
        header: t("ASSET"),
        render: (stock) => (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-xs text-brand shrink-0">
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white uppercase leading-tight">
                {stock.symbol}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {stock.exchange || "BIST"}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: t("PRICE"),
        align: "right",
        render: (stock) => (
          <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
            ₺{formatCurrency(stock.price)}
          </span>
        ),
      },
      {
        header: t("24H_CHANGE"),
        align: "right",
        render: (stock) => {
          const isPositive = stock.change >= 0;
          return (
            <div
              className={`flex items-center justify-end gap-1 font-black text-sm ${isPositive ? "text-up" : "text-down"}`}
            >
              {isPositive ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)}%
            </div>
          );
        },
      },
      {
        header: t("24H_VOLUME"),
        align: "right",
        render: (stock) => (
          <span className="font-bold text-slate-500 text-xs">
            {formatVol(stock.volume)}
          </span>
        ),
      },
      {
        header: t("24H_HIGH"),
        align: "right",
        render: (stock) => (
          <span className="font-bold text-slate-900 dark:text-white text-xs">
            ₺{formatCurrency(stock.dayHigh || stock.price * 1.02)}
          </span>
        ),
      },
      {
        header: t("ACTIONS"),
        align: "left",
        render: (stock) => (
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => toggleFavorite(e, stock.symbol)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <Star
                size={18}
                className={
                  favorites.includes(`${stock.symbol}.IS`)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-slate-300 dark:text-slate-700"
                }
              />
            </button>

            <button
              onClick={() => handleSelect(stock)}
              className="cursor-pointer"
            >
              <Eye size={18} className="text-brand" />
            </button>
          </div>
        ),
      },
    ],
    [t, favorites],
  );

  const filteredData = useMemo(() => {
    let data = [...marketData];

    if (debouncedSearch.trim()) {
      data = data.filter((s) =>
        s.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()),
      );
    }

    switch (activeTab) {
      case "gainers":
        return data
          .filter((s) => s.change > 0)
          .sort((a, b) => b.change - a.change);
      case "losers":
        return data
          .filter((s) => s.change < 0)
          .sort((a, b) => a.change - b.change);
      case "volume":
        return data.sort((a, b) => b.volume - a.volume);
      case "watchlist":
        return data.filter((s) => favorites.includes(`${s.symbol}.IS`));
      default:
        return data;
    }
  }, [marketData, activeTab, debouncedSearch, favorites]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}/trade`);

    socket.on("marketUpdate", (newData) => {
      setMarketData(newData);
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const metrics = useMemo(() => {
    if (!marketData.length) return null;

    // Clone and sort for specific highlights
    const topGainer = [...marketData].sort((a, b) => b.change - a.change)[0];
    const topLoser = [...marketData].sort((a, b) => a.change - b.change)[0];
    const topVolume = [...marketData].sort((a, b) => b.volume - a.volume)[0];

    // Count how many are currently 'UP'
    const advanceDecline = marketData.reduce(
      (acc, stock) => {
        stock.change >= 0 ? acc.up++ : acc.down++;
        return acc;
      },
      { up: 0, down: 0 },
    );

    return { topGainer, topLoser, topVolume, advanceDecline };
  }, [marketData]);

  const tabs: { id: MarketTab; label: string; icon: JSX.Element }[] = [
    { id: "all", icon: <List size={14} />, label: t("ALL") },
    {
      id: "gainers",
      icon: <TrendingUp size={14} />,
      label: t("GAINERS"),
    },
    {
      id: "losers",
      icon: <TrendingDown size={14} />,
      label: t("LOSERS"),
    },
    { id: "volume", icon: <Activity size={14} />, label: t("VOLUME") },
    { id: "watchlist", icon: <Star size={14} />, label: t("WATCHLIST") },
  ];

  return (
    <div className="hidden md:flex flex-col gap-6 p-8 max-w-400 mx-auto">
      {/* 1. MARKET OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* TOP GAINER */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {t("TOP_GAINER")}
            </p>
            <div className="p-2 bg-up/10 rounded-lg text-up">
              <TrendingUp size={16} />
            </div>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">
            {metrics?.topGainer?.symbol || "—"}
          </h4>
          <p className="text-up font-black text-sm mt-1">
            +{metrics?.topGainer?.change.toFixed(2)}%
          </p>
        </div>

        {/* TOP LOSER */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {t("TOP_LOSER")}
            </p>
            <div className="p-2 bg-down/10 rounded-lg text-down">
              <TrendingDown size={16} />
            </div>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">
            {metrics?.topLoser?.symbol || "—"}
          </h4>
          <p className="text-down font-black text-sm mt-1">
            {metrics?.topLoser?.change.toFixed(2)}%
          </p>
        </div>

        {/* TOP VOLUME */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {t("HIGHEST_VOLUME")}
            </p>
            <div className="p-2 bg-brand/10 rounded-lg text-brand">
              <Activity size={16} />
            </div>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">
            {metrics?.topVolume?.symbol || "—"}
          </h4>
          <p className="text-slate-500 font-bold text-xs mt-1 uppercase">
            {formatVol(metrics?.topVolume?.volume || 0)} {t("VOL")}
          </p>
        </div>

        {/* MARKET MOOD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            {t("MARKET_MOOD")}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-up leading-none">
              {metrics?.advanceDecline.up}
            </span>
            <span className="text-[10px] font-black text-slate-300 uppercase pb-1">
              VS
            </span>
            <span className="text-2xl font-black text-down leading-none">
              {metrics?.advanceDecline.down}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full mt-3 overflow-hidden flex">
            <div
              className="h-full bg-up transition-all duration-500"
              style={{
                width: `${(metrics?.advanceDecline.up / marketData.length) * 100}%`,
              }}
            />
            <div
              className="h-full bg-down transition-all duration-500"
              style={{
                width: `${(metrics?.advanceDecline.down / marketData.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. HEADER & FILTERS */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
          <div className="relative w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("SEARCH_SYMBOL")}
              className="w-full bg-slate-100 dark:bg-white/5 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 ring-brand/20 font-bold text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-brand shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. DESKTOP DATA TABLE */}
        <DataTable
          data={filteredData}
          columns={columns}
          itemsPerPage={12}
          isLoading={isLoading}
          minWidth="1000px"
        />
      </div>
    </div>
  );
};

export default DesktopMarkets;
