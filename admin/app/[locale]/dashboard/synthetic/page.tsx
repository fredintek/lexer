"use client";
import { useMemo, useState } from "react";
import {
  Zap,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Info,
  Edit3,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import StatusBadge from "@/components/StatusBadge";

type SyntheticSymbol = {
  id: string;
  name: string;
  underlying: string;
  leverage: number;
  spread: number;
  status: "Active" | "Paused" | "Draft";
  lastPrice: string;
};

export default function SyntheticSymbolsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const symbols = useMemo<SyntheticSymbol[]>(
    () => [
      {
        id: "SYN-001",
        name: "BIST-BANK-IDX",
        underlying: "(AKBNK * 0.5) + (GARAN * 0.5)",
        leverage: 10,
        spread: 0.02,
        status: "Active",
        lastPrice: "45.20 ₺",
      },
      {
        id: "SYN-002",
        name: "BIST-TECH-LEVERED",
        underlying: "ASELS + (SOFT * 2)",
        leverage: 20,
        spread: 0.05,
        status: "Active",
        lastPrice: "112.80 ₺",
      },
      {
        id: "SYN-003",
        name: "USDTRY-HEDGE",
        underlying: "USDTRY * 0.1",
        leverage: 1,
        spread: 0.01,
        status: "Paused",
        lastPrice: "3.24 ₺",
      },
    ],
    [],
  );

  const columns: Column<SyntheticSymbol>[] = [
    {
      header: "Symbol / ID",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-fg uppercase tracking-tight">
              {row.name}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Calculation Formula",
      render: (row) => (
        <div className="max-w-50">
          <code className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md text-slate-500 truncate block">
            {row.underlying}
          </code>
        </div>
      ),
    },
    {
      header: "Leverage",
      render: (row) => (
        <span className="text-xs font-black text-fg">x{row.leverage}</span>
      ),
    },
    {
      header: "Mark-up (%)",
      render: (row) => (
        <span className="text-xs font-bold text-orange-500">{row.spread}%</span>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand transition-all cursor-pointer">
            <Edit3 size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all cursor-pointer">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 pb-20 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase flex items-center gap-3">
            <TrendingUp className="text-brand" size={28} /> Synthetic Symbols
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Create and manage derived assets from BIST data feeds.
          </p>
        </div>
        <button className="cursor-pointer bg-brand text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all flex w-fit items-center gap-2">
          <Plus size={18} /> Create New Symbol
        </button>
      </div>

      {/* Info Alert for BIST Hours */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
          Synthetic symbols derived from **BIST100** assets will only update
          during exchange hours (**10:00 - 18:00 TRT**). Outside these hours,
          price feeds will remain static unless a global price offset is
          applied.
        </p>
      </div>

      {/* Filters & Table */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96 group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors"
            />
            <input
              type="text"
              placeholder="Search symbols..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:border-brand transition-all"
            />
          </div>
        </div>

        <DataTable data={symbols} columns={columns} />
      </div>

      {/* Quick Visual Analytics (Synthetic Load) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Synthetics", value: "12", color: "text-brand" },
          { label: "Calculation Latency", value: "4ms", color: "text-up" },
          { label: "Total Exposure", value: "₺2.4M", color: "text-fg" },
          { label: "Feed Status", value: "Healthy", color: "text-up" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-bg border border-slate-200 dark:border-slate-800 p-5 rounded-3xl"
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <h4 className={`text-lg font-black tracking-tighter ${stat.color}`}>
              {stat.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}
