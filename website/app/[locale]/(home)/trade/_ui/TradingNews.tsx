"use client";
import { useGetNewsQuery } from "@/lib/redux/services/yfinance.api";
import { ExternalLink, Clock, Newspaper, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";

const TradingNews = ({ symbol }: { symbol: string }) => {
  const t = useTranslations();
  const { data: news, isLoading } = useGetNewsQuery(symbol);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">{t("LOADING_NEWS")}</div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 italic text-sm">
        {t("NO_NEWS_FOUND")} {symbol}.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl animate-in fade-in duration-500 h-80 overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <Newspaper size={18} className="text-brand" /> {t("LATEST_NEWS")}
      </h3>

      <div className="grid gap-4">
        {news.map((item: any) => {
          const thumbnailUrl = item.thumbnail?.resolutions?.[0]?.url;

          return (
            <a
              key={item.uuid}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-brand/50 hover:shadow-md transition-all"
            >
              <div className="w-full sm:w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <ImageOff size={24} className="text-gray-400" />
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand/10 text-brand uppercase tracking-wide">
                      {item.publisher}
                    </span>
                    {item.type && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {item.type}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-base leading-tight text-gray-900 dark:text-gray-100 group-hover:text-brand transition-colors">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>
                      {new Date(item.providerPublishTime).toLocaleDateString(
                        undefined, // Automatically uses current locale
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default TradingNews;
