"use client";
import { Link } from "@/i18n/navigation";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { useAppSelector } from "@/lib/redux/store";
import { UserPlus, Wallet, BarChart4, ArrowRight } from "lucide-react";

const STEPS = [
  {
    title: "Create Account",
    desc: "Register in seconds with 2FA security. No complex paperwork to get started.",
    icon: (size: number) => <UserPlus size={size} />,
    color: "bg-blue-500",
  },
  {
    title: "Deposit Funds",
    desc: "Transfer USDT via TRC20 or use local Turkish bank transfers for instant TRY balance.",
    icon: (size: number) => <Wallet size={size} />,
    color: "bg-brand",
  },
  {
    title: "Start Trading",
    desc: "Access BIST100, Crypto, and Synthetics. Execute trades with 20x leverage.",
    icon: (size: number) => <BarChart4 size={size} />,
    color: "bg-up",
  },
];

export default function Steps() {
  const currentUser = useAppSelector(selectCurrentUser);
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-4">
            Process
          </h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-fg">
            Your journey to <br />
            <span className="text-slate-400 font-medium">
              Professional Trading.
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />

          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center group md:w-fit"
            >
              {/* Step Number & Icon */}
              <div className="cursor-pointer relative mb-8">
                <div
                  className={`h-20 w-20 rounded-4xl ${step.color} text-white flex items-center justify-center shadow-2xl shadow-${step.color.split("-")[1]}-500/20 group-hover:rotate-6 transition-transform duration-500`}
                >
                  {step.icon(32)}
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-fg text-bg rounded-full flex items-center justify-center text-[10px] font-black border-4 border-slate-50 dark:border-slate-900">
                  0{i + 1}
                </div>
              </div>

              {/* Content */}
              <h4 className="text-xl font-black uppercase tracking-tight text-fg mb-4">
                {step.title}
              </h4>
              <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-60">
                {step.desc}
              </p>

              {i < 2 && (
                <div className="md:hidden mt-8 text-slate-300">
                  <ArrowRight className="rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final CTA Button */}
        <Link
          href={currentUser?.isAuthenticated ? "/trade" : "/auth/login"}
          className="mt-20 flex justify-center"
        >
          <button className="cursor-pointer group flex items-center gap-4 bg-fg text-bg dark:bg-white dark:text-black px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-all">
            Join 10,000+ Traders
            <ArrowRight
              size={18}
              className="group-hover:translate-x-2 transition-transform"
            />
          </button>
        </Link>
      </div>
    </section>
  );
}
