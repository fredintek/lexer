"use client";
import { useEffect, useMemo, useState } from "react";
import {
  SlidersHorizontal,
  Search,
  Layers,
  Info,
  Save,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Edit,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import {
  useGetStaticStocksQuery,
  useUpdateLotSettingsMutation,
} from "@/lib/redux/services/yfinance.api";
import toast from "react-hot-toast";
import { getLogoUrl } from "@/lib/helpers";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useGetAllSettingsQuery,
  useUpdateSettingsMutation,
} from "@/lib/redux/services/settings.api";
import { useTranslations } from "next-intl";

export default function LotSettingsPage() {
  const t = useTranslations();
  const [editingStock, setEditingStock] = useState<any | null>(null);
  const { data: stocks } = useGetStaticStocksQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const [updateLot, { isLoading: isUpdating }] = useUpdateLotSettingsMutation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: settings } = useGetAllSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const [updateSettings] = useUpdateSettingsMutation();

  const [form, setForm] = useState({
    PLATFORM_MIN_LOT: "1",
    PLATFORM_MAX_LOT: "10000",
    PLATFORM_DEFAULT_STEP: "1",
  });

  const handleSave = async (symbol: string, rowData: any) => {
    try {
      await updateLot({
        symbol,
        minLot: Number(rowData.minLot),
        maxLot: Number(rowData.maxLot),
        lotStep: Number(rowData.lotStep),
      }).unwrap();
      toast.success(`${symbol} updated successfully`);
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  const handleSaveDefault = async () => {
    const payload = {
      settings: {
        PLATFORM_MIN_LOT: {
          value: form.PLATFORM_MIN_LOT,
          group: "market_engine",
        },
        PLATFORM_MAX_LOT: {
          value: form.PLATFORM_MAX_LOT,
          group: "market_engine",
        },
        PLATFORM_DEFAULT_STEP: {
          value: form.PLATFORM_DEFAULT_STEP,
          group: "market_engine",
        },
      },
    };

    try {
      await updateSettings(payload).unwrap();
      toast.success("Global settings updated");
    } catch (err) {
      toast.error("Failed to update global settings");
    }
  };

  const filteredStocks = useMemo(
    () =>
      stocks?.filter((s: any) =>
        s.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ) || [],
    [stocks, debouncedSearch],
  );

  const columns: Column<any>[] = [
    {
      header: t("SYMBOL"), // Translated
      render: (row) => (
        <div className="flex items-center gap-3">
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
          <span className="text-xs font-black text-fg uppercase">
            {row.symbol.replace(".IS", "")}
          </span>
        </div>
      ),
    },
    {
      header: t("MIN_LOT"),
      render: (row) => (
        <span className="text-[10px] font-bold text-slate-600">
          {row.minLot}
        </span>
      ),
    },
    {
      header: t("MAX_LOT"),
      render: (row) => (
        <span className="text-[10px] font-bold text-slate-600">
          {row.maxLot}
        </span>
      ),
    },
    {
      header: t("STEP_SIZE"),
      render: (row) => (
        <span className="text-[10px] font-bold text-slate-600">
          {row.lotStep}
        </span>
      ),
    },
    {
      header: t("ACTIONS"),
      align: "right",
      render: (row) => (
        <button
          onClick={() => setEditingStock(row)}
          className="text-[10px] font-black uppercase text-brand hover:underline cursor-pointer"
        >
          <Edit size={14} />
        </button>
      ),
    },
  ];

  const items = [
    {
      key: "PLATFORM_MIN_LOT",
      label: t("PLATFORM_MIN_LOT_LABEL"),
      sub: t("PLATFORM_MIN_LOT_SUB"),
    },
    {
      key: "PLATFORM_MAX_LOT",
      label: t("PLATFORM_MAX_LOT_LABEL"),
      sub: t("PLATFORM_MAX_LOT_SUB"),
    },
    {
      key: "PLATFORM_DEFAULT_STEP",
      label: t("DEFAULT_LOT_STEP_LABEL"),
      sub: t("DEFAULT_LOT_STEP_SUB"),
    },
  ];

  useEffect(() => {
    if (Array.isArray(settings)) {
      const settingsMap = settings.reduce(
        (acc, item) => {
          acc[item.key] = item.value;
          return acc;
        },
        {} as Record<string, string>,
      );

      setForm({
        PLATFORM_MIN_LOT: settingsMap.PLATFORM_MIN_LOT || "1",
        PLATFORM_MAX_LOT: settingsMap.PLATFORM_MAX_LOT || "50000",
        PLATFORM_DEFAULT_STEP: settingsMap.PLATFORM_DEFAULT_STEP || "1",
      });
    }
  }, [settings]);

  return (
    <div className="p-6 flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase flex items-center gap-3">
            <Layers className="text-brand" size={28} /> {t("LOT_SETTINGS")}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {t("LOT_SETTINGS_DESC")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Global Lot Rules */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 text-fg -z-10">
              <SlidersHorizontal size={120} />
            </div>

            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              {t("STANDARD_DEFAULT")}
            </h2>

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.key} className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    {item.label}
                  </label>
                  <input
                    type="number"
                    value={form[item.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [item.key]: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand transition-all"
                  />
                  <p className="text-[9px] text-slate-400 font-medium px-1 uppercase">
                    {item.sub}
                  </p>
                </div>
              ))}

              <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex items-start gap-3">
                <AlertTriangle
                  size={18}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-relaxed uppercase">
                  {t("MIN_LOT_WARNING")}
                </p>
              </div>

              <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
                <ShieldAlert size={18} className="text-orange-500 shrink-0" />
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold leading-relaxed uppercase">
                  {t("OVERRIDE_NOTICE")}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleSaveDefault}
                disabled={isUpdating}
                className="cursor-pointer bg-brand text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {t("SAVE_CHANGES")}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Symbol Specific Limits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
              {t("INVENTORY_LIMITS")}
            </h2>
          </div>

          <div className="relative group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={t("SEARCH_ASSETS")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-brand"
            />
          </div>

          <DataTable data={filteredStocks} columns={columns} />

          <div className="mt-4 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-3xl flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Info size={16} />
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight uppercase">
              {t("EXPOSURE_NOTE")}
            </p>
          </div>
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
                  {t("ADJUST_LIMITS")}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {editingStock.symbol} {t("OVERRIDES")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    {t("MIN_LOT")}
                  </label>
                  <input
                    type="number"
                    id="modal-min"
                    defaultValue={editingStock.minLot}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    {t("STEP_SIZE")}
                  </label>
                  <input
                    type="number"
                    id="modal-step"
                    defaultValue={editingStock.lotStep}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                  {t("MAX_LOT")}
                </label>
                <input
                  type="number"
                  id="modal-max"
                  defaultValue={editingStock.maxLot}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingStock(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-fg rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
                >
                  {t("CANCEL")}
                </button>
                <button
                  disabled={isUpdating}
                  onClick={async () => {
                    const min = (
                      document.getElementById("modal-min") as HTMLInputElement
                    ).value;
                    const max = (
                      document.getElementById("modal-max") as HTMLInputElement
                    ).value;
                    const step = (
                      document.getElementById("modal-step") as HTMLInputElement
                    ).value;

                    await handleSave(editingStock.symbol, {
                      minLot: min,
                      maxLot: max,
                      lotStep: step,
                    });
                    setEditingStock(null);
                  }}
                  className="flex-1 py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand/20 transition-all disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {t("UPDATE")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
