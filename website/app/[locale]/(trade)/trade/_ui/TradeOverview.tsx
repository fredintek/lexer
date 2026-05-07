"use client";
import React, { useMemo } from "react";
import {
  Info,
  Globe,
  Users,
  User,
  MapPin,
  Phone,
  Building2,
  Tag,
  Loader2,
} from "lucide-react";
import { useGetYfDetailsQuery } from "@/lib/redux/services/yfinance.api";
import { getLogoUrl } from "@/lib/helpers";
import { useTranslations } from "next-intl";

interface TradeOverviewProps {
  symbol: string;
}

const TradeOverview = ({ symbol }: TradeOverviewProps) => {
  const t = useTranslations();
  const { data: profile, isLoading } = useGetYfDetailsQuery(symbol);

  // Helper to extract CEO from the officers list
  const ceoName = useMemo(() => {
    const officers = profile?.assetProfile?.companyOfficers || [];
    const ceo = officers.find((o: any) =>
      o.title.toLowerCase().includes("ceo"),
    );
    return ceo ? ceo.name : t("NOT_AVAILABLE_SHORT");
  }, [profile, t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  const asset = profile?.assetProfile;
  const priceData = profile?.price;

  if (!asset) {
    return (
      <div className="p-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl m-6">
        <p className="text-sm text-gray-500">{t("DESC_NOT_AVAILABLE")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl animate-in fade-in duration-500 h-80 overflow-y-auto">
      {/* Header Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            {getLogoUrl(asset?.website) && (
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={getLogoUrl(asset?.website)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {priceData?.longName || symbol}
          </h2>
          <a
            href={asset.website}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            <Globe size={14} /> {t("OFFICIAL_WEBSITE")}
          </a>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-justify">
          {asset.longBusinessSummary}
        </p>
      </section>

      {/* Corporate Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          label={t("SECTOR")}
          value={asset.sector}
          icon={<Tag size={16} className="text-blue-500" />}
        />
        <InfoCard
          label={t("INDUSTRY")}
          value={asset.industry}
          icon={<Building2 size={16} className="text-purple-500" />}
        />
        <InfoCard
          label={t("EMPLOYEES")}
          value={
            asset.fullTimeEmployees?.toLocaleString("tr-TR") ||
            t("NOT_AVAILABLE_SHORT")
          }
          icon={<Users size={16} className="text-orange-500" />}
        />
        <InfoCard
          label={t("CEO")}
          value={ceoName}
          icon={<User size={16} className="text-emerald-500" />}
        />
      </section>

      {/* Contact & Location Details */}
      <section className="pt-6 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          {t("CONTACT_LOCATION")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
              <MapPin size={18} className="text-gray-500" />
            </div>
            <div className="text-sm">
              <p className="font-medium">{asset.address1}</p>
              <p className="text-gray-500">
                {asset.address2 ? `${asset.address2}, ` : ""}
                {asset.city}, {asset.country}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
              <Phone size={18} className="text-gray-500" />
            </div>
            <div className="text-sm">
              <p className="font-medium">{t("PHONE")}</p>
              <p className="text-gray-500">{asset.phone}</p>
              {asset.fax && (
                <p className="text-[10px] text-gray-400">
                  {t("FAX")}: {asset.fax}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const InfoCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 transition-hover hover:border-brand/30">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
        {label}
      </span>
    </div>
    <div className="text-sm font-bold truncate" title={value}>
      {value || "N/A"}
    </div>
  </div>
);

export default TradeOverview;
