"use client";
import { TrendingUp, TrendingDown, Edit } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatFullTimestamp } from "@/lib/helpers";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import { useTranslations } from "next-intl";

type Props = {
  trades: any[];
};

const TradesTable = ({ trades }: Props) => {
  const t = useTranslations();
  const columns: Column<any>[] = [
    {
      header: t("ASSET_SIDE"),
      render: (trade) => {
        return (
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${trade.side === "BUY" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
            >
              {trade.side === "BUY" ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
            </div>
            <div>
              <p className="text-[11px] font-black text-fg uppercase">
                {trade.symbol}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {trade.side}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: t("EXECUTION"),
      render: (trade) => {
        return (
          <div className="flex flex-col">
            <p className="text-[11px] font-bold text-fg">
              {t("IN")}: ₺{formatCurrency(trade.priceAtExecution)}
            </p>
          </div>
        );
      },
    },
    {
      header: t("PNL"),
      render: (trade) => {
        const isPositive = trade?.pnl >= 0;
        const { datePart, timePart } = formatFullTimestamp(trade.createdAt);
        return (
          <div className="flex flex-col">
            <p
              className={`text-[11px] font-black ${isPositive ? "text-green-500" : "text-red-500"}`}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(trade.pnl)} TRY
            </p>
            <>
              <p className="text-[10px] font-black text-fg uppercase">
                {datePart}
              </p>
              <p className="text-[9px] font-medium text-slate-400">
                {timePart}
              </p>
            </>
          </div>
        );
      },
    },
    {
      header: t("SIZE"),
      render: (trade) => (
        <div className="flex flex-col">
          <p className="text-[11px] font-bold text-fg uppercase">
            {trade.quantity} {t("UNITS")}
          </p>
          <p className="text-[9px] font-medium text-slate-400 uppercase">
            {t("TOTAL")}: ₺
            {formatCurrency(trade.quantity * trade.priceAtExecution)}
          </p>
        </div>
      ),
    },
    {
      header: t("STATUS"),
      render: (trade) => <StatusBadge status={trade.status} />,
    },
  ];

  return (
    <div className="">
      <DataTable columns={columns} data={trades || []} />
    </div>
  );
};

export default TradesTable;
