"use client";
import React from "react";
import { Layers, Zap, ShieldCheck, Percent } from "lucide-react";

const FEATURES = [
  {
    title: "Synthetic Assets",
    desc: "BIST100 hisselerinden oluşan özel sepetlerle trade yapın. (e.g., Bank-Index, Tech-Top5).",
    icon: (size: number) => <Layers size={size} className="text-brand" />,
    size: "lg:col-span-2",
    bg: "bg-brand/5",
  },
  {
    title: "20x Leverage",
    desc: "Sermayenizi 20 katına kadar güçlendirin.",
    icon: (size: number) => <Percent size={size} className="text-orange-500" />,
    size: "lg:col-span-1",
    bg: "bg-orange-500/5",
  },
  {
    title: "USDT Settlement",
    desc: "Kârınızı anında USDT olarak çekin veya hisse alın.",
    icon: (size: number) => <Zap size={size} className="text-up" />,
    size: "lg:col-span-1",
    bg: "bg-up/5",
  },
  {
    title: "Institutional Security",
    desc: "Varlıklarınız soğuk cüzdanlarda ve çok katmanlı şifreleme ile korunur.",
    icon: (size: number) => (
      <ShieldCheck size={size} className="text-blue-500" />
    ),
    size: "lg:col-span-2",
    bg: "bg-blue-500/5",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-bg relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-4">
            Next-Gen Trading
          </h2>
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-fg leading-none">
            Built for the <br />
            <span className="text-slate-400">Modern Investor.</span>
          </h3>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`${f.size} group relative overflow-hidden bg-bg border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] hover:border-brand/50 transition-all duration-500`}
            >
              {/* Icon & Content */}
              <div className="relative z-10 flex flex-col h-full">
                <div
                  className={`h-14 w-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  {f.icon(28)}
                </div>

                <h4 className="text-xl font-black uppercase tracking-tight text-fg mb-3">
                  {f.title}
                </h4>
                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-70">
                  {f.desc}
                </p>
              </div>

              {/* Decorative Background Element */}
              <div
                className={`absolute -bottom-10 -right-10 w-40 h-40 ${f.bg} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              />
            </div>
          ))}

          {/* Large Mobile Feature Card */}
          <div className="lg:col-span-3 bg-slate-900 dark:bg-white rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden relative min-h-100">
            <div className="relative z-10 text-center md:text-left">
              <h4 className="text-white dark:text-black text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
                Trade anywhere, <br /> anytime.
              </h4>
              <p className="text-slate-400 dark:text-slate-500 font-medium mb-8 max-w-xs">
                Available on Web, iOS, and Android. Switch between devices
                seamlessly.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="bg-brand text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  App Store
                </button>
                <button className="bg-slate-800 dark:bg-slate-200 text-white dark:text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  Play Store
                </button>
              </div>
            </div>

            {/* Simple UI Mockup Placeholder */}
            <div className="mt-12 md:mt-0 relative">
              <div className="w-64 h-112.5 bg-slate-800 dark:bg-slate-100 rounded-[2.5rem] border-8 border-slate-700 dark:border-slate-200 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 w-full h-full p-4 flex flex-col gap-4">
                  <div className="h-6 w-20 bg-brand/20 rounded-lg" />
                  <div className="h-32 w-full bg-slate-700 dark:bg-slate-200 rounded-2xl animate-pulse" />
                  <div className="h-4 w-full bg-slate-700 dark:bg-slate-200 rounded-lg" />
                  <div className="h-4 w-2/3 bg-slate-700 dark:bg-slate-200 rounded-lg" />
                </div>
              </div>
              {/* Floating Element */}
              <div className="absolute -left-10 top-20 bg-up text-white p-3 rounded-xl font-black text-[10px] shadow-xl rotate-[-10deg]">
                +12.4% PROFIT
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
