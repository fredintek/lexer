"use client";
import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-up/10 flex items-center justify-center text-up">
            <CheckCircle2 size={48} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
            Check your email
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            We have sent a password reset link to your email address. Please
            follow the instructions to reset your password.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-sm font-bold text-brand hover:underline"
        >
          <ArrowLeft size={16} />
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="space-y-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-widest hover:gap-3 transition-all"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-fg uppercase mt-2">
          Forgot Password?
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Enter your email and we'll send you a link to reset your admin access.
        </p>
      </div>

      {/* 2. Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            Admin Email
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              required
              placeholder="e.g. support@bullsyatirim.com"
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer group relative flex items-center justify-center rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand/90 hover:shadow-brand/40 active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <div className="flex items-center gap-2">
              <span>Send Reset Instructions</span>
              <Send
                size={18}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
