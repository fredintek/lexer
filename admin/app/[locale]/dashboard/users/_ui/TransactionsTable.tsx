"use client";
import { FileText, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatFullTimestamp } from "@/lib/helpers";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import { useTranslations } from "next-intl";

type Props = {
  txs: any[];
};

const TransactionsTable = ({ txs }: Props) => {
  const t = useTranslations();
  const columns: Column<any>[] = [
    {
      header: t("REF_DATE"),
      render: (tx) => {
        const { datePart, timePart } = formatFullTimestamp(tx.createdAt);
        return (
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${tx.type === "DEPOSIT" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}
            >
              {tx.type === "DEPOSIT" ? (
                <ArrowDownLeft size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-fg uppercase">
                #{tx.id.slice(0, 8)}
              </p>
              <div className="flex gap-2 text-[9px] font-medium text-slate-400">
                <span>{datePart}</span>
                <span>{timePart}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: t("AMOUNT_METHOD"),
      render: (tx) => (
        <div className="flex flex-col">
          <p className="text-[11px] font-black text-fg">
            {tx.type === "DEPOSIT" ? "+" : "-"} {formatCurrency(tx.amount)} TRY
          </p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {tx.paymentMethod?.name ||
              tx.bankAccount?.bankName ||
              t("MANUAL_ADJUSTMENT")}{" "}
          </p>
        </div>
      ),
    },
    {
      header: t("RECEIPT"),
      render: (tx) =>
        tx.receipt?.url ? (
          <a
            href={tx.receipt.url}
            target="_blank"
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:text-brand transition-colors w-fit"
          >
            <FileText size={12} /> {t("VIEW_FILE")}
          </a>
        ) : (
          <span className="text-[9px] font-bold text-slate-300 uppercase">
            {t("NO_RECEIPT")}
          </span>
        ),
    },
    {
      header: t("STATUS"),
      render: (tx) => <StatusBadge status={tx.status} />,
    },
  ];

  return (
    <div className="">
      <DataTable columns={columns} data={txs || []} />
    </div>
  );
};

export default TransactionsTable;
