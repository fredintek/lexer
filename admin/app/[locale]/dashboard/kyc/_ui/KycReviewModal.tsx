"use client";
import React, { useState } from "react";
import { Modal, Input, Image as AntImage } from "antd";
import {
  X,
  Check,
  AlertTriangle,
  FileText,
  UserSquare,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface KYCReviewModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isUpdating?: boolean;
}

export default function KYCReviewModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isUpdating = false,
}: KYCReviewModalProps) {
  const t = useTranslations();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const avatar = request?.user?.avatar?.url
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${request?.user?.avatar?.url}`
    : null;

  if (!request) return null;

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) return;
    onReject(request.id, rejectionReason);
    setRejectionReason("");
    setShowRejectInput(false);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closeIcon={<X size={20} className="text-slate-400" />}
      width={1000}
      centered
      className="lexer-modal"
    >
      {/* 1. Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-bg rounded-t-3xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt="user-avatar"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <UserSquare size={24} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-fg uppercase leading-none mb-1">
              {request?.user?.fullname}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {request?.user?.tag} • {request.country} • Tier{" "}
              {request?.user?.tier}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Content */}
      <div className="p-6 bg-slate-50/50 dark:bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Photo */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={12} /> {request.documentType}
            </label>
            <div className="group relative aspect-4/3 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 bg-bg transition-all hover:border-brand/50">
              <img
                src={
                  request?.docData?.url ||
                  "https://placehold.co/800x600/png?text=Document"
                }
                alt="Document"
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          </div>

          {/* Selfie Photo */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> {t("SELFIE_VERIFICATION")}
            </label>
            <div className="group relative aspect-4/3 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 bg-bg transition-all hover:border-brand/50">
              <img
                src={
                  request?.selfieData?.url ||
                  "https://placehold.co/800x600/png?text=Selfie"
                }
                alt="Selfie"
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>

        {/* Rejection Input Area */}
        {showRejectInput && request?.status === "PENDING" && (
          <div className="mt-6 p-4 rounded-2xl bg-down/5 border border-down/20 animate-in fade-in slide-in-from-top-2">
            <label className="text-[10px] font-black text-down uppercase tracking-widest mb-2 block">
              Reason for Rejection
            </label>
            <Input.TextArea
              placeholder="e.g. Image is too blurry or name mismatch..."
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="bg-bg border-slate-200 dark:border-slate-800 rounded-xl"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowRejectInput(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason}
                className="px-4 py-2 bg-down text-white rounded-lg text-xs font-bold uppercase disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer */}
      {!showRejectInput && request?.status === "PENDING" && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-bg rounded-b-3xl flex justify-between items-center">
          <button
            onClick={() => setShowRejectInput(true)}
            disabled={isUpdating}
            className="px-6 py-3 text-down bg-down/10 hover:bg-down hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle size={16} /> Reject
          </button>
          <button
            onClick={() => onApprove(request.id)}
            disabled={isUpdating}
            className="px-8 py-3 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Check size={16} /> {isUpdating ? "Processing..." : "Approve KYC"}
          </button>
        </div>
      )}
    </Modal>
  );
}
