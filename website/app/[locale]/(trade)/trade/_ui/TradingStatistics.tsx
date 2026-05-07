"use client";
import {
  BarChart3,
  PieChart,
  Wallet2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useGetYfDetailsQuery } from "@/lib/redux/services/yfinance.api";
import { useTranslations } from "next-intl";

type Props = {
  symbol: string;
};

const TradingStatistics = ({ symbol }: Props) => {
  const t = useTranslations();
  const { data: profile, isLoading } = useGetYfDetailsQuery(symbol);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  const keyStats = profile?.defaultKeyStatistics;
  const financialData = profile?.financialData;
  const priceData = profile?.price;

  if (!keyStats || !financialData) {
    return (
      <div className="p-8 text-center text-gray-500 italic text-sm">
        {t("NO_STATISTICAL_DATA")}
      </div>
    );
  }

  const formatCompact = (
    val: number | undefined,
    currency: string | null | undefined,
  ) => {
    if (val === undefined || val === null) return "---";

    const validCurrency = currency && currency.length === 3 ? currency : "TRY";

    try {
      return new Intl.NumberFormat("tr-TR", {
        notation: "compact",
        maximumFractionDigits: 2,
        style: "currency",
        currency: validCurrency,
      }).format(val);
    } catch (error) {
      return new Intl.NumberFormat("tr-TR", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(val);
    }
  };

  const formatPercent = (val: number | undefined) => {
    if (val === undefined || val === null) return "---";
    return `${(val * 100).toFixed(2)}%`;
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl animate-in fade-in duration-500 h-80 overflow-y-auto">
      {/* 1. VALUATION METRICS */}
      <section>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-brand" />{" "}
          {t("VALUATION_METRICS")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t("MARKET_CAP")}
            value={formatCompact(priceData?.marketCap, priceData?.currency)}
          />
          <StatCard
            label={t("FORWARD_PE")}
            value={keyStats.forwardPE?.toFixed(2)}
          />
          <StatCard
            label={t("PRICE_TO_BOOK")}
            value={keyStats.priceToBook?.toFixed(2)}
          />
          <StatCard
            label={t("PEG_RATIO")}
            value={keyStats.pegRatio?.toFixed(2)}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. INCOME STATEMENT SUMMARY */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />{" "}
            {t("INCOME_STATEMENT_TTM")}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <DataRow
              label={t("TOTAL_REVENUE")}
              value={formatCompact(
                financialData.totalRevenue,
                financialData.financialCurrency,
              )}
            />
            <DataRow
              label={t("GROSS_PROFIT")}
              value={formatCompact(
                financialData.grossProfits,
                financialData.financialCurrency,
              )}
            />
            <DataRow
              label={t("EBITDA")}
              value={formatCompact(
                financialData.ebitda,
                financialData.financialCurrency,
              )}
            />
            <DataRow
              label={t("TRAILING_EPS")}
              value={`${priceData?.currencySymbol}${keyStats.trailingEps ?? "---"}`}
            />
            <DataRow
              label={t("REVENUE_GROWTH_YOY")}
              value={formatPercent(financialData.revenueGrowth)}
              isPositive={financialData.revenueGrowth > 0}
            />
          </div>
        </section>

        {/* 3. BALANCE SHEET & CASH */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Wallet2 size={16} className="text-blue-500" />{" "}
            {t("BALANCE_SHEET_CASH_FLOW")}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <DataRow
              label={t("TOTAL_CASH")}
              value={formatCompact(
                financialData.totalCash,
                financialData.financialCurrency,
              )}
            />
            <DataRow
              label={t("TOTAL_DEBT")}
              value={formatCompact(
                financialData.totalDebt,
                financialData.financialCurrency,
              )}
            />
            <DataRow
              label={t("DEBT_EQUITY_RATIO")}
              value={financialData.debtToEquity?.toFixed(2)}
            />
            <DataRow
              label={t("CURRENT_RATIO")}
              value={financialData.currentRatio?.toFixed(2)}
            />
            <DataRow
              label={t("FREE_CASH_FLOW")}
              value={formatCompact(
                financialData.freeCashflow,
                financialData.financialCurrency,
              )}
            />
          </div>
        </section>
      </div>

      {/* 4. STOCK STATISTICS */}
      <section>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <PieChart size={16} className="text-purple-500" />
          {t("SHARE_STATISTICS")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label={t("SHARES_OUTSTANDING")}
            value={keyStats.sharesOutstanding?.toLocaleString("tr-TR")}
          />
          <StatCard
            label={t("FLOAT_SHARES")}
            value={keyStats.floatShares?.toLocaleString("tr-TR")}
          />
          <StatCard
            label={t("AVG_VOL_3M")}
            value={priceData?.averageDailyVolume3Month?.toLocaleString("tr-TR")}
          />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => (
  <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-brand/50 transition-colors">
    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-tight">
      {label}
    </div>
    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
      {value || "---"}
    </div>
  </div>
);

const DataRow = ({
  label,
  value,
  isPositive,
}: {
  label: string;
  value: string | number;
  isPositive?: boolean;
}) => (
  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors">
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <span
      className={`text-xs font-bold ${
        isPositive === true
          ? "text-emerald-500"
          : isPositive === false
            ? "text-red-500"
            : "text-gray-900 dark:text-gray-100"
      }`}
    >
      {value}
    </span>
  </div>
);

export default TradingStatistics;
