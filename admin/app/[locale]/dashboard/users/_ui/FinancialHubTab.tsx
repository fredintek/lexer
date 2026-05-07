import { ChartBar, History } from "lucide-react";
import { useState } from "react";
import TradesTable from "./TradesTable";
import TransactionsTable from "./TransactionsTable";
import { useGetAllTxQuery } from "@/lib/redux/services/wallet.api";
import { useTranslations } from "next-intl";

export default function FinancialHubTab({ user }: { user: any }) {
  const t = useTranslations();
  const [subTab, setSubTab] = useState("trades");
  const [txStatus, setTxStatus] = useState<string>("");

  // Fetch transactions specifically for this user with an optional status filter
  const { data: transactions } = useGetAllTxQuery(
    {
      userId: user.id,
      status: txStatus || undefined,
      // type: subTab === 'deps' ? 'DEPOSIT' : subTab === 'withs' ? 'WITHDRAWAL' : undefined
    },
    { skip: subTab !== "txs" },
  );

  const renderSubTabContent = () => {
    switch (subTab) {
      case "trades":
        return <TradesTable trades={user.trades || []} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: t("TRADES"),
            id: "trades",
            icon: ChartBar,
            count: user.trades?.length || 0,
          },
          {
            label: t("TRANSACTIONS"),
            id: "txs",
            icon: History,
            count: user.transactions?.length || 0,
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSubTab(item.id)}
            className={`p-5 rounded-3xl border flex flex-col gap-1 transition-all cursor-pointer ${
              subTab === item.id
                ? "bg-brand border-brand text-white shadow-lg shadow-brand/20"
                : "bg-bg border-slate-200 dark:border-slate-800 text-fg hover:border-brand/50"
            }`}
          >
            <item.icon
              size={18}
              className={subTab === item.id ? "text-white" : "text-brand"}
            />
            <span className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-80">
              {item.label}
            </span>
            <span className="text-lg font-black tracking-tighter">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
            {t(subTab.toUpperCase())}
          </h4>
          <div className="flex gap-2">
            {subTab === "txs" && (
              <div className="flex gap-2 mt-2">
                {["", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTxStatus(status)}
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${
                      txStatus === status
                        ? "bg-brand border-brand text-white"
                        : "bg-transparent border-slate-200 text-slate-400 hover:border-brand"
                    }`}
                  >
                    {status ? t(status) : t("ALL")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-100">
          {renderSubTabContent()}
          {subTab === "txs" && <TransactionsTable txs={transactions || []} />}
        </div>
      </div>
    </div>
  );
}
