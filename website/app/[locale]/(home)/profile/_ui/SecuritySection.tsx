import { formatDate } from "@/lib/helpers";
import {
  useActivateTotpMutation,
  useChangePasswordMutation,
  useGetLoginHistoryQuery,
  useRevokeOtherSessionsMutation,
  useToggleMfaMutation,
  useTotpSetupMutation,
} from "@/lib/redux/services/auth.api";
import { useSubmitKYCMutation } from "@/lib/redux/services/kyc.api";
import { useGetMeQuery } from "@/lib/redux/services/user.api";
import { MFAEnum } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  CircleCheckBig,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SecuritySection({
  user,
}: {
  user: Record<string, any> | null;
}) {
  const t = useTranslations();
  const isTotpActive = user?.isTwoFactorEnabled && user?.mfaMethod === "TOTP";
  const isEmailActive = user?.isTwoFactorEnabled && user?.mfaMethod === "EMAIL";
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [totp, setTotp] = useState({
    code: "",
    secret: "",
  });
  const [showCurrrentPassword, setShowCurrrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const kycStatus = user?.kyc?.status;
  const isVerified = kycStatus === "ACTIVE";
  const isPending = kycStatus === "PENDING";
  const isRejected = kycStatus === "INACTIVE";

  const [
    revokeOthers,
    { isLoading: isRevoking, isSuccess: revokeIsSuccess, error: revokeError },
  ] = useRevokeOtherSessionsMutation();
  const [
    changePassword,
    { isLoading, isSuccess: updatePassowrdSuccess, error: updatePassowrdError },
  ] = useChangePasswordMutation();
  const { data: history, refetch: refetchLoginHistory } =
    useGetLoginHistoryQuery(undefined);
  const { refetch: refetchGetMe } = useGetMeQuery(undefined);
  const [toggleMfa] = useToggleMfaMutation();
  const [setupTotp, { data: setupTotpData }] = useTotpSetupMutation();
  const [
    activateTotp,
    {
      isLoading: activateTotpLoading,
      isSuccess: activateTotpIsSuccess,
      error: activateTotpError,
    },
  ] = useActivateTotpMutation();

  const [kycFiles, setKycFiles] = useState<{
    document: File | null;
    selfie: File | null;
  }>({ document: null, selfie: null });
  const [kycData, setKycData] = useState({
    documentType: "passport",
    country: "Turkey",
  });
  const [submitKYC, { isLoading: isSubmittingKYC }] = useSubmitKYCMutation();

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
      console.error(err?.data?.message || t("FAIL_UPDATE_PASSWORD"));
    }
  };

  const handleRevokeOthers = async () => {
    if (window.confirm(t("REVOKE_CONFIRM"))) {
      try {
        await revokeOthers(undefined).unwrap();
      } catch (err: any) {
        console.error(t("FAIL_REVOKE"));
      }
    }
  };

  const handleActivateTotp = async () => {
    try {
      await activateTotp({ code: totp.code, secret: totp.secret }).unwrap();
    } catch (err: any) {
      console.error(err?.data?.message || t("FAIL_UPDATE_PASSWORD"));
    }
  };

  const handleToggle = async (
    method: "TOTP" | "EMAIL",
    currentStatus: boolean,
  ) => {
    try {
      const methodEnum = method === "TOTP" ? MFAEnum.TOTP : MFAEnum.EMAIL;
      if (currentStatus) {
        await toggleMfa({ method: methodEnum, status: false }).unwrap();
        toast.success(t("MFA_DEACTIVATED"));
      } else {
        await toggleMfa({ method: methodEnum }).unwrap();
        toast.success(`${t("MFA_SWITCHED")} ${method}`);
      }
      refetchGetMe();
    } catch (err: any) {
      const message = err?.data?.message || t("FAIL_ACTION");
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const handleKYCUpload = async () => {
    if (!kycFiles.document || !kycFiles.selfie) {
      return toast.error(t("KYC_FILE_ERROR"));
    }

    const formData = new FormData();
    formData.append("document", kycFiles.document);
    formData.append("selfie", kycFiles.selfie);
    formData.append("documentType", kycData.documentType);
    formData.append("country", kycData.country);

    try {
      await submitKYC(formData).unwrap();
      toast.success(t("KYC_SUCCESS"));
      setKycFiles({ document: null, selfie: null });
      refetchGetMe();
    } catch (err: any) {
      toast.error(err?.data?.message || t("FAIL_ACTION"));
    }
  };

  useEffect(() => {
    if (updatePassowrdSuccess) {
      toast.success(t("SAVE_CHANGES"));
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    if (revokeIsSuccess) {
      refetchLoginHistory();
      toast.success(t("REVOKE_SUCCESS"));
    }
    if (activateTotpIsSuccess) {
      refetchGetMe();
      toast.success(t("TWO_FA_ACTIVATED"));
    }
    // Shared Error Handler Logic
    const handleError = (error: any) => {
      if (error) {
        const errData = error as any;
        const message = Array.isArray(errData?.data?.message)
          ? errData?.data?.message?.join(", ")
          : errData?.data?.message || t("FAIL_ACTION");
        toast.error(message);
      }
    };
    handleError(updatePassowrdError);
    handleError(revokeError);
    handleError(activateTotpError);
  }, [
    updatePassowrdSuccess,
    updatePassowrdError,
    revokeIsSuccess,
    revokeError,
    activateTotpIsSuccess,
    activateTotpError,
    t,
  ]);

  useEffect(() => {
    if (twoFactorEnabled) setupTotp(undefined);
  }, [twoFactorEnabled]);

  useEffect(() => {
    if (setupTotpData?.secret)
      setTotp((prev) => ({ ...prev, secret: setupTotpData.secret }));
  }, [setupTotpData]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            {t("SECURITY_CENTER_TITLE")}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">
            {t("SECURITY_CENTER_SUBTITLE")}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
            {t("ACCOUNT_SAFETY")}
          </p>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full ${i < Number(user?.tier) ? "bg-up" : "bg-slate-200 dark:bg-slate-800"}`}
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase text-up mt-1">
            {t("HIGH_PROTECTION")}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Password Update */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock size={18} className="text-brand" /> {t("UPDATE_PASSWORD")}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 relative">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                  {t("CURRENT_PASSWORD")}
                </label>
                <input
                  onChange={handleInputChange}
                  name="currentPassword"
                  placeholder={t("PASSWORD_PLACEHOLDER")}
                  type={showCurrrentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrrentPassword(!showCurrrentPassword)}
                  className="absolute right-4 top-1/2 text-slate-400 hover:text-fg cursor-pointer"
                >
                  {showCurrrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                    {t("NEW_PASSWORD")}
                  </label>
                  <input
                    name="newPassword"
                    onChange={handleInputChange}
                    value={passwords.newPassword}
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t("PASSWORD_PLACEHOLDER")}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 text-slate-400 hover:text-fg cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                    {t("CONFIRM_PASSWORD")}
                  </label>
                  <input
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleInputChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("PASSWORD_PLACEHOLDER")}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 text-slate-400 hover:text-fg cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="cursor-pointer mt-6 bg-fg text-bg dark:bg-white dark:text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand transition-all disabled:opacity-50"
            >
              {isLoading ? t("UPDATING") : t("SAVE_CHANGES")}
            </button>
          </div>

          {/* 2FA Setup */}
          <div
            className={`bg-bg border rounded-4xl p-8 transition-all ${twoFactorEnabled ? "border-up/30 bg-up/5" : "border-slate-200 dark:border-slate-800"}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className={twoFactorEnabled ? "text-up" : "text-slate-400"}
                  />
                  {t("TWO_FACTOR_TITLE")}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">
                  {t("TWO_FACTOR_DESC")}
                </p>
              </div>
              {!user?.mfaSecret ? (
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!twoFactorEnabled ? "bg-up" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!twoFactorEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              ) : (
                <CircleCheckBig className="text-up" />
              )}
            </div>

            {!user?.mfaSecret && !twoFactorEnabled && (
              <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="bg-white p-3 rounded-2xl border-4 border-slate-100">
                  <div className="h-32 w-32">
                    <img
                      src={setupTotpData?.qrCodeImageUrl}
                      alt="totp-qr-code"
                      className="bg-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t("TOTP_STEP_1")}
                    <br />
                    {t("TOTP_STEP_2")}
                    <br />
                    {t("TOTP_STEP_3")}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      name="code"
                      value={totp.code}
                      type="text"
                      maxLength={6}
                      placeholder="000 000"
                      onChange={(e) =>
                        setTotp((prev) => ({
                          ...prev,
                          code: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className="w-full bg-bg border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-center text-lg font-black tracking-[0.2em] outline-none focus:border-brand"
                    />
                    <button
                      onClick={handleActivateTotp}
                      className="cursor-pointer bg-brand text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest py-3"
                    >
                      {activateTotpLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <span>{t("ACTIVATE")}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MFA Toggles */}
          <div className="space-y-4">
            <div
              className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${isTotpActive ? "border-up/30 bg-up/5" : "border-transparent bg-slate-50 dark:bg-slate-900/50"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isTotpActive ? "bg-up text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">
                    {t("AUTHENTICATOR_APP")}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase italic">
                    {t("RECOMMENDED")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("TOTP", isTotpActive)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isTotpActive ? "bg-up" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTotpActive ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            <div
              className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${isEmailActive ? "border-up/30 bg-up/5" : "border-transparent bg-slate-50 dark:bg-slate-900/50"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isEmailActive ? "bg-up text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">
                    {t("EMAIL_OTP")}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase italic">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("EMAIL", isEmailActive)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEmailActive ? "bg-up" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEmailActive ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>

          {/* KYC Section */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className={isVerified ? "text-up" : "text-brand"}
                  />
                  {t("KYC_TITLE")}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">
                  {isVerified
                    ? t("KYC_DESC_VERIFIED")
                    : t("KYC_DESC_UNVERIFIED")}
                </p>
              </div>
              {kycStatus && (
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isVerified ? "bg-up/10 text-up" : isPending ? "bg-orange-500/10 text-orange-500" : "bg-down/10 text-down"}`}
                >
                  {isVerified
                    ? t("KYC_STATUS_APPROVED")
                    : isRejected
                      ? t("KYC_STATUS_REJECTED")
                      : t("KYC_STATUS_PENDING")}
                </div>
              )}
            </div>

            {isVerified || isPending ? (
              <div className="p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center bg-slate-50/30">
                <div
                  className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-4 ${isVerified ? "bg-up text-white" : "bg-orange-500/10 text-orange-500 animate-pulse"}`}
                >
                  {isVerified ? (
                    <CheckCircle2 size={36} />
                  ) : (
                    <Clock size={36} />
                  )}
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight text-fg">
                  {isVerified
                    ? t("KYC_COMPLETE_TITLE")
                    : t("KYC_PENDING_TITLE")}
                </h4>
                <p className="max-w-xs mx-auto text-xs text-slate-500 font-medium mt-2">
                  {isVerified ? t("KYC_COMPLETE_DESC") : t("KYC_PENDING_DESC")}
                </p>
                {isPending && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase text-slate-400">
                    <Loader2 size={12} className="animate-spin" />{" "}
                    {t("AWAITING_APPROVAL")}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {isRejected && (
                  <div className="p-5 bg-down/5 border border-down/20 rounded-2xl flex gap-4 items-start">
                    <AlertCircle className="text-down shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-black uppercase text-down tracking-widest mb-1">
                        {t("VERIFICATION_REJECTED")}
                      </p>
                      <p className="text-xs font-bold text-slate-600">
                        {user?.kyc?.rejectionReason || t("SECURITY_TIP_DESC")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                      {t("DOCUMENT_TYPE")}
                    </label>
                    <select
                      value={kycData.documentType}
                      onChange={(e) =>
                        setKycData({ ...kycData, documentType: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-brand"
                    >
                      <option value="passport">{t("PASSPORT")}</option>
                      <option value="id-card">{t("ID_CARD")}</option>
                      <option value="driver-license">
                        {t("DRIVER_LICENSE")}
                      </option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                      {t("COUNTRY_ISSUE")}
                    </label>
                    <input
                      type="text"
                      value={kycData.country}
                      onChange={(e) =>
                        setKycData({ ...kycData, country: e.target.value })
                      }
                      placeholder="e.g. Turkey"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-brand"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadBox
                    label={t("DOCUMENT_PHOTO")}
                    onFileSelect={(file) =>
                      setKycFiles((prev) => ({ ...prev, document: file }))
                    }
                    file={kycFiles.document}
                  />
                  <FileUploadBox
                    label={t("SELFIE_PHOTO")}
                    onFileSelect={(file) =>
                      setKycFiles((prev) => ({ ...prev, selfie: file }))
                    }
                    file={kycFiles.selfie}
                  />
                </div>
                <button
                  onClick={handleKYCUpload}
                  disabled={
                    isSubmittingKYC || !kycFiles.document || !kycFiles.selfie
                  }
                  className="w-full bg-fg text-bg dark:bg-white dark:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand transition-all disabled:opacity-30"
                >
                  {isSubmittingKYC ? (
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  ) : (
                    t("SUBMIT_DOCUMENTS")
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">
            {t("AUTHORIZED_DEVICES")}
          </h3>
          <div className="flex flex-col gap-4">
            {history?.map((item: any) => (
              <DeviceCard key={item?.id} data={item} />
            ))}
            <button
              onClick={handleRevokeOthers}
              disabled={isRevoking}
              className="cursor-pointer w-full py-4 border border-red-500/20 text-red-500 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            >
              {isRevoking ? t("REVOKING") : t("REVOKE_ALL")}
            </button>
          </div>
          <div className="p-6 bg-brand/5 border border-brand/20 rounded-4xl space-y-3">
            <div className="flex items-center gap-2 text-brand">
              <Zap size={16} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t("SECURITY_TIP_TITLE")}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 leading-normal">
              Bulls Yatirim{" "}
              <span className="text-fg font-black underline">asla</span>{" "}
              şifrenizi istemez. Giriş yaptığınız URL'yi kontrol edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileUploadBox({
  label,
  onFileSelect,
  file,
}: {
  label: string;
  onFileSelect: (file: File) => void;
  file: File | null;
}) {
  const t = useTranslations();

  return (
    <div className="relative">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
        {label}
      </label>
      <div className="group relative h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-transparent">
        {file ? (
          <div className="absolute inset-0 bg-up/10 flex flex-col items-center justify-center animate-in zoom-in-95">
            <CheckCircle2 size={24} className="text-up mb-1" />
            <span className="text-[10px] font-bold text-up truncate max-w-[80%]">
              {file.name}
            </span>
            <button
              onClick={() => onFileSelect(null as any)}
              className="absolute top-2 right-2 p-1 bg-white dark:bg-slate-800 rounded-md shadow-sm"
            >
              <X size={12} className="text-slate-500" />
            </button>
          </div>
        ) : (
          <>
            <Upload
              size={20}
              className="text-slate-400 group-hover:text-brand mb-2"
            />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-brand">
              {t("CLICK_TO_UPLOAD")}
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) =>
            e.target.files?.[0] && onFileSelect(e.target.files[0])
          }
        />
      </div>
    </div>
  );
}

function DeviceCard({ data }: { data: any }) {
  return (
    <div
      className={`p-5 rounded-3xl border transition-all ${data?.isCurrent ? "border-brand/30 bg-brand/5" : "border-slate-200 dark:border-slate-800 bg-bg"}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-black uppercase text-fg">
            {data?.device}
          </h4>
          <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase">
            {data?.ipAddress} | {data?.os}
          </p>
          <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase">
            {data?.browser}
          </p>
        </div>
        {data?.isCurrent && (
          <div className="h-2 w-2 rounded-full bg-up animate-pulse" />
        )}
      </div>
      <div className="mt-4 flex justify-between items-end">
        <span className="text-[9px] font-black uppercase text-slate-400">
          {data?.isCurrent ? "Current Session" : formatDate(data?.loginAt)}
        </span>
      </div>
    </div>
  );
}
