"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Loader2, TrendingUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { useGetYfStocksQuery } from "@/lib/redux/services/yfinance.api";
import { setActiveAsset } from "@/lib/redux/features/yfinanceData.slice";
import { useTranslations } from "next-intl";

const AssetSearch = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { activeSymbol } = useAppSelector((state) => state.yfinanceDataReducer);
  const searchRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch the full Turkish stock list
  const { data: stocks, isLoading } = useGetYfStocksQuery(undefined);

  // Optimized Filter
  const filteredAssets = useMemo(() => {
    if (!stocks) return [];
    if (!query) return stocks.slice(0, 10);

    const lowerQuery = query.toLowerCase();

    return stocks
      .filter((asset: any) => {
        const symbol = asset.symbol?.toLowerCase() || "";
        const shortName = asset.shortName?.toLowerCase() || "";
        const longName = asset.longName?.toLowerCase() || "";

        return (
          symbol.includes(lowerQuery) ||
          shortName.includes(lowerQuery) ||
          longName.includes(lowerQuery)
        );
      })
      .slice(0, 20);
  }, [stocks, query]);

  // Click Outside Logic
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (asset: any) => {
    dispatch(
      setActiveAsset({
        symbol: asset.symbol,
        name: asset.shortName || asset.longName,
        exchange: asset.exchange,
      }),
    );
    setQuery("");
    setIsSearchOpen(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input Box */}
      <div
        className={`flex items-center bg-gray-100 dark:bg-gray-900 rounded-md p-2 lg:px-3 lg:py-1.5 border transition-all cursor-pointer ${
          isSearchOpen ? "border-brand ring-1 ring-brand" : "border-transparent"
        }`}
        onClick={() => setIsSearchOpen(true)}
      >
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder={t("SEARCH_STOCKS")}
          className="hidden lg:inline ml-2 text-xs bg-transparent outline-none w-28 focus:w-44 transition-all placeholder:text-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {!query && !isSearchOpen && (
          <span className="hidden lg:inline ml-2 text-[10px] bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
            {activeSymbol}
          </span>
        )}
      </div>

      {/* Dropdown Results */}
      {isSearchOpen && (
        <div className="absolute right-0 lg:left-0 mt-2 w-72 md:w-80 bg-bg border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">
              {query ? t("SEARCH_RESULTS") : t("QUICK_ASSETS")}
            </span>
            {isLoading && (
              <Loader2 size={12} className="animate-spin text-brand" />
            )}
          </div>

          {/* Mobile Search Input (Inside dropdown) */}
          <div className="p-2 lg:hidden border-b border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              type="text"
              className="w-full bg-gray-100 dark:bg-gray-900 p-2 text-sm rounded outline-none"
              placeholder={t("TYPE_SYMBOL")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {filteredAssets?.length ? (
              filteredAssets.map((asset: any) => (
                <div
                  key={`${asset.symbol}-${asset.name}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                  onClick={() => handleSelect(asset)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-brand/10 text-brand flex items-center justify-center font-bold text-[10px]">
                      {asset.symbol.substring(0, 3)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{asset.symbol}</span>
                      <span className="text-[10px] text-gray-500 truncate max-w-35">
                        {asset.shortName || asset.longName}
                      </span>
                    </div>
                  </div>
                  <TrendingUp
                    size={14}
                    className="text-gray-300 dark:text-gray-700"
                  />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-xs italic">
                {t("NO_STOCKS_FOUND", { query })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AssetSearch;
