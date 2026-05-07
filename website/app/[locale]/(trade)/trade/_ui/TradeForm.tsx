"use client";
import { useRouter } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/helpers";
import { useGetAllSettingsQuery } from "@/lib/redux/services/settings.api";
import { usePlaceOrderMutation } from "@/lib/redux/services/trade.api";
import { useGetStaticStockQuery } from "@/lib/redux/services/yfinance.api";
import { AlertCircle, Loader2, Minus, Plus, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TradeForm = ({
  selectedSymbol,
  user,
}: {
  selectedSymbol: any;
  user: any;
}) => {
  const t = useTranslations();
  const router = useRouter();
  const [lot, setLot] = useState(1);
  const [price, setPrice] = useState(selectedSymbol?.price || 0);

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();
  const { data: settings } = useGetAllSettingsQuery(undefined);
  const { data: stockInfo } = useGetStaticStockQuery(
    `${selectedSymbol?.symbol}.IS`,
  );

  const commissionRate = Boolean(Number(stockInfo?.buyAdjustment))
    ? Number(stockInfo?.buyAdjustment) * 0.01
    : Number(
        settings?.find((setting: any) => setting?.key === "DEFAULT_BUY_ADJ")
          ?.value,
      ) * 0.01;

  const amount = price * lot;
  const commission = amount * commissionRate;
  const totalCost = amount + commission;

  // =============== QUICK LOTS CALCULATION STARTS =======================

  const lotStep = Boolean(Number(stockInfo?.lotStep))
    ? Number(stockInfo?.lotStep)
    : Number(
        settings?.find(
          (setting: any) => setting?.key === "PLATFORM_DEFAULT_STEP",
        )?.value,
      );

  const lotMin = Boolean(Number(stockInfo?.minLot))
    ? Number(stockInfo?.minLot)
    : Number(
        settings?.find((setting: any) => setting?.key === "PLATFORM_MIN_LOT")
          ?.value,
      );

  const lotMax = Boolean(Number(stockInfo?.maxLot))
    ? Number(stockInfo?.maxLot)
    : Number(
        settings?.find((setting: any) => setting?.key === "PLATFORM_MAX_LOT")
          ?.value,
      );
  // Function to handle precision (same as before)
  const getPrecision = (step: number) => {
    if (!step) return 0;
    const stepStr = step.toString();
    return stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
  };

  const precision = getPrecision(lotStep);
  const quickLots = [];

  // Handle edge cases where data might be missing or invalid
  if (lotStep > 0 && lotMin <= lotMax) {
    // Start the array with the minimum valid lot
    let currentLot = lotMin;

    // Keep adding the step until we exceed the maximum
    while (currentLot <= lotMax) {
      // Add the current value, formatted to the correct precision
      // The parseFloat(num.toFixed(p)) is the best way to handle decimals
      quickLots.push(parseFloat(currentLot.toFixed(precision)));

      // Increment by the step
      currentLot += lotStep;
    }
  }

  // In some rare cases, rounding errors might cause lotMax to be missed
  // if currentLot lands *slightly* above it. Ensure lotMax is the final value.
  if (quickLots.length > 0 && quickLots[quickLots.length - 1] < lotMax) {
    // Use parseFloat/toFixed here too for decimal safety
    quickLots[quickLots.length - 1] = parseFloat(lotMax.toFixed(precision));
  } else if (quickLots.length === 0) {
    // Basic fallback: just return the min
    quickLots.push(lotMin);
  }

  // =============== QUICK LOTS CALCULATION ENDS=======================

  useEffect(() => {
    if (selectedSymbol?.price) {
      setPrice(selectedSymbol.price);
    }
  }, [selectedSymbol]);

  const handleMax = () => {
    if (price > 0) {
      const maxPossible = Math.floor(
        user?.balance / (price * (1 + commissionRate)),
      );
      setLot(maxPossible > 0 ? maxPossible : 0);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSymbol) return toast.error(t("SELECT_SYMBOL_ERROR"));

    try {
      await placeOrder({
        symbol: selectedSymbol.symbol,
        side: "BUY",
        quantity: lot,
        priceAtExecution: price,
        commission,
      }).unwrap();

      toast.success(
        t("PURCHASE_SUCCESS", { lot: lot, symbol: selectedSymbol.symbol }),
      );
      setLot(1);
      router.push("/profile?tab=assets");
    } catch (err: any) {
      toast.error(err?.data?.message || t("TRADE_FAILED"));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-bg">
      {/* Symbol Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-gray-100">
              {selectedSymbol?.symbol}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-medium">
              {selectedSymbol?.name || t("MARKET_ASSET")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
              ₺{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div
              className={`text-xs font-bold ${Number(selectedSymbol?.change) >= 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              {Number(selectedSymbol?.change) >= 0 ? "+" : ""}
              {selectedSymbol?.change}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Price & Amount Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("ENTRY_PRICE")}
            </label>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-sm text-gray-600 dark:text-gray-300">
              {price.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("EST_AMOUNT")}
            </label>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-sm text-brand font-bold">
              ₺{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Lot Counter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("QUANTITY_LOT")}
            </label>
            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
              <Wallet size={10} /> ₺{user?.balance.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden focus-within:ring-1 ring-brand/50 transition-all">
            <button
              onClick={() => setLot(Math.max(1, lot - 1))}
              className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-gray-500"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              value={lot}
              onChange={(e) =>
                setLot(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="flex-1 bg-transparent text-center font-bold text-base outline-none dark:text-white"
            />
            <button
              onClick={() => setLot(lot + 1)}
              className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-gray-500"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Presets */}
          <div className="flex justify-between">
            {quickLots.map((val) => (
              <button
                key={val}
                onClick={() => setLot(val)}
                className={`text-[10px] font-bold py-1.5 border rounded-md transition-all w-7.5 h-7.5 ${
                  lot === val
                    ? "border-brand bg-brand text-white"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600"
                }`}
              >
                {`${val}`}
              </button>
            ))}
            <button
              onClick={handleMax}
              className="text-[10px] font-bold w-7.5 h-7.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t("MAX")}
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">
              {t("COMMISSION")} ({commissionRate * 100}%)
            </span>
            <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
              ₺{commission.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-gray-600 dark:text-gray-400">
              {t("TOTAL_COST")}
            </span>
            <span className="font-mono font-bold text-brand">
              ₺{formatCurrency(totalCost)}
            </span>
          </div>
        </div>

        {/* User Balance Warning */}
        {user?.balance < totalCost && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold animate-in shake">
            <AlertCircle size={14} />
            {t("INSUFFICIENT_FUNDS")} ({t("MISSING")} ₺
            {(totalCost - user?.balance).toFixed(2)})
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={user?.balance < totalCost || lot <= 0 || isLoading}
            className="cursor-pointer w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:grayscale text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t("PROCESSING")}
              </div>
            ) : (
              t("BUY")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;
