"use client";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";
import {
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useVerifyTotpMutation,
} from "@/lib/redux/services/auth.api";
import toast from "react-hot-toast";
import { MFAEnum } from "@/lib/types";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState<{
    status: boolean;
    method: MFAEnum | null;
  }>({ status: false, method: null });
  const [userId, setUserId] = useState<string>("");

  const [login, { isLoading, error, isSuccess }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifyLoading }] =
    useVerifyLoginOtpMutation();
  const [verifyTotp, { isLoading: isVerifyTotpLoading }] =
    useVerifyTotpMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      if (res.status === "EMAIL_OTP_REQUIRED") {
        setUserId(res.userId);
        setShowMfa({ status: true, method: MFAEnum.EMAIL });
        toast.success(t("CHECK_EMAIL_CODE"));
        return;
      }

      if (res.status === "APP_OTP_REQUIRED") {
        setUserId(res.userId);
        setShowMfa({ status: true, method: MFAEnum.TOTP });
        toast.success(t("OPEN_AUTH_APP"));
        return;
      }

      toast.success(t("LOGIN_SUCCESS"));
      router.refresh();
    } catch (err: any) {
      const message = Array.isArray(err?.data?.message)
        ? err?.data?.message?.join(", ")
        : err?.data?.message || t("LOGIN_FAILED");
      console.error(message);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;

    try {
      if (showMfa.method === MFAEnum.EMAIL) {
        await verifyOtp({ userId, code, createTokens: true }).unwrap();
      }

      if (showMfa.method === MFAEnum.TOTP) {
        await verifyTotp({ userId, code, createTokens: true }).unwrap();
      }

      toast.success(t("SECURITY_VERIFIED"));
      router.refresh();
    } catch (err: any) {
      toast.error(err?.data?.message || t("LOGIN_FAILED"));
    }
  };

  useEffect(() => {
    if (error) {
      const errData = error as any;
      const message = Array.isArray(errData?.data?.message)
        ? errData?.data?.message?.join(", ")
        : errData?.data?.message || t("LOGIN_FAILED");
      toast.error(message);
    }
  }, [error, t]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-fg uppercase italic">
          {showMfa.status ? t("VERIFY_IDENTITY") : t("WELCOME_BACK")}
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {showMfa.status
            ? showMfa.method === MFAEnum.EMAIL
              ? t("MFA_EMAIL_DESC")
              : t("MFA_APP_DESC")
            : t("LOGIN_DESC")}
        </p>
      </div>

      {!showMfa.status ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              {t("EMAIL_ADDRESS")}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
                <Mail size={18} />
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="user@bullsyatirim.com"
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {t("PASSWORD")}
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-bold text-brand"
              >
                {t("FORGOT")}
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm font-medium outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 px-1">
              {t("PASSWORD_HINT")}
            </p>
            <Link
              href="/auth/register"
              className="text-xs font-bold text-brand"
            >
              {t("DONT_HAVE_ACCOUNT?")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer mt-2 group flex items-center justify-center rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              t("SIGN_IN")
            )}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleOtpSubmit}
          className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="flex flex-col gap-2 text-center py-4 bg-brand/5 rounded-2xl border border-brand/10">
            <div className="mx-auto bg-brand p-3 rounded-full text-white mb-2 shadow-lg shadow-brand/20">
              <ShieldCheck size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">
              {t("SECURITY_CODE_REQ")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
                <KeyRound size={18} />
              </div>
              <input
                autoFocus
                name="code"
                type="text"
                maxLength={6}
                required
                placeholder="000 000"
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-4 text-center text-lg font-black tracking-[0.5em] outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifyLoading || isVerifyTotpLoading}
            className="w-full cursor-pointer mt-2 bg-fg text-bg dark:bg-white dark:text-black py-3.5 rounded-xl text-sm font-bold uppercase transition-all hover:bg-brand hover:text-white disabled:opacity-50"
          >
            {isVerifyLoading || isVerifyTotpLoading
              ? t("VERIFYING")
              : t("VERIFY_CONTINUE")}
          </button>

          <button
            type="button"
            onClick={() => setShowMfa({ status: false, method: null })}
            className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-fg transition-colors"
          >
            {t("BACK_TO_PASS")}
          </button>
        </form>
      )}

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
        <p className="text-[11px] leading-relaxed text-slate-500 text-center">
          {t("SECURITY_NOTE")}
          <span className="text-brand font-bold ml-1 italic underline cursor-pointer">
            {t("SUPPORT")}
          </span>
        </p>
      </div>
    </div>
  );
}
