"use client";
import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Camera,
  Save,
  AlertCircle,
  UserIcon,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import {
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from "@/lib/redux/services/user.api";
import toast from "react-hot-toast";
import { useChangePasswordMutation } from "@/lib/redux/services/auth.api";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AdminProfile() {
  const t = useTranslations();
  const currentUser = useAppSelector(selectCurrentUser);
  const router = useRouter();

  // RTK Mutations
  const [updateAvatar, { isLoading: isUploading }] = useUpdateAvatarMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [
    changePassword,
    { isLoading, isSuccess: updatePassowrdSuccess, error: updatePassowrdError },
  ] = useChangePasswordMutation();

  // Local State
  const [fullname, setFullname] = useState(currentUser?.fullname || "");
  const [phone, setPhone] = useState(currentUser?.phoneNumber || "");
  const [showPassSuccess, setShowPassSuccess] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrrentPassword, setShowCurrrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await updateAvatar(file).unwrap();
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ fullname, phoneNumber: phone }).unwrap();
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Update failed");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async () => {
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      }).unwrap();
    } catch (err: any) {
      console.error(err?.data?.message || "Failed to update password");
    }
  };

  useEffect(() => {
    if (updatePassowrdSuccess) {
      toast.success("Password Updated");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }

    if (updatePassowrdError) {
      const errData = updatePassowrdError as any;
      const message = Array.isArray(errData?.data?.message)
        ? errData?.data?.message?.join(", ")
        : errData?.data?.message || "Request failed";

      toast.error(message);
    }
  }, [updatePassowrdSuccess, updatePassowrdError]);

  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-r from-brand/40 to-transparent mix-blend-overlay" />

        <div className="absolute -bottom-10 left-8 flex items-end gap-6">
          <div className="relative">
            <div className="h-32 w-32 rounded-[2.5rem] bg-bg border-8 border-bg shadow-2xl flex items-center justify-center overflow-hidden relative group/avatar">
              {currentUser?.avatar?.url ? (
                <img
                  src={currentUser?.avatar?.url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon size={56} className="text-slate-200" />
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="text-white animate-spin" />
                </div>
              )}

              <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-[10px] font-black text-white uppercase">
                  {isUploading ? t("UPLOADING") : t("UPDATE_AVATAR")}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
              {currentUser?.fullname}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="text-[10px] font-black bg-brand text-white px-2 py-0.5 rounded-md uppercase tracking-widest">
                {currentUser?.role?.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                ID: {currentUser?.tag}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Account Identity Card */}
        <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <User size={16} className="text-brand" /> {t("ACCOUNT_IDENTITY")}
          </h2>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                {t("OFFICIAL_EMAIL")}
              </label>
              <input
                type="email"
                value={currentUser?.email || ""}
                disabled
                className="cursor-not-allowed opacity-65 w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                {t("FULL_NAME")}
              </label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                {t("PHONE")}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 ..."
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand transition-all"
              />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-brand text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-brand/20 hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
            >
              {isUpdating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {t("UPDATE_PROFILE")}
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Lock size={16} className="text-orange-500" />{" "}
              {t("SECURITY_CREDENTIALS")}
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="relative flex flex-col gap-2 col-span-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">
                  {t("CURRENT_PASSWORD")}
                </label>
                <input
                  onChange={handleInputChange}
                  name="currentPassword"
                  placeholder="••••••••"
                  type={showCurrrentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-brand transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrrentPassword(!showCurrrentPassword)}
                  className="absolute right-4 top-1/2 text-slate-400 hover:text-fg transition-colors cursor-pointer"
                >
                  {showCurrrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <div className="relative flex flex-col gap-2 col-span-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">
                  {t("NEW_PASSWORD")}
                </label>
                <input
                  name="newPassword"
                  onChange={handleInputChange}
                  value={passwords.newPassword}
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t("PASSWORD_MIN_CHARS")}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-brand transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 text-slate-400 hover:text-fg transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative flex flex-col gap-2 col-span-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">
                  {t("CONFIRM_NEW_PASSWORD")}
                </label>
                <input
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  placeholder={t("PASSWORD_MATCH_NEW")}
                  onChange={handleInputChange}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-brand transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 text-slate-400 hover:text-fg transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
              <AlertCircle
                size={18}
                className="text-orange-500 shrink-0 mt-0.5"
              />
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {t("PASSWORD_CHANGE_NOTICE")}
              </p>
            </div>

            <button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="w-full md:w-fit px-8 py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all cursor-pointer"
            >
              {isLoading ? t("SAVING") : t("SAVE_CHANGES")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
