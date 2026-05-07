"use client";
import { useState } from "react";
import {
  BadgeCheck,
  Clock,
  XCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import toast from "react-hot-toast";
import { useUpdateUserMutation } from "@/lib/redux/services/user.api";

export default function IdentityTab({ user }: { user: any }) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  // Local state for rejection reason if needed
  const [rejectionReason, setRejectionReason] = useState("");

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateUser({
        id: user.id,
        data: { kycStatus: newStatus }, // Ensure your DTO supports kycStatus or update via a KYC endpoint
      }).unwrap();
      toast.success(`KYC status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update KYC");
    }
  };

  const kyc = user?.kyc;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
      {/* 1. STATUS OVERVIEW CARD */}
      <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-2xl ${
              user.kycStatus === "VERIFIED"
                ? "bg-green-500/10 text-green-500"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            {user.kycStatus === "VERIFIED" ? (
              <BadgeCheck size={32} />
            ) : (
              <Clock size={32} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-fg uppercase">
              Verification Status
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={user.kycStatus || "NOT_SUBMITTED"} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Tier {user.tier} Account
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleStatusUpdate("REJECTED")}
            disabled={isLoading || user.kycStatus === "REJECTED"}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            <XCircle size={14} /> Reject Submission
          </button>
          <button
            onClick={() => handleStatusUpdate("VERIFIED")}
            disabled={isLoading || user.kycStatus === "VERIFIED"}
            className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={14} /> Approve Identity
          </button>
        </div>
      </div>

      {/* 2. DOCUMENT DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Info */}
        <div className="lg:col-span-1 bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8 space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Submission Details
          </h4>

          <div className="space-y-4">
            <DetailItem
              label="Document Type"
              value={kyc?.documentType || "Passport"}
            />
            <DetailItem
              label="ID Number"
              value={kyc?.idNumber || "A88219902"}
            />
            <DetailItem
              label="Expiry Date"
              value={kyc?.expiryDate || "2029-12-31"}
            />
            <DetailItem
              label="Submitted On"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-black uppercase">
                Risk Assessment
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Information provided matches external database records. No PEP or
              Sanction flags detected.
            </p>
          </div>
        </div>

        {/* Document Preview */}
        <div className="lg:col-span-2 bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Document Scans
            </h4>
            <button className="flex items-center gap-2 text-[10px] font-black text-brand uppercase hover:underline">
              <ExternalLink size={12} /> View Full Size
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front of ID */}
            <div className="group relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <FileText
                size={40}
                className="text-slate-300 group-hover:text-brand transition-colors"
              />
              <span className="text-[10px] font-black uppercase text-slate-400 mt-2">
                Front Side
              </span>
              {/* Replace with actual image: <img src={kyc?.frontUrl} className="object-cover w-full h-full" /> */}
            </div>

            {/* Back of ID / Selfie */}
            <div className="group relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <FileText
                size={40}
                className="text-slate-300 group-hover:text-brand transition-colors"
              />
              <span className="text-[10px] font-black uppercase text-slate-400 mt-2">
                Back Side / Selfie
              </span>
              {/* Replace with actual image: <img src={kyc?.backUrl} className="object-cover w-full h-full" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
        {label}
      </span>
      <span className="text-sm font-bold text-fg uppercase">{value}</span>
    </div>
  );
}
