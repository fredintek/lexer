"use client";
import { useTranslations } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  const t = useTranslations();
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          {payload[0].payload.day}
        </p>
        <div className="space-y-1">
          <p className="text-xs font-bold text-up flex justify-between gap-4">
            <span>{t("INFLOW")}:</span>
            <span>${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-xs font-bold text-down flex justify-between gap-4">
            <span>{t("OUTFLOW")}:</span>
            <span>${payload[1].value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export interface ChartDataPoint {
  day: string;
  deposit: number;
  withdrawal: number;
}

type Props = { data: ChartDataPoint[] };

const FlowChart = ({ data }: Props) => {
  return (
    <div className="h-full w-full min-h-75">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#88888810"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#88888820", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="deposit"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorUp)"
          />
          <Area
            type="monotone"
            dataKey="withdrawal"
            stroke="#ef4444"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorDown)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FlowChart;
