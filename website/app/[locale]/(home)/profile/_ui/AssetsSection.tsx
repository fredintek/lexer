import DataTable, { Column } from "@/components/dataTable/DataTable";
import { formatCurrency, getLogoUrl } from "@/lib/helpers";
import { tradeApi, useGetPositionsQuery } from "@/lib/redux/services/trade.api";
import { useAppDispatch } from "@/lib/redux/store";
import { ArrowDown, ArrowUp, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import SellModal from "./SellModal";

export default function AssetsSection() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { data: positions, isLoading } = useGetPositionsQuery();
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"quantity" | "equity" | "none">("none");

  const handleOpenSellModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const columns: Column<any>[] = [
    {
      header: t("ASSET"),
      render: (pos) => {
        const logoUrl = getLogoUrl(pos.website);

        return (
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt={pos.symbol}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-[10px] uppercase z-[-1]">
                {pos.symbol.substring(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase">{pos.symbol}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">
                {t("BIST_EQUITY")}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: t("QUANTITY"),
      render: (pos) => (
        <span className="text-xs font-black">
          {pos.quantity} {t("LOT")}
        </span>
      ),
    },
    {
      header: t("AVG_COST"),
      render: (pos) => (
        <span className="text-xs font-bold tabular-nums">
          ₺{formatCurrency(pos.averageEntryPrice)}
        </span>
      ),
    },
    {
      header: t("CURRENT_VALUE"),
      render: (pos) => {
        const pnl = (pos.currentPrice - pos.averageEntryPrice) * pos.quantity;
        const isProfit = pnl >= 0;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-black tabular-nums">
              ₺{formatCurrency(pos.currentPrice)}
            </span>
            <div
              className={`flex items-center gap-0.5 text-[10px] font-black ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {formatCurrency(pnl)} {t("TRY")}
            </div>
          </div>
        );
      },
    },
    {
      header: t("TOTAL_COST"),
      render: (pos) => (
        <div className="flex flex-col">
          <span className="text-xs font-black tabular-nums">
            ₺{formatCurrency(pos.quantity * pos.averageEntryPrice)}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            {pos.quantity} × ₺{formatCurrency(pos.averageEntryPrice)}
          </span>
        </div>
      ),
    },
    {
      header: t("PNL"),
      render: (pos) => {
        const totalCost = pos.quantity * pos.averageEntryPrice;
        const currentEquity = pos.quantity * pos.currentPrice;
        const pnl = currentEquity - totalCost;
        const pnlPercentage = (pnl / totalCost) * 100;
        const isProfit = pnl >= 0;

        return (
          <div className="flex flex-col">
            <span
              className={`text-sm font-black tabular-nums ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? "+" : ""}₺{formatCurrency(pnl)}
            </span>
            <div
              className={`flex items-center gap-1 text-[10px] font-black ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {pnlPercentage.toFixed(2)}%
            </div>
          </div>
        );
      },
    },
    {
      header: t("TOTAL_EQUITY"),
      align: "right",
      render: (pos) => {
        const currentEquity = pos.quantity * pos.currentPrice;
        const totalCost = pos.quantity * pos.averageEntryPrice;
        const pnl = currentEquity - totalCost;
        const isProfit = pnl >= 0;

        return (
          <div className="flex flex-col items-end">
            <span className="text-sm font-black tabular-nums text-fg">
              ₺{formatCurrency(currentEquity)}
            </span>
            <span
              className={`text-[10px] flex items-center gap-1 font-bold ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{" "}
              {formatCurrency(Math.abs(pnl))}
            </span>
          </div>
        );
      },
    },
    {
      header: t("ACTIONS"),
      align: "right",
      render: (pos) => (
        <button
          onClick={() => handleOpenSellModal(pos)}
          className="cursor-pointer px-4 py-2 bg-down/10 text-down hover:bg-down hover:text-white rounded-lg text-[10px] font-black uppercase transition-all"
        >
          {t("SELL")}
        </button>
      ),
    },
  ];

  const sortedPositions = useMemo(() => {
    if (!positions) return [];

    // Create a shallow copy to avoid mutating the original data
    const data = [...positions];

    if (sortBy === "quantity") {
      return data.sort((a, b) => b.quantity - a.quantity);
    }

    if (sortBy === "equity") {
      return data.sort((a, b) => {
        const equityA = a.quantity * a.currentPrice;
        const equityB = b.quantity * b.currentPrice;
        return equityB - equityA;
      });
    }

    return data;
  }, [positions, sortBy]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}/trade`);

    socket.on("marketUpdate", (allStocks) => {
      dispatch(
        tradeApi.util.updateQueryData("getPositions", undefined, (draft) => {
          draft.forEach((pos) => {
            const live = allStocks.find((s: any) => s.symbol === pos.symbol);
            if (live) {
              pos.currentPrice = live.price;
              pos.pnl = (live.price - pos.averageEntryPrice) * pos.quantity;
            }
          });
        }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">
          {t("PORTFOLIO_HOLDINGS")}
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-2">
          {t("PORTFOLIO_DESC")}
        </p>
      </header>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSortBy(sortBy === "quantity" ? "none" : "quantity")}
          className={`cursor-pointer px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${
            sortBy === "quantity"
              ? "bg-brand text-white border-brand"
              : "bg-transparent text-slate-500 border-slate-200"
          }`}
        >
          {t("SORT_BY_LOTS")}
        </button>
        <button
          onClick={() => setSortBy(sortBy === "equity" ? "none" : "equity")}
          className={`cursor-pointer px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${
            sortBy === "equity"
              ? "bg-brand text-white border-brand"
              : "bg-transparent text-slate-500 border-slate-200"
          }`}
        >
          {t("SORT_BY_EQUITY")}
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-3xl" />
      ) : positions && positions?.length > 0 ? (
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
          <DataTable
            data={sortedPositions}
            columns={columns}
            itemsPerPage={10}
          />
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <LayoutGrid size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            {t("PORTFOLIO_EMPTY")}
          </p>
        </div>
      )}

      {selectedAsset && (
        <SellModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          asset={selectedAsset}
        />
      )}
    </div>
  );
}
