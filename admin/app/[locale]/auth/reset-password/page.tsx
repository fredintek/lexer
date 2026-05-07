"use client";
import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Lock, ShieldCheck, Eye, EyeOff, Save, Mail, Key } from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Submit your email, token, and new password here
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-fg uppercase">
          Reset Password
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Enter your new credentials to regain admin access.
        </p>
      </div>

      {/* 2. Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field (Read Only) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            Account Email
          </label>
          <div className="relative group opacity-70">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={"john.doe@email.com"}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900/50 pl-11 pr-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed dark:border-slate-800"
            />
          </div>
        </div>

        {/* Token Field (Read Only/Hidden-style) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            Security Token
          </label>
          <div className="relative group opacity-70">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Key size={18} />
            </div>
            <input
              type="text"
              readOnly
              placeholder="Enter Token..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900/50 pl-11 pr-4 py-3 text-sm font-mono text-slate-500 cursor-not-allowed dark:border-slate-800"
            />
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800 my-2" />

        {/* New Password */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            New Password
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-fg transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            Confirm New Password
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <ShieldCheck size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Password Requirements Checklist */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Requirements:
          </h4>
          <ul className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            {[
              "At least 8 chars",
              "One uppercase",
              "One number",
              "One symbol",
            ].map((req) => (
              <li
                key={req}
                className="flex items-center gap-2 text-[11px] font-bold text-slate-400"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer mt-2 group relative flex items-center justify-center rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand/90 hover:shadow-brand/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <div className="flex items-center gap-2">
              <span>Update Password</span>
              <Save
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
            </div>
          )}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-xs font-bold text-slate-400 hover:text-brand transition-colors"
        >
          Cancel and return to login
        </Link>
      </div>
    </div>
  );
}
