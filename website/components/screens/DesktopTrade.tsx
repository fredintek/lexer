import React, { useState } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldCheck,
  Wallet,
  History,
} from "lucide-react";
import { formatCurrency, formatDate, getLogoUrl } from "@/lib/helpers";
import StatusBadge from "../StatusBadge";
import { useGetTransactionHistoryQuery } from "@/lib/redux/services/positions.api";
import { useGetMeQuery } from "@/lib/redux/services/user.api";
import { useTranslations } from "next-intl";
import DataTable, { Column } from "../dataTable/DataTable";
import AddPaymentModal from "@/app/[locale]/(home)/trade/_ui/AddPaymentModal";
import WithdrawalModal from "@/app/[locale]/(home)/trade/_ui/WithdrawalModal";
import DepositModal from "@/app/[locale]/(home)/trade/_ui/DepositModal";

const DesktopTrade = () => {
  const t = useTranslations();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  const { data: user } = useGetMeQuery(undefined);
  const { data: history = [], isLoading: loadingHistory } =
    useGetTransactionHistoryQuery(undefined);

  const columns: Column<any>[] = [
    {
      header: t("ASSET"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
            {getLogoUrl(item?.website) ? (
              <img
                src={getLogoUrl(item?.website)}
                alt=""
                className="w-6 h-6 object-contain"
              />
            ) : (
              <span className="text-[10px] font-black text-brand">
                {item?.symbol?.slice(0, 3)}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
              {item?.symbol}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              {item?.side}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: t("DATE"),
      render: (item) => (
        <span className="text-xs font-bold text-slate-500">
          {formatDate(item?.date)}
        </span>
      ),
    },
    {
      header: t("AMOUNT"),
      align: "right",
      render: (item) => (
        <span
          className={`text-sm font-black ${item?.side === "BUY" ? "text-slate-900 dark:text-white" : "text-up"}`}
        >
          {item?.side === "BUY" ? "-" : "+"}₺
          {formatCurrency(item?.executionPrice)}
        </span>
      ),
    },
    {
      header: t("STATUS"),
      align: "right",
      render: (item) => <StatusBadge status={item?.status} />,
    },
  ];

  return (
    <div className="hidden md:flex flex-col gap-8 p-8 min-h-screen box">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Balance Card */}
        <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-brand/10">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="text-brand" size={16} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {t("TOTAL_BALANCE")}
              </p>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight">
              ₺{formatCurrency(user?.balance)}
            </h2>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsDepositOpen(true)}
                className="flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all cursor-pointer"
              >
                <ArrowUpCircle size={18} /> {t("DEPOSIT")}
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all cursor-pointer"
              >
                <ArrowDownCircle size={18} /> {t("WITHDRAW")}
              </button>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t("FROZEN_BALANCE")}
              </p>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ₺{formatCurrency(user?.frozenBalance || 0)}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-2 leading-tight">
              {t("FROZEN_DESC")}
            </p>
          </div>
          {/* Subtle icon watermark */}
          <History className="absolute -right-4 -bottom-4 text-slate-50 dark:text-white/5 w-24 h-24 -rotate-12" />
        </div>

        {/* RIGHT: KYC & Stats */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {!user?.kyc?.status && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-4xl p-6">
              <ShieldCheck className="text-amber-500 mb-3" size={24} />
              <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">
                {t("KYC_TITLE")}
              </p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                {t("KYC_DESC")}
              </p>
              <button className="cursor-pointer w-full bg-amber-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
                {t("START_VERIFICATION")}
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl p-6 flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              {t("ACCOUNT_STATS")}
            </p>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {t("LIMIT")}
                </span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  ₺50,000 / Day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {t("TIER")}
                </span>
                <span className="text-[10px] font-black text-brand uppercase tracking-tighter">
                  {user?.tier} / 3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div>
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {t("TRANSACTIONS")}
          </h3>
        </div>
        <DataTable
          data={history}
          columns={columns}
          itemsPerPage={8}
          isLoading={loadingHistory}
          minWidth="800px"
        />
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
    </div>
  );
};

export default DesktopTrade;
