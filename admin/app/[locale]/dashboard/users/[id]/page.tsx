"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { User, ShieldCheck, Wallet, Mail, Tag, Phone } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useGetUserDetailsQuery } from "@/lib/redux/services/user.api";
import { formatCurrency } from "@/lib/helpers";
import PersonalInfoTab from "../_ui/PersonalInfoTab";
import SecurityTab from "../_ui/SecurityTab";
import FinancialHubTab from "../_ui/FinancialHubTab";
import { useTranslations } from "next-intl";

type TabType = "personal" | "security" | "financial";

export default function UserDetailsPage() {
  const t = useTranslations();
  const { id } = useParams();
  const { data: userDetail, isLoading: isUserDetailLoading } =
    useGetUserDetailsQuery(id as string);
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  if (isUserDetailLoading) {
    return <UserDetailsSkeleton />;
  }

  return (
    <div className="p-6 flex flex-col gap-6 pb-20">
      {/* 1. TOP NAVIGATION & IDENTITY CARD */}
      <div className="flex flex-col gap-6">
        <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {userDetail?.avatar?.url ? (
                <div className="h-20 w-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center text-2xl font-black">
                  <img
                    src={userDetail?.avatar?.url}
                    alt="user-avatar"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center text-2xl font-black">
                  {userDetail?.fullname[0]}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl truncate font-black tracking-tighter text-fg uppercase">
                  {userDetail?.fullname}
                </h1>
                <StatusBadge status={userDetail?.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                  <Tag size={12} /> {userDetail?.tag}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase border-l border-slate-200 dark:border-slate-800 pl-3">
                  <Mail size={12} /> {userDetail?.email}
                </span>
                {userDetail?.phoneNumber && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase border-l border-slate-200 dark:border-slate-800 pl-3">
                    <Phone size={12} /> {userDetail?.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 px-8 border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="text-brand" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {t("TOTAL_BALANCE")}
                </p>
              </div>
              <h2 className="text-3xl font-black text-fg tracking-tighter">
                ₺{formatCurrency(userDetail?.balance)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
        {[
          { id: "personal", label: t("PERSONAL_INFO"), icon: User },
          { id: "financial", label: t("FINANCIAL_HUB"), icon: Wallet },
          { id: "security", label: t("SECURITY"), icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-bg text-brand shadow-sm"
                : "text-slate-500 hover:text-fg"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}
      <div className="mt-2">
        {activeTab === "personal" && <PersonalInfoTab user={userDetail} />}
        {activeTab === "financial" && <FinancialHubTab user={userDetail} />}
        {activeTab === "security" && <SecurityTab user={userDetail} />}
      </div>
    </div>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-6 pb-20 animate-pulse">
      {/* 1. TOP NAV SKELETON */}
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />

      {/* IDENTITY CARD SKELETON */}
      <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        <div className="flex items-center gap-8 px-8 border-l border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 2. TAB NAV SKELETON */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"
          />
        ))}
      </div>

      {/* 3. CONTENT SKELETON */}
      <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8 h-64">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-8" />
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-14 w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl" />
            <div className="h-14 w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="h-14 w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl" />
            <div className="h-14 w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
