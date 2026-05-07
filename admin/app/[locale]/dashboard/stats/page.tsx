"use client";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  MousePointer2,
} from "lucide-react";

const StatisticsPage = () => {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 1. Page Header with Date Range Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
            Deep Analytics
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Advanced metrics for synthetic engine and user behavior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-bg border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500">
            <Calendar size={14} />
            <span>Last 90 Days</span>
          </div>
          {/* <button className="p-2 bg-bg border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
            <Filter size={18} className="text-slate-400" />
          </button> */}
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all cursor-pointer">
            <Download size={16} />
            <span>Export CSV</span>
          </button> */}
        </div>
      </div>

      {/* 2. Primary Volume Chart (Hero) */}
      <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Total Synthetic Volume
              </p>
              <h2 className="text-3xl font-black text-fg">$48,294,120.00</h2>
            </div>
            <div className="h-10 w-px bg-slate-100 dark:border-slate-800 hidden md:block" />
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Avg. Daily Volume
              </p>
              <h2 className="text-xl font-black text-brand">$536.6K</h2>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
            {["Volume", "Orders", "Users"].map((tab) => (
              <button
                key={tab}
                className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === "Volume" ? "bg-bg text-brand shadow-sm" : "text-slate-500 hover:text-fg"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Placeholder for Recharts AreaChart */}
        <div className="h-87.5 w-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <TrendingUp size={120} strokeWidth={1} />
          </div>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-[0.2em]">
            Volume Performance Matrix
          </p>
        </div>
      </div>

      {/* 3. Secondary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition Source */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={20} className="text-brand" />
            <h3 className="font-bold text-fg">Acquisition Channels</h3>
          </div>
          <div className="flex flex-col gap-4">
            {/* List of data points */}
            {[
              { name: "Direct Access", val: "45%", color: "bg-brand" },
              {
                name: "Referral System",
                val: "32%",
                color: "bg-brand-secondary",
              },
              { name: "Organic Search", val: "18%", color: "bg-slate-400" },
              { name: "Social Media", val: "5%", color: "bg-slate-200" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-xs font-bold text-slate-500">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-black text-fg">{item.val}</span>
              </div>
            ))}
            <div className="h-2 w-full flex rounded-full overflow-hidden mt-2">
              <div className="bg-brand h-full w-[45%]" />
              <div className="bg-brand-secondary h-full w-[32%]" />
              <div className="bg-slate-400 h-full w-[18%]" />
              <div className="bg-slate-200 h-full w-[5%]" />
            </div>
          </div>
        </div>

        {/* Top Performing Synthetics */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-secondary" />
              <h3 className="font-bold text-fg">Top Assets</h3>
            </div>
            {/* <button className="text-[10px] font-black text-brand uppercase tracking-tighter hover:underline">
              View All
            </button> */}
          </div>

          <div className="space-y-4">
            {["BIST100_SYN", "NASDAQ_SYN", "GOLD_SYN"].map((asset) => (
              <div
                key={asset}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black text-fg">{asset}</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    2,412 Trades
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-up text-xs font-black">
                    <ArrowUpRight size={14} />
                    $12.5M
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Real-time User Interaction Card */}
      <div className="rounded-3xl bg-slate-950 p-8 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-secondary">
            <MousePointer2 size={16} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Click Velocity
            </span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Live User Retention
          </h2>
          <p className="text-slate-400 text-sm max-w-md">
            Our synthetic engine currently processes 452.8 requests per second
            across all global nodes.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-4xl font-black text-brand tabular-nums">
            98.2%
          </span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Efficiency
          </span>
        </div>
        {/* Background pattern for visual flair */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-linear-to-l from-brand/10 to-transparent" />
      </div>
    </div>
  );
};

export default StatisticsPage;
