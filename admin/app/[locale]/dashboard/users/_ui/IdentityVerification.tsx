"use client";
import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ZoomIn,
  FileText,
  UserCheck,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetUserDetailsQuery } from "@/lib/redux/services/user.api";
import StatusBadge from "@/components/StatusBadge";
import toast from "react-hot-toast";
import {
  useAdminUpdateKycMutation,
  useUpdateKYCStatusMutation,
} from "@/lib/redux/services/kyc.api";
import { useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";

interface Props {
  userId: string;
}

export default function IdentityVerification({ userId }: Props) {
  const currentUser = useAppSelector(selectCurrentUser);
  const t = useTranslations();
  const { data: user, isLoading } = useGetUserDetailsQuery(userId as string);
  const [updateKyc, { isLoading: isUpdating }] = useUpdateKYCStatusMutation();
  const [adminUpdateKyc, { isLoading: isAdminUpdateKyc }] =
    useAdminUpdateKycMutation();

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const kyc = user?.kyc;

  const kycFrontImg = kyc?.front?.url
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${kyc?.front?.url}`
    : null;
  const kycBackImg = kyc?.back?.url
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${kyc?.back?.url}`
    : null;

  const handleStatusUpdate = async (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectReason) {
      toast.error(t("PLEASE_PROVIDE_REASON"));
      return;
    }

    try {
      await updateKyc({
        id: kyc?.id,
        status,
        rejectionReason: status === "REJECTED" ? rejectReason : "",
        adminId: currentUser?.id,
      }).unwrap();
      toast.success(t("KYC_UPDATED_SUCCESSFULLY"));
      setShowRejectInput(false);
    } catch (error) {
      toast.error(t("UPDATE_FAILED"));
    }
  };

  const handleAdminUpdateKyc = async (status: string) => {
    try {
      await adminUpdateKyc(userId).unwrap();
      toast.success(t("KYC_UPDATED_SUCCESSFULLY"));
    } catch (error) {
      toast.error(t("UPDATE_FAILED"));
    }
  };

  if (isLoading)
    return (
      <div className="p-10 animate-pulse text-center">{t("LOADING")}...</div>
    );

  if (!kyc) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <AlertCircle size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-fg">{t("NO_KYC_SUBMITTED")}</h3>
          <p className="text-sm text-slate-500">
            {t("USER_HAS_NOT_UPLOADED_DOCUMENTS")}
          </p>
        </div>
        <button
          onClick={() => handleAdminUpdateKyc("APPROVE")}
          disabled={isAdminUpdateKyc}
          className={`w-fit disabled:opacity-70 py-2 px-5 rounded-xl flex items-center justify-center text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer bg-brand text-white`}
        >
          {isAdminUpdateKyc ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <p>{t("APPROVE")}</p>
          )}
        </button>
      </div>
    );
  }

  const documents = [
    { label: t("FRONT_SIDE"), url: kycFrontImg },
    { label: t("BACK_SIDE"), url: kycBackImg },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* --- Left: Document Gallery --- */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 overflow-hidden"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                {doc.label}
              </p>
              <div
                className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-zoom-in relative"
                onClick={() => setSelectedImg(doc.url)}
              >
                {doc.url ? (
                  <img
                    src={doc.url}
                    alt={doc.label}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <FileText size={24} />
                    <span className="text-xs font-bold">
                      {t("MISSING_DOCUMENT")}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Right: Verification Actions --- */}
      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-tight text-brand flex items-center gap-2">
              <UserCheck size={18} /> {t("VERIFICATION_DECISION")}
            </h3>
            <StatusBadge status={kyc.status} />
          </div>

          <div className="flex flex-col gap-3">
            {!showRejectInput ? (
              <>
                <button
                  onClick={() => handleStatusUpdate("APPROVED")}
                  disabled={isUpdating || kyc.status === "APPROVED"}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle size={18} /> {t("APPROVE_DOCUMENT")}
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isUpdating || kyc.status === "REJECTED"}
                  className="disabled:opacity-50 w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <XCircle size={18} /> {t("REJECT_DOCUMENT")}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("REJECTION_REASON")}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t("REASON_PLACEHOLDER")}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 ring-rose-500/20 h-32 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase"
                  >
                    {t("CANCEL")}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("REJECTED")}
                    className="cursor-pointer flex-2 py-3 bg-rose-500 text-white rounded-xl font-black uppercase text-xs"
                  >
                    {t("CONFIRM_REJECTION")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Fullscreen Lightbox --- */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-999 bg-black/90 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <img
            src={selectedImg}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <XCircle size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
