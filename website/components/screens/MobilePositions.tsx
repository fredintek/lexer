import SellModal from "@/app/[locale]/(home)/profile/_ui/SellModal";
import { formatCurrency, formatDate, getLogoUrl } from "@/lib/helpers";
import {
  positionApi,
  useCancelPositionMutation,
  useGetMyAssetsQuery,
} from "@/lib/redux/services/positions.api";
import { useGetTxHistoryQuery } from "@/lib/redux/services/transactions.api";
import { useAppDispatch } from "@/lib/redux/store";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Briefcase,
  Loader,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import StatusBadge from "../StatusBadge";

type Props = {};

const MobilePositions = (props: Props) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const { data: myAssets, isLoading } = useGetMyAssetsQuery(undefined);
  const { data: txHistory, isLoading: isTxHistoryLoading } =
    useGetTxHistoryQuery(undefined);
  const [activeTab, setActiveTab] = useState<
    "open" | "sold" | "waiting" | "cancelled"
  >("open");
  const [cancelOrder, { isLoading: isOrderCancelling }] =
    useCancelPositionMutation();

  const handleCancelOrder = async (positionId: string) => {
    try {
      await cancelOrder({ positionId }).unwrap();
      toast.success(t("ORDER_CANCELLED"));
    } catch (err: any) {
      toast.error(err?.data?.message || t("FAILED"));
    }
  };

  // Determine the display data
  const displayData = useMemo(() => {
    if (activeTab === "sold") {
      return (
        txHistory?.filter(
          (item: any) =>
            item?.type === "SELL_PARTIAL" || item?.type === "SELL_FULL",
        ) || []
      );
    }
    return myAssets?.tables?.[activeTab] || [];
  }, [activeTab, myAssets, txHistory]);

  // Check if loading based on tab
  const isDataLoading = activeTab === "sold" ? isTxHistoryLoading : isLoading;

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}/trade`);

    socket.on("marketUpdate", (allStocks) => {
      dispatch(
        // We update the 'getMyAssets' cache directly
        positionApi.util.updateQueryData("getMyAssets", undefined, (draft) => {
          if (!draft?.tables?.open) return;

          let newTotalUnrealizedPnL = 0;
          let newLivePortfolioValue = 0;

          draft.tables.open.forEach((pos: any) => {
            const live = allStocks.find((s: any) => s.symbol === pos.symbol);
            if (live) {
              const currentPrice = live.price;
              pos.currentPrice = currentPrice;

              // Calculate live P&L for this row
              const pnl =
                pos.type === "BUYING"
                  ? (currentPrice - pos.startingPrice) * pos.lots
                  : (pos.startingPrice - currentPrice) * pos.lots;

              pos.livePnL = pnl * pos.multiplier - (pos.commission || 0);

              newTotalUnrealizedPnL += pos.livePnL;
              newLivePortfolioValue += Number(pos.marginUsed) + pos.livePnL;
            }
          });

          // Update the top-level metrics in the cache so the cards update too
          draft.metrics.instantaneousKZ = newTotalUnrealizedPnL;
          draft.metrics.stockPortfolio =
            newLivePortfolioValue + (draft.metrics.waitingMarginValue || 0);
          draft.metrics.totalAssets =
            draft.metrics.idleCash + draft.metrics.stockPortfolio;
        }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <>
      <div className="md:hidden flex-1 flex flex-col pb-20 bg-bg min-h-screen">
        {/* 1. TOP METRIC CARDS (Matching Screenshot 2026-05-13 at 17.09.54.png) */}
        <div className="grid grid-cols-2 gap-3 px-4 pt-4 mb-6">
          <MetricCard
            title={t("TOTAL_ASSETS")}
            value={myAssets?.metrics?.totalAssets}
            icon={<Wallet />}
          />
          <MetricCard
            title={t("IDLE_CASH")}
            value={myAssets?.metrics?.idleCash}
            icon={<Banknote />}
          />
          <MetricCard
            title={t("PORTFOLIO")}
            value={myAssets?.metrics?.stockPortfolio}
            icon={<Briefcase />}
          />
          <MetricCard
            title={t("LIVE_PNL")}
            value={myAssets?.metrics?.instantaneousKZ}
            isTrend
            color={myAssets?.metrics?.instantaneousKZ >= 0 ? "up" : "down"}
          />
        </div>

        {/* 2. MOBILE TABS (Matching Screenshot 2026-05-13 at 17.09.54.png) */}
        <div className="px-4 mb-4">
          <div className="flex gap-1 p-1 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
            {(["open", "waiting", "cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t(tab.toUpperCase())}
              </button>
            ))}
            <button
              onClick={() => setActiveTab("sold")}
              className={`flex-1 min-w-20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "sold"
                  ? "bg-brand text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t("SOLD")}
            </button>
          </div>
        </div>

        {/* 3. ASSET LIST CONTAINER */}
        <div className="px-4 flex-1">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {isDataLoading ? (
              <ActivitySkeleton />
            ) : displayData.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  {t("NO_DATA")}
                </p>
              </div>
            ) : (
              displayData.map((pos: any, i: number) => {
                // Sold items use livePnL (from service logic) or realizedPnL
                const realizedPnL = pos.realizedPnL || pos.livePnL || 0;
                const isPositive = realizedPnL >= 0;

                // Define price to show: Entry for open, Execution Price for sold
                const executionPrice =
                  pos.priceAtExecution || pos.startingPrice;

                return (
                  <div
                    key={pos.id || i}
                    className={`flex items-center justify-between px-3 py-5 border-slate-200 dark:border-slate-800 transition-colors active:bg-white/5 ${
                      i !== displayData.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        {/* Fallback for symbol/logo */}
                        <p className="capitalize font-bold">{pos?.symbol}</p>
                      </div>

                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        {Number(pos.lots).toFixed(2)} {t("LOTS")} ·{" "}
                        {activeTab === "sold" ? t("EXIT") : t("ENTRY")}: ₺
                        {formatCurrency(executionPrice)}
                      </p>

                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        {t("COST_PRICE")}: ₺
                        {activeTab === "sold"
                          ? formatCurrency(pos?.marginAmount)
                          : formatCurrency(pos?.marginUsed)}
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <p
                            className={`text-sm font-black leading-none ${isPositive ? "text-up" : "text-down"}`}
                          >
                            {/* For sold tab, we show the fixed realized PnL */}
                            {isPositive ? "+" : ""}₺
                            {formatCurrency(realizedPnL)}
                          </p>
                          {activeTab !== "sold" && (
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              {pos.type}
                            </p>
                          )}
                        </div>
                        ·
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          {t("DATE")}: {}
                          {activeTab === "sold"
                            ? formatDate(pos.createdAt)
                            : formatDate(pos.openingDate)}
                        </p>
                      </div>
                    </div>

                    {/* Right Side Actions */}
                    {activeTab === "open" && pos.status === "open" && (
                      <button
                        onClick={() => {
                          setSelectedAsset(pos);
                          setIsModalOpen(true);
                        }}
                        className="cursor-pointer px-4 py-2 bg-down text-white hover:opacity-80 rounded-lg text-[10px] font-black uppercase transition-all"
                      >
                        <span>{t("SELL")}</span>
                      </button>
                    )}

                    {activeTab === "waiting" && (
                      <button
                        disabled={isOrderCancelling}
                        onClick={() => handleCancelOrder(pos.id)}
                        className="cursor-pointer px-4 py-2 bg-down text-white hover:opacity-80 rounded-lg text-[10px] font-black uppercase transition-all"
                      >
                        {isOrderCancelling ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <span>{t("CANCEL")}</span>
                        )}
                      </button>
                    )}

                    {/* Sold Tag */}
                    {activeTab === "sold" && <StatusBadge status="COMPLETED" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <SellModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default MobilePositions;

interface MetricCardProps {
  title: string;
  value: number | undefined;
  icon?: React.ReactNode;
  isTrend?: boolean;
  color?: "up" | "down" | "default";
  prefix?: string;
}

const MetricCard = ({
  title,
  value = 0,
  icon,
  isTrend = false,
  color = "default",
  prefix = "₺",
}: MetricCardProps) => {
  // Determine text color based on trend or status
  const getTextColor = () => {
    if (color === "up" || (isTrend && value > 0)) return "text-up";
    if (color === "down" || (isTrend && value < 0)) return "text-down";
    return "text-fg";
  };

  // Helper to format currency safely
  const formatValue = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500">
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div
          className={`text-2xl font-black tracking-tighter tabular-nums ${getTextColor()}`}
        >
          {value < 0 ? "-" : isTrend && value > 0 ? "+" : ""}
          {prefix}
          {formatValue(value)}
        </div>

        {isTrend && (
          <div
            className={`flex items-center gap-1 text-[10px] font-black uppercase ${value >= 0 ? "text-up" : "text-down"}`}
          >
            {value >= 0 ? (
              <ArrowUpRight size={14} strokeWidth={3} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={3} />
            )}
            {value >= 0 ? "Profit" : "Loss"}
          </div>
        )}
      </div>
    </div>
  );
};

function ActivitySkeleton() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>

      {/* List Items Skeleton */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800"
        >
          {/* Left Side: Icon & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          </div>

          {/* Right Side: Price & Status */}
          <div className="flex flex-col items-end space-y-2">
            <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
