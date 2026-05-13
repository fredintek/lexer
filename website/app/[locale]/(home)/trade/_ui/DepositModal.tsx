"use client";
import { useState } from "react";
import { X, Upload, Copy, CheckCircle2, Landmark, Loader2 } from "lucide-react";
import { useGetActiveBankAccountQuery } from "@/lib/redux/services/bank-account.api";
import { useCreateDepositMutation } from "@/lib/redux/services/wallet.api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const t = useTranslations();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);

  const { data: bank, isLoading } = useGetActiveBankAccountQuery(undefined, {
    skip: !isOpen,
  });

  const [deposit, { isLoading: isDepositing }] = useCreateDepositMutation();

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("COPIED_TO_CLIPBOARD"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleConfirmDeposit = async () => {
    if (!amount || !bank?.id) return;

    try {
      const formData = new FormData();
      formData.append("amount", amount);
      file && formData.append("receipt", file);
      formData.append("bankAccountId", bank.id);

      await deposit(formData).unwrap();

      toast.success(t("DEPOSIT_SUCCESS"));

      setStep(1);
      setAmount("");
      setFile(undefined);
    } catch (err: any) {
      console.error("Deposit failed:", err);
      toast.error(err?.data?.message || t("DEPOSIT_FAILED"));
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-lg">{t("DEPOSIT_TRY")}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Bank Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="bg-brand/5 border border-brand/10 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-brand font-bold text-sm">
                  <Landmark size={18} />
                  <span>{bank?.title || t("COMPANY_BANK_DETAILS")}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                    <div className="text-[10px] uppercase text-slate-400 font-bold">
                      {t("BANK_NAME")}
                    </div>
                    <div className="text-sm font-bold">
                      {bank?.bankName || "..."}
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">
                        {t("IBAN")}
                      </div>
                      <div className="text-xs font-mono font-bold uppercase">
                        {bank?.accountNumber || "..."}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bank?.accountNumber || "")}
                      className="text-brand hover:scale-110 transition-transform"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <button
                disabled={isLoading || !bank}
                onClick={() => setStep(2)}
                className="cursor-pointer w-full bg-brand disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                {isLoading ? t("LOADING") : t("MADE_THE_TRANSFER")}
              </button>
            </div>
          )}

          {/* Step 2: Amount & Receipt Upload */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  {t("TRANSFER_AMOUNT")}
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-brand/50 font-mono text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    {t("PAYMENT_RECEIPT")}
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    ({t("OPTIONAL")})
                  </label>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {file ? (
                    <div className="flex flex-col items-center text-emerald-500">
                      <CheckCircle2 size={32} />
                      <span className="text-xs font-bold mt-2 truncate max-w-50">
                        {file.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Upload size={32} />
                      <span className="text-xs font-bold mt-2">
                        {t("UPLOAD_RECEIPT")}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  {t("BACK")}
                </button>
                <button
                  disabled={!amount || isDepositing}
                  onClick={handleConfirmDeposit}
                  className="cursor-pointer flex-2 bg-brand disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand/20 flex justify-center items-center gap-2"
                >
                  {isDepositing && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isDepositing ? t("SENDING") : t("CONFIRM_DEPOSIT")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
