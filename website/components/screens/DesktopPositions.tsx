"use client";

import { formatCurrency, formatDate, getLogoUrl } from "@/lib/helpers";
import {
  positionApi,
  useCancelPositionMutation,
  useGetMyAssetsQuery,
} from "@/lib/redux/services/positions.api";
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
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DataTable, { Column } from "../dataTable/DataTable";
import { io } from "socket.io-client";
import SellModal from "@/app/[locale]/(home)/profile/_ui/SellModal";

type Props = {};

const DesktopPositions = (props: Props) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const { data: myAssets, isLoading: isMyAssetsLoading } =
    useGetMyAssetsQuery(undefined);
  const [activeTab, setActiveTab] = useState<
    "open" | "waiting" | "closed" | "cancelled"
  >("open");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

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

  // 2. WebSocket Real-time Patching
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

  // 3. Columns Definition (Dynamic based on Tab)
  const columns: Column<any>[] = useMemo(() => {
    const baseColumns = [
      {
        header: t("ASSET"),
        render: (pos: any) => (
          <div className="flex items-center gap-3">
            {/* Logo logic here */}
            <div className="w-10 h-10">
              {getLogoUrl(pos?.website) ? (
                <img
                  src={getLogoUrl(pos?.website)}
                  alt=""
                  className="w-full h-full"
                />
              ) : (
                <div className="text-white w-full h-full bg-brand/50 rounded-2xl flex items-center justify-center font-black">
                  <p className="">{pos?.symbol?.slice(0, 2)}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-black uppercase">{pos.symbol}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">
                {pos.type}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: t("LOTS"),
        render: (pos: any) => (
          <span className="text-xs font-black">{pos.lots}</span>
        ),
      },
    ];

    if (activeTab === "open") {
      return [
        ...baseColumns,
        {
          header: t("ENTRY"),
          render: (pos: any) => (
            <span className="text-xs font-bold">
              ₺{formatCurrency(pos.startingPrice)}
            </span>
          ),
        },
        {
          header: t("LIVE_PRICE"),
          render: (pos: any) => (
            <span className="text-xs font-black text-brand">
              ₺{formatCurrency(pos.currentPrice)}
            </span>
          ),
        },
        {
          header: t("PNL"),
          render: (pos: any) => (
            <div
              className={`text-xs font-black ${pos.livePnL >= 0 ? "text-up" : "text-down"}`}
            >
              ₺{formatCurrency(pos.livePnL)}
            </div>
          ),
        },
        {
          header: t("ACTIONS"),
          align: "right",
          render: (pos: any) => (
            <button
              onClick={() => {
                setSelectedAsset(pos);
                setIsModalOpen(true);
              }}
              className="cursor-pointer px-4 py-2 bg-down text-white hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-black uppercase transition-all"
            >
              <span>{t("SELL")}</span>
            </button>
          ),
        },
      ];
    }

    if (activeTab === "waiting") {
      return [
        ...baseColumns,
        {
          header: t("ORDER_PRICE"),
          render: (pos) => (
            <span className="text-xs font-black">
              ₺{formatCurrency(pos.startingPrice)}
            </span>
          ),
        },
        {
          header: t("COST_PRICE"),
          render: (pos) => (
            <span className="text-xs font-black">
              ₺{formatCurrency(pos.marginUsed)}
            </span>
          ),
        },
        {
          header: t("STATUS"),
          render: () => (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[10px] font-bold uppercase">
              {t("MARKET_CLOSED")}
            </span>
          ),
        },
        {
          header: t("ACTIONS"),
          align: "right" as const,
          render: (pos) => (
            <button
              disabled={isOrderCancelling}
              onClick={() => handleCancelOrder(pos.id)}
              className="cursor-pointer px-4 py-2 bg-down text-white hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-black uppercase transition-all"
            >
              {isOrderCancelling ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <span>{t("CANCEL_ORDER")}</span>
              )}
            </button>
          ),
        },
      ];
    }

    if (activeTab === "cancelled") {
      return [
        ...baseColumns,
        {
          header: t("ORDER_PRICE"),
          render: (pos) => (
            <span className="text-xs font-black">
              ₺{formatCurrency(pos.startingPrice)}
            </span>
          ),
        },
        {
          header: t("ORDER_DATE"),
          render: (pos) => (
            <span className="text-xs font-black">
              {formatDate(pos.openingDate)}
            </span>
          ),
        },
        {
          header: t("CLOSED_DATE"),
          render: (pos) => (
            <span className="text-xs font-black">
              {formatDate(pos.closingDate)}
            </span>
          ),
        },
      ];
    }

    return baseColumns;
  }, [activeTab, t]);

  return (
    <div className="hidden md:block space-y-6 p-8">
      {/* 4. METRIC CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* 5. TAB FILTERS */}
      <div className="flex border-b border-slate-100 gap-6">
        {(["open", "waiting", "cancelled", "closed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer pb-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "border-b-2 border-brand text-brand"
                : "text-slate-400"
            }`}
          >
            {t(tab.toUpperCase())} ({myAssets?.counts?.[tab] || 0})
          </button>
        ))}
      </div>

      {/* 6. DATA TABLE */}
      <div className="overflow-hidden">
        <DataTable
          columns={columns}
          data={myAssets?.tables?.[activeTab] || []}
          isLoading={isMyAssetsLoading}
        />
      </div>

      <SellModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DesktopPositions;

interface MetricCardProps {
  title: string;
  value: number | undefined;
  icon?: React.ReactNode;
  isTrend?: boolean; // If true, shows green/red colors for P&L
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
