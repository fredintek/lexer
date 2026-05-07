"use client";
import { formatCurrency } from "@/lib/helpers";
import { useGetAllSettingsQuery } from "@/lib/redux/services/settings.api";
import { usePlaceOrderMutation } from "@/lib/redux/services/trade.api";
import { useGetStaticStockQuery } from "@/lib/redux/services/yfinance.api";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SellModal({
  isOpen,
  onClose,
  asset,
}: {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
}) {
  const t = useTranslations();
  const [quantity, setQuantity] = useState(asset.quantity);
  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  const { data: settings } = useGetAllSettingsQuery(undefined);
  const { data: stockInfo } = useGetStaticStockQuery(`${asset?.symbol}.IS`);

  // 1. Fee Calculation Logic
  const commissionRate = Boolean(Number(stockInfo?.sellAdjustment))
    ? Number(stockInfo?.sellAdjustment) * 0.01
    : Number(
        settings?.find((setting: any) => setting?.key === "DEFAULT_SELL_ADJ")
          ?.value,
      ) * 0.01;
  const grossReturn = quantity * asset.currentPrice;
  const transactionFee = grossReturn * commissionRate;
  const netReturn = grossReturn - transactionFee;

  const handleConfirmSell = async () => {
    try {
      await placeOrder({
        symbol: asset.symbol,
        side: "SELL",
        quantity: Number(quantity),
        commission: transactionFee,
        priceAtExecution: asset.currentPrice,
      }).unwrap();

      toast.success(t("SELL_ORDER_SUCCESS"));
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || t("SELL_ORDER_FAILED"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-bg border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase italic">
              {t("SELL_TITLE")} {asset.symbol}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {t("WITHDRAW_TO_BANK")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">
              {t("AMOUNT_TO_SELL")}
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-2">
              <input
                type="number"
                max={asset.quantity}
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(asset.quantity, Number(e.target.value)))
                }
                className="flex-1 bg-transparent px-4 font-black text-lg outline-none"
              />
              <button
                onClick={() => setQuantity(asset.quantity)}
                className="px-3 py-1 bg-brand text-white rounded-lg text-[9px] font-black uppercase"
              >
                {t("MAX")}
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-4 space-y-2 border border-slate-100 dark:border-slate-800/50">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>{t("GROSS_RETURN")}:</span>
              <span className="text-fg tabular-nums">
                ₺{formatCurrency(grossReturn)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 italic">
              <span>
                {t("FEE")} ({commissionRate * 100}%):
              </span>
              <span className="text-down">
                - ₺{formatCurrency(transactionFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-black uppercase">
                {t("NET_PAYOUT")}:
              </span>
              <span className="text-lg font-black text-brand tabular-nums">
                ₺{formatCurrency(netReturn)}
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmSell}
            disabled={isLoading || quantity <= 0}
            className="cursor-pointer w-full py-4 bg-down hover:bg-red-600 disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-down/20 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              t("PROCESSING")
            ) : (
              <>
                <ShieldCheck size={16} /> {t("CONFIRM_AND_SELL")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
