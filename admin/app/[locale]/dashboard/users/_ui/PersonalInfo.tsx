"use client";
import React, { useState, useEffect } from "react";
import {
  Save,
  User,
  Shield,
  Phone,
  Mail,
  Fingerprint,
  Bell,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "@/lib/redux/services/user.api";
import toast from "react-hot-toast";
import { useGetRolesQuery } from "@/lib/redux/services/role.api";

interface PersonalInfoProps {
  userId: string;
}

export default function PersonalInfo({ userId }: PersonalInfoProps) {
  const t = useTranslations();
  const { data: user, isLoading } = useGetUserDetailsQuery(userId);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const { data: roles } = useGetRolesQuery(undefined);

  // Local state for the form
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        balance: user.balance,
        tier: user.tier,
        pushEnabled: user.pushEnabled,
        emailEnabled: user.emailEnabled,
        roleId: user.role?.id,
        status: user.status,
        identificationNumber: user.identificationNumber || "",
        frozenBalance: user.frozenBalance,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    try {
      await updateUser({ id: userId, data: formData }).unwrap();
      toast.success(t("USER_UPDATED_SUCCESSFULLY"));
    } catch (error) {
      toast.error(t("UPDATE_FAILED"));
    }
  };

  if (isLoading)
    return (
      <div className="p-8 animate-pulse text-center">{t("LOADING")}...</div>
    );

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 ring-brand/10 transition-all";
  const labelClass =
    "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-2";
  const sectionClass =
    "bg-bg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6";

  return (
    <div className="flex flex-col gap-6">
      {/* --- Section 1: Basic Information --- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-brand font-black uppercase tracking-tight text-sm">
          <User size={18} /> {t("BASIC_ACCOUNT_DETAILS")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Mail size={12} /> {t("EMAIL_ADDRESS")}
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              <User size={12} /> {t("FULL_NAME")}
            </label>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              <Phone size={12} /> {t("PHONE_NUMBER")}
            </label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              <Fingerprint size={12} /> {t("ID_NUMBER")}
            </label>
            <input
              name="identificationNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.identificationNumber}
              onChange={handleChange}
              className={inputClass}
              maxLength={11}
              minLength={11}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(
                  /[^0-9]/g,
                  "",
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* --- Section 2: Role & Status --- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-brand font-black uppercase tracking-tight text-sm">
          <Shield size={18} /> {t("ACCESS_CONTROL")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t("ACCOUNT_STATUS")}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("USER_TIER")}</label>
            <input
              type="number"
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className={inputClass}
              min={1}
              max={3}
            />
          </div>
          <div>
            <label className={labelClass}>{t("USER_ROLE")}</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className={inputClass}
            >
              {roles?.map((role: any) => (
                <option value={role?.id}>{role?.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- Section 3: Financial Control --- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-brand font-black uppercase tracking-tight text-sm">
          <Wallet size={18} /> {t("FINANCIAL_ADJUSTMENT")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("AVAILABLE_BALANCE")} (₺)</label>
            <input
              type="number"
              name="balance"
              step="0.01"
              value={formData.balance}
              onChange={handleChange}
              className={`${inputClass} font-mono text-emerald-600 dark:text-emerald-400 font-bold`}
            />
          </div>
          <div>
            <label className={labelClass}>{t("FROZEN_BALANCE")} (₺)</label>
            <input
              type="number"
              name="frozenBalance"
              step="0.01"
              value={formData.frozenBalance}
              onChange={handleChange}
              className={`${inputClass} font-mono text-rose-600 dark:text-rose-400 font-bold`}
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 italic">
          * {t("BALANCE_UPDATE_WARNING")}
        </p>
      </div>

      {/* --- Section 4: Preferences & Security --- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-brand font-black uppercase tracking-tight text-sm">
          <Bell size={18} /> {t("PREFERENCES_AND_SECURITY")}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("TWO_FACTOR_AUTH")}
            </span>
            <input
              type="checkbox"
              name="isTwoFactorEnabled"
              checked={formData.isTwoFactorEnabled}
              onChange={handleChange}
              className="w-5 h-5 accent-brand cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("PUSH_NOTIFICATIONS")}
            </span>
            <input
              type="checkbox"
              name="pushEnabled"
              checked={formData.pushEnabled}
              onChange={handleChange}
              className="w-5 h-5 accent-brand cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("EMAIL_NOTIFICATIONS")}
            </span>
            <input
              type="checkbox"
              name="emailEnabled"
              checked={formData.emailEnabled}
              onChange={handleChange}
              className="w-5 h-5 accent-brand cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* --- Sticky Save Button --- */}
      <div className="sticky bottom-6 flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isUpdating ? (
            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <Save size={18} />
          )}
          {t("SAVE_CHANGES")}
        </button>
      </div>
    </div>
  );
}
