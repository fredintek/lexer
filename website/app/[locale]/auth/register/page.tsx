"use client";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  IdCard,
} from "lucide-react";
import { useRegisterMutation } from "@/lib/redux/services/auth.api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Extract Data
    const formData = new FormData(e.currentTarget);
    const { fullname, email, identificationNumber, password, confirmPassword } =
      Object.fromEntries(formData.entries()) as Record<string, string>;

    // 2. Check for Empty Fields (Basic validation)
    if (
      !fullname ||
      !email ||
      !identificationNumber ||
      !password ||
      !confirmPassword
    ) {
      toast.error(
        t("ALL_FIELDS_REQUIRED_WARNING") || "Please fill in all fields",
      );
      return;
    }

    // 3. Specific Identity Number Check
    if (identificationNumber.length !== 11) {
      toast.error(
        t("INVALID_ID_NUMBER") || "Identity number must be 11 digits",
      );
      return;
    }

    // 4. Password Match Check
    if (password !== confirmPassword) {
      toast.error(t("PASSWORDS_DO_NOT_MATCH") || "Passwords do not match");
      return;
    }

    // 5. Terms Agreement Check
    if (!agreed) {
      toast.error(t("PLEASE_AGREE_TO_TERMS") || "Please agree to the terms");
      return;
    }

    // 6. Proceed to Registration
    try {
      await register({
        fullname,
        email,
        identificationNumber,
        password,
        confirmPassword,
      }).unwrap();

      toast.success(
        t("REGISTRATION_SUCCESS") || "Account created successfully!",
      );
    } catch (err: any) {
      toast.error(err?.data?.message || t("REGISTRATION_FAILED"));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("SUCCESS_TOAST"));
      router.refresh();
    }

    if (error) {
      const errData = error as any;
      const message = Array.isArray(errData?.data?.message)
        ? errData?.data?.message?.join(", ")
        : errData?.data?.message || t("ERROR_DEFAULT");

      toast.error(message);
    }
  }, [isSuccess, error, t]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-fg uppercase italic">
          {t("REGISTER_TITLE")}
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {t("REGISTER_SUBTITLE")}{" "}
          <span className="text-brand font-bold">Bulls Yatirim</span>
        </p>
      </div>

      {/* 2. Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            {t("FULL_NAME_LABEL")}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <UserIcon size={18} />
            </div>
            <input
              name="fullname"
              type="text"
              required
              placeholder={t("FULL_NAME_PLACEHOLDER")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            {t("EMAIL_LABEL")}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <Mail size={18} />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder={t("EMAIL_PLACEHOLDER")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Identity Number */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            {t("TC_ID_NO")}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <IdCard size={18} />
            </div>
            <input
              name="identificationNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              maxLength={11}
              minLength={11}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(
                  /[^0-9]/g,
                  "",
                );
              }}
              placeholder={t("TC_ID_NO_PLACEHOLDER")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            {t("PASSWORD_LABEL")}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <Lock size={18} />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder={t("PASSWORD_PLACEHOLDER")}
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
          <p className="text-[11px] text-slate-400 px-1">
            {t("PASSWORD_HINT")}
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
            {t("CONFIRM_PASSWORD_LABEL")}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
              <Lock size={18} />
            </div>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder={t("PASSWORD_PLACEHOLDER")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-sm font-medium outline-none ring-brand/20 transition-all focus:border-brand focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-fg transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start gap-3 px-1 mt-1">
          <div className="relative flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
            />
          </div>
          <label
            htmlFor="terms"
            className="text-[11px] font-medium text-slate-500 leading-tight"
          >
            {t("AGREEMENT_PREFIX")}{" "}
            <Link
              href="/terms"
              className="text-brand font-bold hover:underline"
            >
              {t("TERMS_LINK")}
            </Link>{" "}
            {t("AGREEMENT_AND")}{" "}
            <Link
              href="/privacy"
              className="text-brand font-bold hover:underline"
            >
              {t("PRIVACY_LINK")}
            </Link>
            .
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !agreed}
          className="w-full cursor-pointer mt-2 group relative flex items-center justify-center rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand/90 hover:shadow-brand/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <div className="flex items-center gap-2">
              <span>{t("SUBMIT_BUTTON")}</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          )}
        </button>
      </form>

      {/* 3. Redirect to Login */}
      <div className="text-center">
        <p className="text-xs font-medium text-slate-500">
          {t("ALREADY_HAVE_ACCOUNT")}{" "}
          <Link
            href="/auth/login"
            className="text-brand font-black uppercase tracking-tight hover:underline"
          >
            {t("SIGN_IN_LINK")}
          </Link>
        </p>
      </div>

      {/* 4. Pro Security Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <ShieldCheck className="text-brand shrink-0" size={20} />
        <p className="text-[10px] leading-tight text-slate-500 font-bold uppercase tracking-tight">
          {t("SECURITY_NOTICE")} {t("AUTO_TAG_NOTICE")}:{" "}
          <span className="text-brand">BULLS-PRO</span>
        </p>
      </div>
    </div>
  );
}
