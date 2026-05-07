"use client";
import React from "react";
import { AlertTriangle, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";

export default function RiskAndCTA() {
  const currentUser = useAppSelector(selectCurrentUser);
  return (
    <section className="py-24 bg-bg relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-up/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Risk Disclosure Side */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-[3rem]">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-fg">
                Risk Disclosure
              </h4>
            </div>

            <div className="space-y-4 text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed uppercase">
              <p>
                Kaldıraçlı işlem yapmak yüksek derecede risk içerir. Yatırılan
                sermayenin tamamı kaybedilebilir.
              </p>
              <p>
                Trading synthetic assets and using leverage may not be suitable
                for all investors. Please ensure you fully understand the risks
                involved before trading.
              </p>
              <p className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <ShieldCheck size={14} className="text-up" /> Verified Security
                Protocols Active
              </p>
            </div>
          </div>

          {/* Final CTA Side */}
          <div className="flex flex-col gap-8">
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-fg leading-none">
              Ready to <br />
              <span className="text-brand">Elevate</span> your <br />
              Portfolio?
            </h3>

            <p className="text-slate-500 font-medium max-w-sm">
              Join the new era of Turkish finance. Bridge the gap between BIST
              and the digital economy today.
            </p>

            {!currentUser?.isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="bg-brand text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3 group w-fit"
                >
                  Create Free Account
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
