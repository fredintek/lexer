"use client";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import { formatCurrency, formatDate, getLogoUrl } from "@/lib/helpers";
import { useTranslations } from "next-intl";
import { useGetTransactionHistoryQuery } from "@/lib/redux/services/positions.api";
import { Link } from "@/i18n/navigation";
import { Eye } from "lucide-react";

export default function TradeTabs() {
  const t = useTranslations();
  const [activeSubTab, setActiveSubTab] = useState<"history">("history");

  const { data: history = [], isLoading: loadingHistory } =
    useGetTransactionHistoryQuery(undefined);

  const columns: Column<any>[] = [
    {
      header: t("ASSET"),
      render: (item) => (
        <div className="">
          {getLogoUrl(item?.website) ? (
            <div className="flex items-center">
              <div className="w-10 h-10">
                <img
                  src={getLogoUrl(item?.website)}
                  alt=""
                  className="w-full h-full"
                />
              </div>

              <p className="capitalize">{item?.symbol}</p>
            </div>
          ) : (
            <div className="text-white w-full h-full bg-brand/50 rounded-2xl flex items-center justify-center font-black">
              <p className="">{item?.symbol?.slice(0, 2)}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("SIDE"),
      render: (item) => (
        <span
          className={`text-[10px] font-black ${item.side === "BUY" ? "text-emerald-500" : "text-red-500"}`}
        >
          {item.side}
        </span>
      ),
    },
    {
      header: t("QUANTITY"),
      align: "right",
      render: (item) => (
        <span className="text-[10px] font-bold text-slate-500">
          {item.quantity}
        </span>
      ),
    },
    {
      header: t("UNIT_PRICE"),
      align: "right",
      render: (item) => (
        <span className="text-[10px] font-mono font-bold text-slate-500">
          ₺{formatCurrency(item.unitPrice)}
        </span>
      ),
    },
    {
      header: t("TOTAL"),
      align: "right",
      render: (item) => (
        <span className="text-[10px] font-mono font-bold text-slate-500">
          ₺{formatCurrency(item.executionPrice)}
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
          {formatDate(item?.date)}
        </span>
      ),
    },
    {
      header: t("ACTIONS"),
      align: "right",
      render: (item) => (
        <Link href="/profile?tab=assets" className="w-fit">
          <Eye size={18} className="text-brand" />
        </Link>
      ),
    },
  ];

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
      </div>

      {/* Table Content */}
      <div className="h-full w-full p-4 overflow-y-auto">
        <DataTable
          data={history}
          columns={columns as any}
          itemsPerPage={10}
          minWidth="800px"
        />
      </div>
    </div>
  );
}
