"use client";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { useGetTradeHistoryQuery } from "@/lib/redux/services/trade.api";
import { useTranslations } from "next-intl";

interface TradeRecord {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  priceAtExecution: number;
  commission: number;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  createdAt: string;
}

export default function TradeTabs() {
  const t = useTranslations();
  const [activeSubTab, setActiveSubTab] = useState<"history" | "orders">(
    "history",
  );

  // Fetching data with status filters
  const { data: openOrders = [], isLoading: loadingOrders } =
    useGetTradeHistoryQuery({
      status: "PENDING",
    });
  const { data: history = [], isLoading: loadingHistory } =
    useGetTradeHistoryQuery(undefined);

  const columns: Column<TradeRecord>[] = [
    {
      header: t("ASSET"),
      render: (item) => (
        <span className="font-black text-fg uppercase">{item.symbol}</span>
      ),
    },
    {
      header: t("SIDE"),
      render: (item) => (
        <span
          className={`text-[10px] font-black ${item.side === "BUY" ? "text-emerald-500" : "text-red-500"}`}
        >
          {item.side === "BUY" ? t("BUY") : t("SELL")}
        </span>
      ),
    },
    {
      header: t("QUANTITY"),
      align: "right",
      render: (item) => (
        <span className="font-mono font-bold text-slate-500">
          {item.quantity}
        </span>
      ),
    },
    {
      header: t("PRICE"),
      align: "right",
      render: (item) => (
        <span className="font-mono font-bold text-slate-500">
          ₺{formatCurrency(item.priceAtExecution)}
        </span>
      ),
    },
    {
      header: t("TOTAL"),
      align: "right",
      render: (item) => (
        <span className="font-mono font-black text-brand">
          ₺{formatCurrency(item.quantity * item.priceAtExecution)}
        </span>
      ),
    },
    {
      header: t("STATUS"),
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: t("DATE"),
      align: "right",
      render: (item) => (
        <span className="text-[10px] font-medium text-slate-400">
          {formatDate(item?.createdAt)}
        </span>
      ),
    },
  ];

  const isLoading = activeSubTab === "orders" ? loadingOrders : loadingHistory;

  return (
    <div className="flex-1 flex flex-col border-t border-gray-200 dark:border-gray-800 bg-bg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 px-4 space-x-6 shrink-0 bg-white dark:bg-bg">
        <button
          onClick={() => setActiveSubTab("history")}
          className={`cursor-pointer py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeSubTab === "history" ? "text-brand" : "text-slate-500"
          }`}
        >
          {t("TRANSACTION_HISTORY")}
          {activeSubTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand" />
          )}
        </button>
        {/* <button
          onClick={() => setActiveSubTab("orders")}
          className={`cursor-pointer py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeSubTab === "orders" ? "text-brand" : "text-slate-500"
          }`}
        >
          {t("OPEN_ORDERS")} {openOrders.length > 0 && `(${openOrders.length})`}
          {activeSubTab === "orders" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand" />
          )}
        </button> */}
      </div>

      {/* Table Content */}
      <div className="h-full w-full p-4 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase animate-pulse">
            {t("LOADING_TRANSACTIONS")}
          </div>
        ) : (
          <DataTable
            data={activeSubTab === "orders" ? openOrders : history}
            columns={columns as any}
            itemsPerPage={10}
            minWidth="800px"
          />
        )}
      </div>
    </div>
  );
}
