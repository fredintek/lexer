"use client";
import AddPaymentModal from "@/app/[locale]/(home)/trade/_ui/AddPaymentModal";
import DepositModal from "@/app/[locale]/(home)/trade/_ui/DepositModal";
import WithdrawalModal from "@/app/[locale]/(home)/trade/_ui/WithdrawalModal";
import { useState } from "react";
import StatusBadge from "../StatusBadge";
import { formatCurrency, formatDate, getLogoUrl } from "@/lib/helpers";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  ShieldCheck,
} from "lucide-react";
import { useGetMeQuery } from "@/lib/redux/services/user.api";
import { useGetTransactionHistoryQuery } from "@/lib/redux/services/positions.api";
import { useTranslations } from "next-intl";

type Props = {};

const MobileTrade = (props: Props) => {
  const t = useTranslations();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const { data: history = [], isLoading: loadingHistory } =
    useGetTransactionHistoryQuery(undefined);

  const { data: user } = useGetMeQuery(undefined);

  return (
    <>
      <div className="md:hidden flex-1 flex flex-col pb-16 bg-bg">
        {/* 1. KYC PROMPT - High Attention */}
        {!user?.kyc?.status && (
          <div className="px-4 pt-4">
            <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-brand uppercase tracking-widest">
                  Verification Required
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight mt-0.5">
                  Complete your KYC to unlock all trading features and limits.
                </p>
              </div>
              <button className="bg-brand text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider active:scale-95 transition-all">
                Verify
              </button>
            </div>
          </div>
        )}

        {/* 2. DEPOSIT & WITHDRAW - Action Buttons */}
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 py-4 rounded-2xl transition-colors cursor-pointer"
          >
            <ArrowUpCircle size={18} className="text-brand" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t("DEPOSIT")}
            </span>
          </button>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 py-4 rounded-2xl transition-colors cursor-pointer"
          >
            <ArrowDownCircle size={18} className="text-slate-500" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t("WITHDRAW")}
            </span>
          </button>
        </div>

        {/* 3. TRADE SUMMARY - Portfolio Card */}
        <div className="grid grid-cols-2 gap-3 px-4 py-4 mb-3">
          <div className="bg-slate-900 dark:bg-white/5 rounded-3xl px-6 py-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              {t("TOTAL_BALANCE")}
            </p>
            <div className="flex items-end gap-2">
              <h2 className="text-xl font-black text-white leading-none">
                ₺{formatCurrency(user?.balance)}
              </h2>
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {t("FROZEN_BALANCE")}
            </p>
            <div className="flex items-end gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                ₺{formatCurrency(user?.frozenBalance || 0)}
              </h3>
            </div>
          </div>
        </div>

        {/* 4. RECENT ACTIVITIES - List Style */}
        <div className="flex-1">
          {loadingHistory ? (
            <ActivitySkeleton />
          ) : (
            <>
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Recent Activity
                </h3>
              </div>

              {/* Activity Items */}
              {history?.slice(0, 10)?.map((history: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <History size={18} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="">
                        {getLogoUrl(history?.website) ? (
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6">
                              <img
                                src={getLogoUrl(history?.website)}
                                alt=""
                                className="w-full h-full"
                              />
                            </div>

                            <p className="capitalize">{history?.symbol}</p>
                          </div>
                        ) : (
                          <div className="text-white w-full h-full bg-brand/50 rounded-2xl flex items-center justify-center font-black">
                            <p className="">{history?.symbol}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatDate(history?.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {history?.side === "BUY" ? "-" : "+"}₺
                      {formatCurrency(history?.executionPrice)}
                    </p>
                    <StatusBadge status={history?.status} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        user={user}
        setIsAddPaymentModalOpen={setIsAddPaymentModalOpen}
      />

      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
      />
    </>
  );
};

export default MobileTrade;

function ActivitySkeleton() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>

      {/* List Items Skeleton */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800"
        >
          {/* Left Side: Icon & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          </div>

          {/* Right Side: Price & Status */}
          <div className="flex flex-col items-end space-y-2">
            <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
