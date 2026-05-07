"use client";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLoginMutation } from "@/lib/redux/services/auth.api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading, error, isSuccess }] = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email,
        password,
      }).unwrap();
    } catch (err: any) {
      const msg = err?.data?.message || "Authentication failed";
      console.error(msg);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Welcome back, Commander.");
      router.refresh();
    }

    if (error) {
      const errData = error as any;
      const message = Array.isArray(errData?.data?.message)
        ? errData?.data?.message?.join(", ")
        : errData?.data?.message || "Login failed";

      toast.error(message);
    }
  }, [isSuccess, error]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-fg uppercase">
          Welcome Back
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Enter your admin credentials to access LEXER
        </p>
      </div>

      {/* 2. Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lexer.com"
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-bold text-brand hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer mt-2 group relative flex items-center justify-center rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand/90 hover:shadow-brand/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <div className="flex items-center gap-2">
              <span>Sign In to Panel</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          )}
        </button>
      </form>

      {/* 3. Footer / Help */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
        <p className="text-[11px] leading-relaxed text-slate-500 text-center">
          Security Note: Unauthorized access attempts are logged and reported to
          the system administrator.
          <span className="text-brand font-bold ml-1">Lexer v2.1.0</span>
        </p>
      </div>
    </div>
  );
}
