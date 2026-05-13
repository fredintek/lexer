import React, { useState } from "react";
import {
  X,
  CreditCard,
  Zap,
  Download,
  Landmark,
  Loader2,
  Info,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useRequestWithdrawalMutation } from "@/lib/redux/services/wallet.api";
import { formatCurrency } from "@/lib/helpers";
import { useGetPaymentMethodsQuery } from "@/lib/redux/services/payment.api";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  setIsAddPaymentModalOpen: (val: boolean) => void;
}

const WithdrawalModal = ({
  isOpen,
  onClose,
  user,
  setIsAddPaymentModalOpen,
}: WithdrawalModalProps) => {
  const t = useTranslations();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const { data: methods, isLoading: methodsLoading } =
    useGetPaymentMethodsQuery();

  const [withdraw, { isLoading: isSubmitting }] =
    useRequestWithdrawalMutation();

  if (!isOpen) return null;

  const handleWithdrawal = async () => {
    if (!amount || Number(amount) <= 0)
      return toast.error(t("ERROR_INVALID_AMOUNT"));
    if (!selectedMethodId) return toast.error(t("ERROR_SELECT_METHOD"));
    if (amount > (user?.balance || 0))
      return toast.error(t("ERROR_INSUFFICIENT"));

    try {
      await withdraw({
        amount: Number(amount),
        paymentMethodId: selectedMethodId,
      }).unwrap();
      toast.success(t("SUCCESS_SUBMITTED"));
      setAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || t("FAILED_WITHDRAWAL"));
    } finally {
      onClose();
    }
  };

  const selectedMethod = methods?.find((m) => m.id === selectedMethodId);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Download size={20} className="text-brand" />
            {t("WITHDRAW")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Method Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                {t("SELECT_VERIFIED_METHOD")}
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {methodsLoading ? (
                  [1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"
                    />
                  ))
                ) : methods?.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                      {t("NO_VERIFIED_METHODS")}
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        setIsAddPaymentModalOpen(true);
                      }}
                      className="cursor-pointer text-brand text-[10px] font-black uppercase mt-2 hover:underline"
                    >
                      {t("ADD_METHOD")}
                    </button>
                  </div>
                ) : (
                  methods?.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selectedMethodId === method.id
                          ? "border-brand bg-brand/5"
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        {method.type === "Bank Account" ? (
                          <CreditCard size={18} />
                        ) : (
                          <Zap size={18} />
                        )}
                        <div>
                          <p className="text-xs font-bold uppercase">
                            {method.name}
                          </p>
                          <p className="text-[10px] font-mono opacity-50">
                            {method.detail}
                          </p>
                        </div>
                      </div>
                      {selectedMethodId === method.id && (
                        <div className="h-2 w-2 rounded-full bg-brand" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <button
                disabled={!selectedMethodId}
                onClick={() => setStep(2)}
                className="cursor-pointer w-full bg-brand disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {t("CONTINUE")} <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Amount Input */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                <Info size={18} className="text-brand shrink-0" />
                <p className="text-[11px] font-medium text-slate-500">
                  {t("WITHDRAWAL_TO")}:{" "}
                  <span className="font-bold text-slate-900 dark:text-white uppercase">
                    {selectedMethod?.name}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    {t("AMOUNT")}
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    {t("BALANCE")}: ₺{formatCurrency(user?.balance || 0)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-brand/30 font-mono text-xl font-bold"
                  />
                  <button
                    onClick={() => setAmount(user?.balance?.toString() || "0")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-brand uppercase"
                  >
                    {t("MAX")}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-700 uppercase text-xs"
                >
                  {t("BACK")}
                </button>
                <button
                  disabled={!amount || isSubmitting || Number(amount) <= 0}
                  onClick={handleWithdrawal}
                  className="cursor-pointer flex-2 bg-fg text-bg dark:bg-white dark:text-black py-3 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 uppercase text-xs tracking-wider"
                >
                  {isSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isSubmitting ? t("PROCESSING") : t("CONFIRM_WITHDRAWAL")}
                </button>
              </div>

              <p className="text-[9px] text-center text-down font-bold uppercase tracking-widest leading-relaxed opacity-80">
                {t("WITHDRAWAL_DISCLAIMER")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
