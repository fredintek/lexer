import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "@/i18n/navigation";
import { formatCurrency, formatVol } from "@/lib/helpers";
import {
  selectActiveAsset,
  setActiveAsset,
} from "@/lib/redux/features/yfinanceData.slice";
import {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} from "@/lib/redux/services/yfinance.api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  Activity,
  List,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { JSX, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

type Props = {};
type MarketTab = "all" | "gainers" | "losers" | "watchlist" | "volume";

const MobileMarkets = (props: Props) => {
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
    <div className="md:hidden flex-1 flex flex-col pb-16">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-2xl px-4 py-3">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("SEARCH_SYMBOL")}
            className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer text-xs font-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 py-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-brand text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {TabIcon}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <>
            {[...Array(10)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <Search size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {t("NO_RESULTS")}
            </p>
          </div>
        ) : (
          filteredData.map((stock) => {
            const isPositive = stock.change >= 0;
            const isFavorited = favorites.includes(`${stock.symbol}.IS`);
            const isActive = currentAsset.activeSymbol === stock.symbol;

            return (
              <div
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer border-l-[3px] ${
                  isActive
                    ? "bg-brand/5 border-l-brand"
                    : "border-l-transparent active:bg-slate-50 dark:active:bg-white/5"
                }`}
              >
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-slate-600 dark:text-white/60">
                      {stock.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {stock.symbol}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {formatVol(stock.volume)} {t("VOL")}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      ₺{formatCurrency(stock.price)}
                    </p>
                    <div
                      className={`flex items-center justify-end gap-0.5 text-[10px] font-black ${
                        isPositive ? "text-up" : "text-down"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {isPositive ? "+" : ""}
                      {stock.change.toFixed(2)}%
                    </div>
                  </div>

                  {/* Star */}
                  <button
                    onClick={(e) => toggleFavorite(e, stock.symbol)}
                    className="cursor-pointer p-1 transition-all active:scale-90"
                  >
                    <Star
                      size={16}
                      className={
                        isFavorited
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-slate-300 dark:text-white/20"
                      }
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileMarkets;

const SkeletonRow = () => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="flex flex-col gap-1">
        <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-1">
      <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="w-12 h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
    </div>
  </div>
);
