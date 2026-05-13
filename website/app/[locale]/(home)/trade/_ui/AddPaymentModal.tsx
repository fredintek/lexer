import React, { useState } from "react";
import { X, CreditCard, Zap, Landmark, Save, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useAddPaymentMethodMutation } from "@/lib/redux/services/payment.api";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPaymentModal = ({ isOpen, onClose }: AddPaymentModalProps) => {
  const t = useTranslations();
  const [type] = useState("Bank Account");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");

  const [addMethod, { isLoading }] = useAddPaymentMethodMutation();

  if (!isOpen) return null;

  const ibanRegex = /^TR[a-zA-Z0-9]{24}$/;
  const handleSubmit = async () => {
    // 1. Clean the input (remove spaces)
    const cleanDetail = detail.replace(/\s/g, "");

    // 2. Validate based on type
    if (type === "Bank Account") {
      if (!ibanRegex.test(cleanDetail)) {
        return toast.error(t("IBAN_VALIDATION_ERROR"));
      }
    } else {
      // Previous crypto/other logic: value.length > 25 was an error
      if (cleanDetail.length > 35) {
        // Adjusted for modern wallet lengths
        return toast.error(t("CRYPTO_VALIDATION_ERROR"));
      }
    }

    try {
      await addMethod({
        type,
        name,
        detail,
      }).unwrap();

      toast.success(t("METHOD_ADDED_SUCCESS"));
      onClose();
      setName("");
      setDetail("");
    } catch (err: any) {
      toast.error(err?.data?.message || t("ADD_METHOD_FAILED"));
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <div>
            <h2 className="font-black text-lg uppercase tracking-tight">
              {t("ADD_METHOD")}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("WITHDRAWAL_ACCOUNTS")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Toggle Type */}
          <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white dark:bg-slate-800 shadow-sm text-brand`}
            >
              <CreditCard size={14} /> {t("BANK")}
            </button>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">
              {type === "Bank Account" ? t("BANK_NAME") : t("METHOD_NAME")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "Bank Account" ? "e.g. Ziraat Bankası" : "e.g. Papara"
              }
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Detail Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">
              {type === "Bank Account" ? t("IBAN_NUMBER") : t("ACCOUNT_NUMBER")}
            </label>
            <div className="relative">
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value.toUpperCase())}
                placeholder={
                  type === "Bank Account" ? "TR00 ..." : "1234567890"
                }
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-mono font-bold outline-none focus:border-brand transition-colors"
              />
              <Landmark
                size={18}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={isLoading || !name || !detail}
            onClick={handleSubmit}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : (
              t("SAVE_CHANGES")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
