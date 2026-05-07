"use client";
import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useUpdateUserMutation } from "@/lib/redux/services/user.api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/helpers";

export default function PersonalInfoTab({ user }: { user: any }) {
  const t = useTranslations();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [formData, setFormData] = useState({
    fullname: user.fullname,
    email: user.email,
    phoneNumber: user.phoneNumber,
    tier: user.tier || 1,
    pushEnabled: user.pushEnabled,
    emailEnabled: user.emailEnabled,
    status: user.status,
    balance: user.balance,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateUser({ id, data: formData }).unwrap();
      toast.success("User profile updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
          {t("PERSONAL_INFO_GUIDE")}
        </h3>
        <button
          onClick={() => handleUpdate(user.id)}
          disabled={isUpdating}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isUpdating ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          {t("SAVE")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
              {t("FULLNAME")}
            </label>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
              {t("EMAIL_ADDRESS")}
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
              {t("USER_TIER_LEVEL")}
            </label>
            <select
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand appearance-none"
            >
              {[1, 2, 3].map((ti) => (
                <option key={ti} value={ti}>
                  {t("TIER")} {ti}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
              {t("STATUS")}
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand appearance-none"
            >
              {["ACTIVE", "SUSPENDED", "PENDING", "DEACTIVATED"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
              {t("UNIQUE_TAG")}
            </label>
            <input
              value={user.tag}
              readOnly
              className="w-full px-5 py-4 bg-slate-200 dark:bg-slate-800 border-none rounded-2xl text-sm font-black text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
              {t("PHONE_NUMBER")}
            </label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber ?? ""}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
              {t("USER_BALANCE")}
            </label>
            <input
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand"
            />
          </div>

          {/* Communication Settings (from your entity) */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">
              {t("NOTIFICATION_OVERIDES")}
            </label>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-fg">
                {t("PUSH_NOTIFICATION")}
              </span>
              <input
                type="checkbox"
                name="pushEnabled"
                checked={formData.pushEnabled}
                onChange={handleChange}
                className="w-4 h-4 accent-brand"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-fg">
                {t("EMAIL_COMMUNICATION")}
              </span>
              <input
                type="checkbox"
                name="emailEnabled"
                checked={formData.emailEnabled}
                onChange={handleChange}
                className="w-4 h-4 accent-brand"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
