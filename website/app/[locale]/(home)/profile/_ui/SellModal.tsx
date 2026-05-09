"use client";
import { formatCurrency } from "@/lib/helpers";
import { useSellPositionMutation } from "@/lib/redux/services/positions.api";
import { useGetAllSettingsQuery } from "@/lib/redux/services/settings.api";
import { useGetStaticStockQuery } from "@/lib/redux/services/yfinance.api";
import { Loader, ShieldCheck } from "lucide-react";
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
  const [quantity, setQuantity] = useState(asset?.displayLot);
  const [sellPosition, { isLoading }] = useSellPositionMutation();

  const handleConfirmSell = async () => {
    try {
      await sellPosition({
        positionId: asset.id,
        lotsToSell: quantity,
      }).unwrap();
      toast.success(t("SELL_ORDER_SUCCESS"));
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || t("SELL_ORDER_FAILED"));
    }
  };

  if (!isOpen || !asset) return null;

  const grossReturn = quantity * (asset.currentPrice || asset.startingPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-4xl overflow-hidden shadow-2xl">
        <div className="p-6 space-y-5">
          <h2 className="text-xl font-black uppercase italic">
            {t("SELL")} {asset.symbol}
          </h2>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">
              {t("AMOUNT_TO_SELL")}
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 border border-slate-200 dark:border-slate-700">
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(asset.lots, Number(e.target.value)))
                }
                className="flex-1 bg-transparent px-4 font-black text-lg outline-none"
              />
              <button
                onClick={() => setQuantity(asset.lots)}
                className="px-3 py-1 bg-brand text-white rounded-lg text-[9px] font-black uppercase"
              >
                {t("MAX")}
              </button>
            </div>
            <p className="text-[10px] font-bold text-slate-500">
              Available: {asset.displayLot} Lots
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase">
                {t("NET_PAYOUT")}:
              </span>
              <span className="text-lg font-black text-brand">
                ₺{formatCurrency(grossReturn)}
              </span>
            </div>
          </div>

          <button
            disabled={isLoading || quantity <= 0}
            onClick={handleConfirmSell}
            className="cursor-pointer w-full py-4 bg-down hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <>
                <ShieldCheck size={16} /> {t("CONFIRM_AND_SELL")}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="cursor-pointer w-full text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
          >
            {t("CANCEL")}
          </button>
        </div>
      </div>
    </div>
  );
}
