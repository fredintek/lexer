"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import { useGetYfHistoryQuery } from "@/lib/redux/services/yfinance.api";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type ChartInterval = "1h" | "1d" | "1wk" | "1mo";

interface Props {
  symbol: string;
  exchange: string;
}

const MobileCandlestickChart = ({ symbol, exchange }: Props) => {
  const t = useTranslations();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [chartInterval, setChartInterval] = useState<ChartInterval>("1d");
  const [isDark, setIsDark] = useState(false);

  const intervals: { label: string; value: ChartInterval }[] = [
    { label: t("INTERVAL_HOUR"), value: "1h" },
    { label: t("INTERVAL_DAY"), value: "1d" },
    { label: t("INTERVAL_WEEK"), value: "1wk" },
    { label: t("INTERVAL_MONTH"), value: "1mo" },
  ];

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

  // Dark mode observer
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Init chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
      },
      grid: {
        vertLines: {
          color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        },
        horzLines: {
          color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
        },
        horzLine: {
          color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
        },
      },
      rightPriceScale: {
        borderColor: "transparent",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "transparent",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: true },
      handleScale: { mouseWheel: false, pinch: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [isDark]);

  // Update data when historyData or interval changes
  useEffect(() => {
    if (!seriesRef.current || !historyData || !Array.isArray(historyData))
      return;

    const formattedData = historyData
      .map((d: any) => ({
        time: (new Date(d.date).getTime() / 1000) as any,
        open: parseFloat(d.open),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
        close: parseFloat(d.close),
      }))
      .filter(
        (d: any) =>
          !isNaN(d.open) && !isNaN(d.high) && !isNaN(d.low) && !isNaN(d.close),
      )
      .sort((a, b) => a.time - b.time);

    if (formattedData.length > 0) {
      seriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [historyData, isDark]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-xs font-black">{symbol}</span>
            <span className="text-[9px] text-slate-400 uppercase">
              {exchange}
            </span>
          </div>
          {isFetching && (
            <Loader2 size={12} className="animate-spin text-brand" />
          )}
        </div>

        {/* Timeframe tabs */}
        <div className="flex gap-1">
          {intervals.map((i) => (
            <button
              key={i.value}
              onClick={() => setChartInterval(i.value)}
              className={`text-[10px] font-black px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                chartInterval === i.value
                  ? "bg-brand text-white"
                  : "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
};

export default MobileCandlestickChart;
