"use client";
import React from "react";
import { Users, Globe2, ShieldCheck, Zap } from "lucide-react";

const STATS = [
  { label: "Active Traders", value: "24K+", icon: <Users size={20} /> },
  { label: "24h Volume", value: "₺1.2B+", icon: <Zap size={20} /> },
  { label: "Uptime", value: "99.9%", icon: <ShieldCheck size={20} /> },
  { label: "Countries", value: "12+", icon: <Globe2 size={20} /> },
];

export default function Stats() {
  return (
    <section className="py-20 bg-bg border-y border-slate-100 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center lg:text-left gap-2"
            >
              <div className="text-brand mb-2 bg-brand/5 p-3 rounded-2xl">
                {stat.icon}
              </div>
              <h4 className="text-3xl md:text-4xl font-black tracking-tighter text-fg italic uppercase">
                {stat.value}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Integration / Partner Logo Bar */}
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800/50">
          <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">
            Powered by industry leaders & Local Banks
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Text-based logos for now, or replace with SVGs */}
            <span className="text-xl font-black tracking-tighter uppercase text-fg">
              Binance
            </span>
            <span className="text-xl font-black tracking-tighter uppercase text-fg">
              Ziraat
            </span>
            <span className="text-xl font-black tracking-tighter uppercase text-fg">
              VakıfBank
            </span>
            <span className="text-xl font-black tracking-tighter uppercase text-fg">
              TradingView
            </span>
            <span className="text-xl font-black tracking-tighter uppercase text-fg">
              Fireblocks
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
