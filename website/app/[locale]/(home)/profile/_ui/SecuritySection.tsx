import { formatDate } from "@/lib/helpers";
import {
  useActivateTotpMutation,
  useChangePasswordMutation,
  useGetLoginHistoryQuery,
  useRequestEmailOtpMutation,
  useRevokeOtherSessionsMutation,
  useToggleMfaMutation,
  useTotpSetupMutation,
  useVerifyEmailOtpMutation,
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
  Info,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
  Smartphone,
  ToggleLeft,
  ToggleRight,
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
  const isEmailActive =
    user?.isEmailVerified &&
    user?.isTwoFactorEnabled &&
    user?.mfaMethod === "EMAIL";
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

  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");

  const kycStatus = user?.kyc?.status;
  const isVerified = kycStatus === "APPROVED";
  const isPending = kycStatus === "PENDING";
  const isRejected = kycStatus === "REJECTED";

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
  const [requestEmailOtp, { isLoading: isRequestingEmailOtp }] =
    useRequestEmailOtpMutation();
  const [verifyEmailOtp, { isLoading: isVerifyingEmailOtp }] =
    useVerifyEmailOtpMutation();

  const [kycFiles, setKycFiles] = useState<{
    front: File | null;
    back: File | null;
  }>({ front: null, back: null });
  const [kycData, setKycData] = useState({
    documentType: "id-card",
    country: "Turkey",
  });
  const [submitKYC, { isLoading: isSubmittingKYC }] = useSubmitKYCMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSendVerificationEmail = async () => {
    try {
      await requestEmailOtp({}).unwrap();
      setOtpSent(true);
      toast.success(t("CHECK_YOUR_EMAIL"));
    } catch (err) {
      toast.error(t("ERROR_SENDING_OTP"));
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      await verifyEmailOtp({ code: emailOtp });
      toast.success(t("EMAIL_VERIFIED_SUCCESS"));
      setOtpSent(false);
      setEmailOtp("");
    } catch (err) {
      toast.error(t("INVALID_OTP"));
    }
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
    if (!kycFiles.front || !kycFiles.back) {
      return toast.error(t("KYC_FILE_ERROR"));
    }

    const formData = new FormData();
    formData.append("front", kycFiles.front);
    formData.append("back", kycFiles.back);
    formData.append("documentType", kycData.documentType);
    formData.append("country", kycData.country);

    try {
      await submitKYC(formData).unwrap();
      toast.success(t("KYC_SUCCESS"));
      setKycFiles({ front: null, back: null });
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

  const inputClass =
    "text-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-md outline-none transition-all";

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
                  className={`${inputClass} text-left`}
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
                    className={`${inputClass} text-left`}
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
                    className={`${inputClass} text-left`}
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

          {/* Email Verification */}
          <div
            className={`bg-bg border rounded-4xl p-8 transition-all ${
              user?.isEmailVerified
                ? "border-up/30 bg-up/5"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <MailCheck
                    size={18}
                    className={user?.isEmailVerified ? "text-up" : "text-brand"}
                  />
                  {t("EMAIL_VERIFICATION_TITLE")}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">
                  {user?.isEmailVerified
                    ? t("EMAIL_VERIFICATION_DESC_VERIFIED")
                    : t("EMAIL_VERIFICATION_DESC_UNVERIFIED")}
                </p>
              </div>
              {user?.isEmailVerified && (
                <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-up/10 text-up">
                  {t("VERIFIED")}
                </div>
              )}
            </div>

            {user?.isEmailVerified ? (
              /* Verified state */
              <div className="flex items-center gap-3 bg-up/10 border border-up/20 p-4 rounded-2xl">
                <div className="bg-up text-white p-2 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-up">
                    {t("EMAIL_VERIFIED")}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : otpSent ? (
              /* OTP input state */
              <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-brand/20 animate-in zoom-in-95">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-brand">
                    {t("CHECK_YOUR_EMAIL")}
                  </p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t("OTP_SENT_TO")}{" "}
                    <span className="text-fg">{user?.email}</span>
                  </p>
                </div>
                <div className="flex gap-2 flex-col">
                  <input
                    value={emailOtp}
                    onChange={(e) =>
                      setEmailOtp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className={inputClass}
                  />
                  <button
                    onClick={handleVerifyEmailOtp}
                    disabled={emailOtp.length !== 6 || isVerifyingEmailOtp}
                    className="cursor-pointer bg-brand text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase hover:opacity-90 disabled:opacity-30 transition-all"
                  >
                    {isVerifyingEmailOtp ? (
                      <Loader2 className="animate-spin mx-auto" size={18} />
                    ) : (
                      t("VERIFY")
                    )}
                  </button>
                  {isRequestingEmailOtp ? (
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  ) : (
                    <button
                      onClick={handleSendVerificationEmail}
                      disabled={isRequestingEmailOtp}
                      className="cursor-pointer text-[10px] font-black uppercase text-slate-400 hover:text-brand transition-colors text-center mt-1"
                    >
                      {t("RESEND_CODE")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Send OTP state */
              <button
                onClick={handleSendVerificationEmail}
                disabled={isRequestingEmailOtp}
                className="cursor-pointer bg-fg text-bg dark:bg-white dark:text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand transition-all disabled:opacity-50"
              >
                {isRequestingEmailOtp ? (
                  <Loader2 className="animate-spin mx-auto" size={18} />
                ) : (
                  t("SEND_VERIFICATION_EMAIL")
                )}
              </button>
            )}
          </div>

          {/* 2FA Setup Container */}
          {!user?.mfaSecret && (
            <>
              <div
                className={`bg-bg border rounded-4xl p-8 transition-all ${user?.isTwoFactorEnabled ? "border-up/30 bg-up/5" : "border-slate-200 dark:border-slate-800"}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck
                        size={18}
                        className={
                          user?.isTwoFactorEnabled ? "text-up" : "text-brand"
                        }
                      />
                      {t("TWO_FACTOR_TITLE")}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium italic">
                      {t("TWO_FACTOR_DESC")}
                    </p>
                  </div>

                  {/* Main Toggle: Only shows if 2FA is NOT active */}
                  {!user?.isTwoFactorEnabled && (
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className="cursor-pointer group outline-none focus:ring-0"
                      aria-label="Toggle 2FA Setup"
                    >
                      <div className="flex items-center gap-2">
                        {twoFactorEnabled ? (
                          <ToggleRight
                            size={32}
                            className="text-brand transition-all duration-300 ease-in-out transform group-hover:scale-110"
                            fill="currentColor"
                            fillOpacity={0.1}
                          />
                        ) : (
                          <ToggleLeft
                            size={32}
                            className="text-slate-300 dark:text-slate-600 transition-all duration-300 ease-in-out transform group-hover:scale-110"
                          />
                        )}
                      </div>
                    </button>
                  )}
                </div>

                {/* SETUP FLOW: Only show if user hasn't finished activation */}
                {!user?.isTwoFactorEnabled &&
                  twoFactorEnabled &&
                  setupTotpData && (
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-brand/20 animate-in zoom-in-95">
                      <div className="bg-bg p-3 rounded-2xl shrink-0">
                        <img
                          src={setupTotpData.qrCodeImageUrl}
                          alt="QR"
                          className="h-32 w-32"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-brand">
                            {t("STEP_VERIFY")}
                          </p>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t("TOTP_INSTRUCTION")}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-col">
                          <input
                            value={totp.code}
                            onChange={(e) =>
                              setTotp({
                                ...totp,
                                code: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            placeholder="000000"
                            maxLength={6}
                            className={inputClass}
                          />
                          <button
                            onClick={handleActivateTotp}
                            disabled={
                              totp.code.length !== 6 || activateTotpLoading
                            }
                            className="cursor-pointer bg-brand text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase hover:opacity-90 disabled:opacity-30 transition-all"
                          >
                            {activateTotpLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              t("VERIFY")
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ACTIVE STATE */}
                {user?.isTwoFactorEnabled && (
                  <div className="flex items-center justify-between bg-up/10 border border-up/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-up text-white p-2 rounded-lg">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-up">
                          {t("MFA_ACTIVE")}
                        </p>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {user.mfaMethod}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(user.mfaMethod, true)}
                      className="text-[10px] font-black uppercase text-slate-400 hover:text-down transition-colors cursor-pointer"
                    >
                      {t("DEACTIVATE")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

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
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    isVerified
                      ? "bg-up/10 text-up"
                      : isPending
                        ? "bg-orange-500/10 text-orange-500"
                        : "bg-down/10 text-down"
                  }`}
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
              <div className="p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center bg-bg">
                <div
                  className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-4 ${
                    isVerified
                      ? "bg-up text-white"
                      : "bg-orange-500/10 text-orange-500 animate-pulse"
                  }`}
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
                {/* Instruction Checklist */}
                <div className="p-4 bg-brand/5 rounded-2xl border border-brand/10">
                  <h5 className="text-[10px] font-black uppercase text-brand mb-2 flex items-center gap-2">
                    <Info size={14} /> {t("KYC_REQUIREMENTS")}
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      t("REQ_FULL_NAME"),
                      t("REQ_CLEAR_TEXT"),
                      t("REQ_NO_GLARE"),
                      t("REQ_EXPIRY_DATE"),
                    ].map((req, i) => (
                      <li
                        key={i}
                        className="text-[10px] font-bold text-slate-500 flex items-center gap-2"
                      >
                        <div className="w-1 h-1 rounded-full bg-brand" /> {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {isRejected && (
                  <div className="p-5 bg-down/5 border border-down/20 rounded-2xl flex gap-4 items-start animate-in fade-in zoom-in-95">
                    <AlertCircle className="text-down shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-black uppercase text-down tracking-widest mb-1">
                        {t("VERIFICATION_REJECTED")}
                      </p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
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
                    <input
                      type="text"
                      value={t("TC_ID_NO")}
                      disabled
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm outline-none focus:border-brand"
                    />
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
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadBox
                    label={t("FRONT_SIDE")}
                    onFileSelect={(file) =>
                      setKycFiles((prev) => ({ ...prev, front: file }))
                    }
                    file={kycFiles.front}
                  />
                  <FileUploadBox
                    label={t("BACK_SIDE")}
                    onFileSelect={(file) =>
                      setKycFiles((prev) => ({ ...prev, back: file }))
                    }
                    file={kycFiles.back}
                  />
                </div>

                <button
                  onClick={handleKYCUpload}
                  disabled={
                    isSubmittingKYC || !kycFiles.front || !kycFiles.back
                  }
                  className="w-full bg-fg text-bg dark:bg-white dark:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand hover:text-white transition-all disabled:opacity-30 cursor-pointer shadow-xl shadow-brand/10"
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
  onFileSelect: (file: File | null) => void;
  file: File | null;
}) {
  const t = useTranslations();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
        {label}
      </label>
      <div className="group relative h-44 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
        {preview ? (
          <div className="absolute inset-0 animate-in fade-in duration-300">
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFileSelect(null);
                }}
                className="bg-down text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                {t("REMOVE")}
              </button>
            </div>
            <div className="absolute bottom-3 left-3 bg-up text-white p-1.5 rounded-lg shadow-lg">
              <CheckCircle2 size={14} />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Upload
                size={24}
                className="text-slate-400 group-hover:text-brand"
              />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-brand text-center px-6">
              {t("CLICK_TO_UPLOAD")}
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            e.target.files?.[0] && onFileSelect(e.target.files[0]);
          }}
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
