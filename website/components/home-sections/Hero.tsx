"use client";
import { Link } from "@/i18n/navigation";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useAppSelector } from "@/lib/redux/store";
import { ArrowRight, TrendingUp, ShieldCheck, Globe } from "lucide-react";

export default function Hero() {
  const currentUser = useAppSelector(selectCurrentUser);
  return (
    <section className="relative w-full overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-32">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-up/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* 1. Content Side */}
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Borsa İstanbul Live Feed Active
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-fg leading-[0.9] uppercase">
            Trade <br />
            <span className="text-brand">Like Never</span> <br />
            Before.
          </h1>

          <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
            Hisse senetleri ve Kripto paralar tek bir platformda. Trade Turkish
            stocks with USDT, use up to 20x leverage, and manage your portfolio
            with professional tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href={currentUser?.isAuthenticated ? "/trade" : "/auth/login"}
              className="w-full sm:w-auto bg-brand text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-2"
            >
              Start Trading <ArrowRight size={18} />
            </Link>
            {/* <Link
              href="#markets"
              className="w-full sm:w-auto bg-transparent border border-slate-200 dark:border-slate-800 text-fg px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center"
            >
              View Markets
            </Link> */}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-up" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Secure Escrow
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Global & Local
              </span>
            </div>
          </div>
        </div>

        {/* 2. Visual / Ticker Card Side */}
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-brand" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase">
                    Market Snapshot
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    Live Price Updates (₺)
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-up/10 text-up text-[10px] font-black rounded-lg uppercase">
                Active
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: "THYAO", price: "284.50", change: "+2.4%", up: true },
                {
                  name: "BTC / USDT",
                  price: "64,210.00",
                  change: "+1.8%",
                  up: true,
                },
                { name: "GARAN", price: "72.15", change: "-0.5%", up: false },
                { name: "EREGL", price: "44.12", change: "+0.2%", up: true },
              ].map((coin, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <span className="text-xs font-black uppercase tracking-tight">
                    {coin.name}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black tracking-tighter">
                      {coin.price} ₺
                    </span>
                    <span
                      className={`text-[9px] font-bold ${coin.up ? "text-up" : "text-red-500"}`}
                    >
                      {coin.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtle "Dashboard" Peek Overlay */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand/20 blur-3xl rounded-full group-hover:bg-brand/30 transition-all" />
          </div>

          {/* Floaters */}
          <div className="absolute -top-10 md:-top-10 right-1/2 translate-x-1/2 md:translate-x-0 md:-right-6 bg-bg border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="h-8 w-8 bg-up/20 text-up rounded-lg flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">
                Top Gainer
              </p>
              <p className="text-[10px] font-black text-fg tracking-tight">
                ASELS +5.2%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
