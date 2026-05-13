"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
} from "lightweight-charts";
import { useGetYfHistoryQuery } from "@/lib/redux/services/yfinance.api";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type ChartInterval = "1h" | "1d" | "1wk" | "1mo";

const TradingChart = ({
  symbol,
  exchange,
}: {
  symbol: string;
  exchange: string;
}) => {
  const t = useTranslations();

  // Moved inside component to utilize the 't' hook
  const intervals: { label: string; value: ChartInterval }[] = [
    { label: t("INTERVAL_HOUR"), value: "1h" },
    { label: t("INTERVAL_DAY"), value: "1d" },
    { label: t("INTERVAL_WEEK"), value: "1wk" },
    { label: t("INTERVAL_MONTH"), value: "1mo" },
  ];

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [chartInterval, setChartInterval] = useState<ChartInterval>("1d");

  const fromDate = useMemo(() => {
    const now = new Date();
    if (chartInterval === "1h") now.setMonth(now.getMonth() - 1);
    else if (chartInterval === "1d") now.setFullYear(now.getFullYear() - 1);
    else now.setFullYear(now.getFullYear() - 5);
    return now.toISOString().split("T")[0];
  }, [chartInterval]);

  const { data: historyData, isFetching } = useGetYfHistoryQuery(
    { symbol, from: fromDate, interval: chartInterval },
    { skip: !symbol },
  );

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.5)" },
        horzLines: { color: "rgba(30, 41, 59, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300,
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      },
    });

    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !historyData || !Array.isArray(historyData))
      return;

    const formattedData = historyData
      .map((d: any) => {
        const open = parseFloat(d.open);
        const high = parseFloat(d.high);
        const low = parseFloat(d.low);
        const close = parseFloat(d.close);

        return {
          time: (new Date(d.date).getTime() / 1000) as any,
          open,
          high,
          low,
          close,
        };
      })
      .filter(
        (d: any) =>
          typeof d.open === "number" &&
          !isNaN(d.open) &&
          typeof d.high === "number" &&
          !isNaN(d.high) &&
          typeof d.low === "number" &&
          !isNaN(d.low) &&
          typeof d.close === "number" &&
          !isNaN(d.close),
      )
      .sort((a, b) => a.time - b.time);

    if (formattedData.length > 0) {
      seriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [historyData]);

  return (
    <div className="flex flex-col min-h-75 bg-bg overflow-hidden relative shrink-0">
      {/* Interval Selector */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-bg/50 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold">{symbol}</span>
            <span className="text-[10px] text-gray-500 uppercase">
              {exchange}
            </span>
          </div>
          {isFetching && (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-brand" />
              <span className="text-[9px] font-bold text-brand animate-pulse uppercase">
                {t("CHART_LOADING")}
              </span>
            </div>
          )}
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
          {intervals.map((i) => (
            <button
              key={i.value}
              onClick={() => setChartInterval(i.value)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                chartInterval === i.value
                  ? "bg-white dark:bg-gray-800 text-brand shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};

export default TradingChart;
