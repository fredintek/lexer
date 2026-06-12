"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Wallet, User as UserIcon, ShieldCheck, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetUserDetailsQuery } from "@/lib/redux/services/user.api";
import FinanceHub from "../_ui/FinanceHub";
import PersonalInfo from "../_ui/PersonalInfo";
import IdentityVerification from "../_ui/IdentityVerification";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/helpers";
import { useRouter } from "@/i18n/navigation";

export default function UserDetailsPage() {
  const t = useTranslations();
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "personal");

  const { data: user, isLoading } = useGetUserDetailsQuery(id as string);

  const tabs = [
    { id: "personal", label: t("PERSONAL_INFORMATION"), icon: UserIcon },
    { id: "finance", label: t("FINANCE_HUB"), icon: Wallet },
    { id: "identity", label: t("IDENTITY_VERIFICATION"), icon: ShieldCheck },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`?tab=${tabId}`, { scroll: false });
  };

  const avatar = user?.avatar?.url
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${user?.avatar?.url}`
    : null;

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  if (isLoading)
    return (
      <div className="p-10 font-black italic uppercase animate-pulse">
        {t("LOADING")}
      </div>
    );

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-black tracking-tight">
        {t("USER_DETAILS")}
      </h1>

      {/* --- User Summary Card --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          {/* Avatar/Initials */}
          <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-sm shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={user.fullname}
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <div className="h-full w-full bg-brand/10 text-brand text-2xl font-black flex items-center justify-center italic uppercase">
                {user?.fullname
                  ?.split(" ")
                  .map((n: any) => n[0])
                  .join("")
                  .slice(0, 2)}{" "}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-50">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold italic uppercase tracking-tight">
                {user?.fullname}
              </h2>
              <StatusBadge status={user?.status ?? ""} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
            <p className="text-slate-400 text-xs font-mono mt-1">{user?.tag}</p>
          </div>

          {/* Quick Metrics in Summary */}
          <div className="flex gap-8 border-l border-slate-100 dark:border-slate-800 pl-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                {t("TOTAL_BALANCE")}
              </p>
              <p className="text-lg font-black text-brand">
                ₺{formatCurrency(user?.balance)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                {t("KYC_STATUS")}
              </p>
              <StatusBadge status={user?.kyc ? user?.kyc?.status : ""} />
            </div>
          </div>
        </div>
      </div>

      {/* --- Navigation Tabs --- */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative cursor-pointer
                ${isActive ? "text-brand" : "text-slate-500 hover:text-slate-700"}
              `}
            >
              <Icon size={18} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* --- Tab Content --- */}
      <div className="mt-2">
        {activeTab === "finance" && <FinanceHub userId={id as string} />}
        {activeTab === "personal" && <PersonalInfo userId={id as string} />}
        {activeTab === "identity" && (
          <IdentityVerification userId={id as string} />
        )}
      </div>
    </div>
  );
}
