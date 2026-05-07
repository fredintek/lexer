"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/nav/LanguageSwitcher";
import ThemeToggle from "@/components/nav/ThemeToggle";
import Logo from "@/components/icons/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Auth");

  return (
    <div className="flex min-h-screen bg-bg transition-colors duration-300">
      {/* 1. Left Side: Form Area */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[45%] xl:w-[40%] relative">
        <div className="absolute top-6 right-6 flex items-center gap-2 pr-1">
          <LanguageSwitcher />
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 flex items-center justify-center text-white font-bold text-lg">
              <Logo />
            </div>
            <span className="font-bold text-sm tracking-tight text-fg uppercase">
              Bulls Yatirim
            </span>
          </Link>

          {/* This is where Login / Forgot / Reset will render */}
          <div className="relative z-10">{children}</div>

          <p className="mt-10 text-center text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-600 uppercase">
            &copy; 2026 LEXER Synthetic Engine. All rights reserved.
          </p>
        </div>
      </div>

      {/* 2. Right Side: Branding */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-slate-950 lg:flex border-l border-slate-200 dark:border-slate-900">
        {/* Subtle Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "var(--bg-grid-dots)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Decorative Blurred Glows */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-brand-secondary/10 blur-[120px]" />

        <div className="relative z-10 px-12 text-center">
          <h2 className="text-4xl font-black tracking-tighter text-white mb-4 uppercase">
            The Engine of <span className="text-brand">Synthetics</span>
          </h2>
          <p className="mx-auto max-w-sm text-slate-400 font-medium">
            Access the most advanced synthetic asset management dashboard.
            Precision, speed, and algorithmic control at your fingertips.
          </p>

          {/* Synthetic Trade Indicator */}
          <div className="mt-12 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Synthetic_BIST100
              </span>
              <span className="text-xl font-black text-up tabular-nums">
                11,245.50
              </span>
            </div>
            <div className="h-10 w-24 bg-up/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
