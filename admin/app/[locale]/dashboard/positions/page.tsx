"use client";
import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  Settings,
  Zap,
  Loader2,
  Save,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

export default function PositionsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [editingPosition, setEditingPosition] = useState<any | null>(null);

  // In a real app, use: const { data: positions, isLoading } = useGetPositionsQuery();
  const positions = [
    {
      id: "1",
      user: "Arda Güler",
      symbol: "THYAO",
      side: "BUY",
      lots: 150,
      entryPrice: 285.4,
      currentPrice: 292.1,
      pnl: 1005.0,
      leverage: "5x",
    },
  ];

  const handleUpdatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await updatePosition({ id: editingPosition.id, ...formData }).unwrap();
      toast.success("Position adjusted successfully");
      setEditingPosition(null);
    } catch (err) {
      toast.error("Failed to update position");
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Asset / Side",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${row.side === "BUY" ? "bg-up/10 text-up" : "bg-red-500/10 text-red-500"}`}
          >
            {row.side === "BUY" ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
          </div>
          <div>
            <p className="text-xs font-black text-fg uppercase tracking-tight">
              {row.symbol}
            </p>
            <p
              className={`text-[9px] font-black uppercase ${row.side === "BUY" ? "text-up" : "text-red-500"}`}
            >
              {row.side}{" "}
              <span className="text-slate-400 ml-1">x{row.leverage}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "User",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-fg uppercase tracking-tighter">
            {row.user}
          </span>
          <span className="text-[9px] text-slate-400 font-bold">
            ID: {row.id}
          </span>
        </div>
      ),
    },
    {
      header: "Volume",
      render: (row) => (
        <span className="text-xs font-black text-fg">
          {row.lots} <span className="text-[10px] text-slate-400">LOT</span>
        </span>
      ),
    },
    {
      header: "Floating P/L",
      render: (row) => (
        <div
          className={`text-xs font-black ${row.pnl >= 0 ? "text-up" : "text-red-500"}`}
        >
          {row.pnl >= 0 ? "+" : ""}
          {row.pnl.toLocaleString()} ₺
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditingPosition(row)}
            className="p-2 rounded-lg bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer"
          >
            <Settings size={16} />
          </button>
          <button
            title="Force Close"
            className="p-2 rounded-lg bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            <XCircle size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredPositions = useMemo(
    () =>
      positions?.filter(
        (s: any) =>
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name?.toLowerCase().includes(search.toLowerCase()),
      ),
    [positions, debouncedSearch],
  );

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 pb-20 max-w-7xl mx-auto">
      {/* Header logic same as your snippet */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
          Live Positions
        </h1>
      </div>

      <div className="relative max-w-100">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by user or assets..."
          // value={search}
          // onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-brand"
        />
      </div>
      <DataTable data={filteredPositions} columns={columns} />

      {/* ADMIN EDIT MODAL */}
      {editingPosition && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-fg uppercase tracking-tighter mb-1">
              Edit Position
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">
              User: {editingPosition.user} ({editingPosition.symbol})
            </p>

            <form onSubmit={handleUpdatePosition} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    Lots (Volume)
                  </label>
                  <input
                    type="number"
                    defaultValue={editingPosition.lots}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    defaultValue={editingPosition.entryPrice}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-black outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="p-4 bg-brand/5 rounded-2xl border border-brand/10">
                <p className="text-[10px] text-brand font-bold uppercase leading-relaxed">
                  Note: Modifying entry price or volume will instantly
                  recalculate the user's P/L and Margin Level.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPosition(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-fg rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand/20 transition-all"
                >
                  <Save size={14} /> Update Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
