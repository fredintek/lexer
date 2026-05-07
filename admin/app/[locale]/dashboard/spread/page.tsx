"use client";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeftRight,
  Search,
  ShieldAlert,
  Save,
  Landmark,
  Loader2,
  Edit,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import {
  useGetAllSettingsQuery,
  useUpdateSettingsMutation,
} from "@/lib/redux/services/settings.api";
import {
  useGetStaticStocksQuery,
  useUpdateStockAdjMutation,
} from "@/lib/redux/services/yfinance.api";
import toast from "react-hot-toast";
import { getLogoUrl } from "@/lib/helpers";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";

export default function AdjustmentEnginePage() {
  const t = useTranslations();
  const [editingStock, setEditingStock] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: rawSettings, isLoading: loadingSettings } =
    useGetAllSettingsQuery(undefined);
  const [updateSettings, { isLoading: isFinancing }] =
    useUpdateSettingsMutation();
  const [finForm, setFinForm] = useState({
    GLOBAL_DEPOSIT_FEE: "0",
    GLOBAL_WITHDRAW_FEE: "0",
    DEFAULT_BUY_ADJ: "0",
    DEFAULT_SELL_ADJ: "0",
  });

  const handleSaveFinance = async () => {
    try {
      await updateSettings({
        settings: {
          GLOBAL_DEPOSIT_FEE: {
            value: finForm.GLOBAL_DEPOSIT_FEE,
            group: "market_engine",
          },
          GLOBAL_WITHDRAW_FEE: {
            value: finForm.GLOBAL_WITHDRAW_FEE,
            group: "market_engine",
          },
          DEFAULT_BUY_ADJ: {
            value: finForm.DEFAULT_BUY_ADJ,
            group: "market_engine",
          },
          DEFAULT_SELL_ADJ: {
            value: finForm.DEFAULT_SELL_ADJ,
            group: "market_engine",
          },
        },
      }).unwrap();
      toast.success("Global financial fees updated");
    } catch (e) {
      toast.error("Failed to update financial fees");
    }
  };

  const { data: stocks } = useGetStaticStocksQuery(undefined);
  const [updateStockAdj, { isLoading: isAdjUpdating }] =
    useUpdateStockAdjMutation();

  const handleSaveStock = async (symbol: string, buy: string, sell: string) => {
    try {
      await updateStockAdj({
        symbol,
        buyAdj: Number(buy),
        sellAdj: Number(sell),
      }).unwrap();
      toast.success(`${symbol} adjustments updated`);
    } catch {
      toast.error(`Failed to update ${symbol}`);
    }
  };

  const columns: Column<any>[] = [
    {
      header: t("ASSET"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-black text-[10px]">
            {getLogoUrl(row?.website) ? (
              <img
                src={getLogoUrl(row?.website)}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              row.symbol.substring(0, 2)
            )}
          </div>
          <span className="text-[10px] font-black text-fg uppercase">
            {row.symbol}
          </span>
        </div>
      ),
    },
    {
      header: t("BUY_ADJ"),
      render: (row) => (
        <span className="text-[10px] font-bold text-slate-600">
          {Number(row.buyAdjustment).toFixed(3)}
        </span>
      ),
    },
    {
      header: t("SELL_ADJ"),
      render: (row) => (
        <span className="text-[10px] font-bold text-slate-600">
          {Number(row.sellAdjustment).toFixed(3)}
        </span>
      ),
    },
    {
      header: t("ACTION"),
      align: "right",
      render: (row) => (
        <button
          onClick={() => setEditingStock(row)}
          className="text-[10px] font-black uppercase text-brand hover:underline cursor-pointer flex items-center gap-1"
          title={t("EDIT")}
        >
          <Edit size={14} />
        </button>
      ),
    },
  ];

  const filteredStocks = useMemo(
    () =>
      stocks?.filter(
        (s: any) =>
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name?.toLowerCase().includes(search.toLowerCase()),
      ),
    [stocks, debouncedSearch],
  );

  useEffect(() => {
    if (Array.isArray(rawSettings)) {
      const map = rawSettings.reduce(
        (acc, s) => ({ ...acc, [s.key]: s.value }),
        {},
      );
      setFinForm({
        GLOBAL_DEPOSIT_FEE: map.GLOBAL_DEPOSIT_FEE || "0",
        GLOBAL_WITHDRAW_FEE: map.GLOBAL_WITHDRAW_FEE || "0",
        DEFAULT_BUY_ADJ: map.DEFAULT_BUY_ADJ || "0",
        DEFAULT_SELL_ADJ: map.DEFAULT_SELL_ADJ || "0",
      });
    }
  }, [rawSettings]);

  return (
    <div className="p-6 flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase flex items-center gap-3">
            <ArrowLeftRight className="text-brand" size={28} />{" "}
            {t("SPREAD_ENGINE")}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {t("MARKUP_MANAGEMENT")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Financial Gateway % */}
        <div className="space-y-6">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <Landmark
              className="absolute -right-4 -top-4 opacity-5 text-fg"
              size={120}
            />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
              {t("FINANCIAL_GATEWAY_PERCENT")}
            </h2>

            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    {t("DEPOSIT_FEE")}
                  </label>
                  <input
                    type="number"
                    value={finForm.GLOBAL_DEPOSIT_FEE}
                    onChange={(e) =>
                      setFinForm({
                        ...finForm,
                        GLOBAL_DEPOSIT_FEE: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    {t("WITHDRAW_FEE")}
                  </label>
                  <input
                    type="number"
                    value={finForm.GLOBAL_WITHDRAW_FEE}
                    onChange={(e) =>
                      setFinForm({
                        ...finForm,
                        GLOBAL_WITHDRAW_FEE: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    {t("DEFAULT_BUY_ADJ")}
                  </label>
                  <input
                    type="number"
                    value={finForm.DEFAULT_BUY_ADJ}
                    onChange={(e) =>
                      setFinForm({
                        ...finForm,
                        DEFAULT_BUY_ADJ: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    {t("DEFAULT_SELL_ADJ")}
                  </label>
                  <input
                    type="number"
                    value={finForm.DEFAULT_SELL_ADJ}
                    onChange={(e) =>
                      setFinForm({
                        ...finForm,
                        DEFAULT_SELL_ADJ: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveFinance}
                disabled={isFinancing}
                className="cursor-pointer w-full py-3 bg-brand text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                {isFinancing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Save size={14} />
                )}
                {t("APPLY")}
              </button>
            </div>
          </div>

          <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
            <ShieldAlert size={18} className="text-orange-500 shrink-0" />
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold leading-relaxed uppercase">
              {t("OVERRIDE_PRIORITY_WARNING")}
            </p>
          </div>
        </div>

        {/* Right: Symbol Specific Adjustments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t("TRADING_OVERRIDES")}
            </h2>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={t("SEARCH_SYMBOL")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-brand"
            />
          </div>

          <DataTable data={filteredStocks || []} columns={columns} />
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingStock && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-xs">
                {editingStock.symbol.substring(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-black text-fg uppercase tracking-tighter">
                  {t("ADJUST_SPREAD")}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {t("SYMBOL_OVERRIDES", { symbol: editingStock.symbol })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    {t("BUY_ADJUSTMENT")}
                  </label>
                  <input
                    type="number"
                    id="buy-adj"
                    defaultValue={editingStock.buyAdjustment}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    {t("SELL_ADJUSTMENT")}
                  </label>
                  <input
                    type="number"
                    id="sell-adj"
                    defaultValue={editingStock.sellAdjustment}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditingStock(null)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-fg rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
              >
                {t("CANCEL")}
              </button>
              <button
                disabled={isAdjUpdating}
                onClick={async () => {
                  const buy = (
                    document.getElementById("buy-adj") as HTMLInputElement
                  ).value;
                  const sell = (
                    document.getElementById("sell-adj") as HTMLInputElement
                  ).value;

                  await handleSaveStock(editingStock.symbol, buy, sell);
                  setEditingStock(null);
                }}
                className="flex-1 py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand/20 transition-all disabled:opacity-50"
              >
                {isAdjUpdating ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Save size={14} />
                )}
                {t("UPDATE")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
