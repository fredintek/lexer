import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  title: string;
  value: string;
  change: string;
  isUp?: boolean | null;
  icon: LucideIcon;
};

const StatusCard = ({ title, value, change, isUp, icon: Icon }: Props) => {
  return (
    <div className="cursor-pointer rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
          <Icon size={20} />
        </div>
        {isUp !== null && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
              isUp ? "bg-up/10 text-up" : "bg-down/10 text-down"
            }`}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h2 className="text-2xl font-black tracking-tight text-fg tabular-nums">
          {value}
        </h2>
      </div>
    </div>
  );
};

export default StatusCard;
