"use client";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import {
  List,
  Search,
  TrendingDown,
  TrendingUp,
  Activity,
  Star,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  selectActiveAsset,
  setActiveAsset,
} from "@/lib/redux/features/yfinanceData.slice";
import { io } from "socket.io-client";
import { useTranslations } from "next-intl";
import {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} from "@/lib/redux/services/yfinance.api";

type Props = {
  setIsSidebarOpen?: (value: SetStateAction<boolean>) => void;
};

const LiveSidebar = ({ setIsSidebarOpen }: Props) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const currentAsset = useAppSelector(selectActiveAsset);
  const [activeCategory, setActiveCategory] = useState("all"); // 'all' | 'gainers' | 'losers' | 'volume'
  const [searchQuery, setSearchQuery] = useState("");
  const [marketData, setMarketData] = useState([]);
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
    setSearchQuery("");
    setIsSidebarOpen && setIsSidebarOpen(false);
  };

  const processedStocks = useMemo(() => {
    let data = [...marketData];

    if (searchQuery) {
      data = data.filter((s: any) =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    switch (activeCategory) {
      case "gainers":
        return data
          .filter((s: any) => s.change > 0)
          .sort((a: any, b: any) => b.change - a.change);
      case "losers":
        return data
          .filter((s: any) => s.change < 0)
          .sort((a: any, b: any) => a.change - b.change);
      case "volume":
        return data.sort((a: any, b: any) => b.volume - a.volume);
      case "favorites":
        return data?.filter((s: any) => favorites?.includes(`${s.symbol}.IS`));
      default:
        return data;
    }
  }, [marketData, searchQuery, activeCategory]);

  const categories = [
    { id: "all", icon: <List size={14} />, label: t("CAT_ALL") },
    { id: "gainers", icon: <TrendingUp size={14} />, label: t("CAT_GAINERS") },
    { id: "losers", icon: <TrendingDown size={14} />, label: t("CAT_LOSERS") },
    { id: "volume", icon: <Activity size={14} />, label: t("CAT_VOLUME") },
    { id: "favorites", icon: <Star size={14} />, label: t("CAT_FAVORITES") },
  ];

  const formatVol = (val: number) =>
    new Intl.NumberFormat("en", { notation: "compact" }).format(val);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}/trade`);

    socket.on("marketUpdate", (newData) => {
      setMarketData(newData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-80 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 ">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 p-3 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            {t("LIVE_MARKETS")}
          </span>
          <div className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-medium text-emerald-500 uppercase">
              {t("LIVE_STATUS")}
            </span>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t("SEARCH_SYMBOL")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 pl-8 pr-4 text-[12px] outline-none"
          />
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`cursor-pointer flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                activeCategory === cat.id
                  ? "bg-white dark:bg-slate-800 shadow-sm text-brand"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title={cat.label}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto">
        {processedStocks.map((stock: any) => {
          const isActive = currentAsset.activeSymbol === stock.symbol;
          const isFavorited = favorites.includes(`${stock.symbol}.IS`);
          return (
            <div
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className={`
                  flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer transition-all
                  ${
                    isActive
                      ? "bg-brand/10 border-l-[3px] border-l-brand"
                      : "border-l-[3px] border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }
                `}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-bold">{stock.symbol}</span>
                  <button
                    onClick={(e) => toggleFavorite(e, stock.symbol)}
                    className={`transition-colors ${isFavorited ? "text-yellow-500" : "text-slate-300 hover:text-yellow-500"}`}
                  >
                    <Star
                      size={14}
                      fill={isFavorited ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <span className="text-[9px] text-slate-400">
                  {formatVol(stock.volume)} {t("VOLUME_SHORT")}
                </span>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-mono font-bold">
                  {stock.price?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div
                  className={`text-[10px] font-bold ${stock.change >= 0 ? "text-emerald-500" : "text-red-500"}`}
                >
                  {stock.change >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(stock.change || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveSidebar;
