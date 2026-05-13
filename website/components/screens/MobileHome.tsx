import MobileCandlestickChart from "@/app/[locale]/(home)/trade/_ui/MobileCandlestickChart";
import TickerStat from "@/app/[locale]/(home)/trade/_ui/TickerStat";
import { useRouter } from "@/i18n/navigation";
import { formatCurrency, formatVol, getLogoUrl } from "@/lib/helpers";
import { useBuyPositionMutation } from "@/lib/redux/services/positions.api";
import { usePlaceOrderMutation } from "@/lib/redux/services/trade.api";
import { useGetMeQuery } from "@/lib/redux/services/user.api";
import {
  useGetYfDetailsQuery,
  yfinanceApi,
} from "@/lib/redux/services/yfinance.api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { Loader, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

type Props = {};

const MobileHome = (props: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: user } = useGetMeQuery(undefined);
  const { activeSymbol } = useAppSelector((state) => state.yfinanceDataReducer);
  const { data: quoteData, isLoading: quoteDataIsLoading } =
    useGetYfDetailsQuery(activeSymbol, {
      skip: !activeSymbol,
    });
  const [buyPosition, { isLoading: isBuyingPosition }] =
    useBuyPositionMutation();

  const isPositive = useMemo(() => {
    return Number(quoteData?.price?.regularMarketChangePercent) >= 0;
  }, [quoteData]);
  const hasValidTickData = useMemo(
    () => !quoteDataIsLoading && quoteData && quoteData.price,
    [quoteData, quoteDataIsLoading],
  );

  const PRESETS = [1, 20, 40, 60];
  const COMMISSION_RATE = 0.01;

  const [quantity, setQuantity] = useState(1);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");

  // Use live price as entry price
  const entryPrice = useMemo(() => {
    return Number(quoteData?.price?.regularMarketPrice ?? 0);
  }, [quoteData]);

  const estAmount = quantity * entryPrice;
  const commission = estAmount * COMMISSION_RATE;
  const totalCost = estAmount + commission;

  // Max quantity based on user balance
  const maxQuantity = useMemo(() => {
    const balance = Number(user?.balance ?? 0);
    if (!entryPrice || entryPrice === 0) return 0;
    return Math.floor(balance / (entryPrice * (1 + COMMISSION_RATE)));
  }, [user?.balance, entryPrice]);

  const handleSubmit = async () => {
    if (!activeSymbol) return toast.error(t("SELECT_SYMBOL_ERROR"));

    try {
      await buyPosition({
        symbol: activeSymbol,
        lots: quantity,
        type: "BUYING",
      }).unwrap();

      toast.success(
        t("PURCHASE_SUCCESS", { lot: quantity, symbol: activeSymbol }),
      );
      router.push("/positions");
    } catch (err: any) {
      toast.error(err?.data?.message || t("TRADE_FAILED"));
    }
  };

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}/trade`);

    socket.on("marketUpdate", (allStocks) => {
      const currentStockData = allStocks.find(
        (s: any) => s.symbol === activeSymbol,
      );

      if (currentStockData) {
        dispatch(
          yfinanceApi.util.updateQueryData(
            "getYfDetails",
            activeSymbol,
            (draft) => {
              if (draft && draft.price) {
                draft.price.regularMarketPrice = currentStockData.price;
                draft.price.regularMarketChangePercent =
                  currentStockData.change;
                draft.price.regularMarketVolume = currentStockData.volume;
              }
            },
          ),
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeSymbol, dispatch]);
  return (
    <div className="md:hidden flex-1 flex flex-col">
      <div className="flex flex-col gap-2">
        <div className="px-4 pt-2 flex items-center gap-4 font-bold">
          <div className="flex gap-2 items-center">
            <div className="">
              {getLogoUrl(quoteData?.assetProfile?.website) && (
                <div className="w-6 h-6 rounded-full">
                  <img
                    src={getLogoUrl(quoteData?.assetProfile?.website)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p>{activeSymbol}</p>
          </div>
          <p className="text-xl">
            {formatCurrency(quoteData?.price?.regularMarketPrice)}
          </p>
        </div>
        {hasValidTickData && (
          <div className="flex items-center space-x-8 px-4">
            <TickerStat
              label={t("CHANGE")}
              value={`${isPositive ? "+" : ""}${quoteData.price.regularMarketChangePercent.toFixed(2)}%`}
              color={isPositive ? "text-up" : "text-down"}
            />
            <TickerStat
              label={t("HIGH_24H")}
              value={formatCurrency(quoteData.price.regularMarketDayHigh)}
            />
            <TickerStat
              label={t("LOW_24H")}
              value={formatCurrency(quoteData.price.regularMarketDayLow)}
            />
            <TickerStat
              label={t("VOLUME")}
              value={formatVol(quoteData.price.regularMarketVolume)}
              color="text-gray-400"
            />
          </div>
        )}
        <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 flex items-center justify-between">
          <p> {t("AVAILABLE_BALANCE")}</p>
          <p>{formatCurrency(Number(user?.balance))} TRY</p>
        </div>
      </div>

      {/* CHART AND PURCHASE FORM*/}
      <div className="flex flex-col flex-1 pb-16">
        <div className="h-100">
          <MobileCandlestickChart symbol={activeSymbol} exchange="Bist" />
        </div>

        {/* Buy Form */}
        <div className="border-0 border-t border-slate-100 dark:border-slate-500 flex-1 bg-bg flex flex-col px-4 py-4 gap-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-900 dark:text-white font-black text-sm">
                {activeSymbol} —{" "}
                <span className={side === "BUY" ? "text-up" : "text-down"}>
                  {side}
                </span>
              </p>
              <p className="text-slate-400 dark:text-white/40 text-xs">
                {quoteData?.price?.longName ??
                  quoteData?.price?.shortName ??
                  "—"}{" "}
                · BIST
              </p>
            </div>
            <p className="text-brand font-black text-lg">
              ₺{formatCurrency(entryPrice)}
            </p>
          </div>

          {/* Entry + Est Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1">
                {t("ENTRY_PRICE")}
              </p>
              <p className="text-slate-900 dark:text-white font-black text-base">
                ₺{formatCurrency(entryPrice)}
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1">
                {t("EST_AMOUNT")}
              </p>
              <p className="text-brand font-black text-base">
                ₺{formatCurrency(estAmount)}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 mb-2">
              {t("QUANTITY")}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer active:scale-95"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                className="flex-1 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-center font-black text-base rounded-xl h-10 outline-none border border-transparent focus:border-brand"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Presets */}
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setQuantity(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    quantity === p
                      ? "bg-brand text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/20"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setQuantity(maxQuantity)}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  quantity === maxQuantity && maxQuantity > 0
                    ? "bg-brand text-white"
                    : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/20"
                }`}
              >
                {t("MAX")}
              </button>
            </div>
          </div>

          {/* Commission + Total */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400 dark:text-white/40 font-medium">
                {t("COMMISSION")} (1%)
              </p>
              <p className="text-xs text-slate-500 dark:text-white/60 font-black">
                ₺{commission.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-900 dark:text-white font-black">
                {t("TOTAL_COST")}
              </p>
              <p className="text-sm text-brand font-black">
                ₺{totalCost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* BUY Button */}
          <button
            onClick={handleSubmit}
            disabled={isBuyingPosition}
            className={`disabled:opacity-70 w-full py-4 rounded-2xl flex items-center justify-center text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer bg-brand text-white`}
          >
            {isBuyingPosition ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <p>{t("BUY")}</p>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
