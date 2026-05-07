"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Shield,
  Wallet,
  CreditCard,
  Bell,
  ArrowUpRight,
  Download,
  Plus,
  ChevronRight,
  AlertCircle,
  Zap,
  BadgeCheck,
  Calendar,
  Clock,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  EyeOff,
  Eye,
  Loader2,
  CircleCheckBig,
  Smartphone,
  Trash2,
  Star,
  History,
  Ticket,
  UserPen,
  ArrowLeftRight,
  Upload,
  X,
  CheckCircle2,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  Filter,
  XCircle,
  PhoneCall,
  Search,
  Building2,
  ArrowDownRight,
} from "lucide-react";
import {
  useGetMeQuery,
  useGetMyStatsQuery,
  useGetUserActivityQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from "@/lib/redux/services/user.api";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { selectCurrentUser } from "@/lib/redux/features/auth.slice";
import { formatCurrency, formatDate, getLogoUrl } from "@/lib/helpers";
import { Form, Input, Modal, Popconfirm, Select, Tooltip } from "antd";
import toast from "react-hot-toast";
import { ActivityType, MFAEnum } from "@/lib/types";
import {
  useActivateTotpMutation,
  useChangePasswordMutation,
  useGetLoginHistoryQuery,
  useRevokeOtherSessionsMutation,
  useToggleMfaMutation,
  useTotpSetupMutation,
} from "@/lib/redux/services/auth.api";
import {
  useAddPaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useSetPrimaryMethodMutation,
} from "@/lib/redux/services/payment.api";
import {
  useGetWalletHistoryQuery,
  useRequestWithdrawalMutation,
} from "@/lib/redux/services/wallet.api";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useUpdateNotificationSettingsMutation,
} from "@/lib/redux/services/notification.api";
import { useSubmitKYCMutation } from "@/lib/redux/services/kyc.api";
import DepositModal from "../../(trade)/trade/_ui/DepositModal";
import { useSearchParams } from "next/navigation";
import { tradeApi, useGetPositionsQuery } from "@/lib/redux/services/trade.api";
import { io } from "socket.io-client";
import SellModal from "./_ui/SellModal";
import { useTranslations } from "next-intl";
import StatusBadge from "@/components/StatusBadge";

export default function ProfilePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const { data: user, isLoading } = useGetMeQuery(undefined);

  const { data: notifications = [] } = useGetNotificationsQuery();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const menuItems = [
    { id: "overview", label: t("TAB_OVERVIEW"), icon: <User size={18} /> },
    { id: "wallet", label: t("TAB_WALLET"), icon: <Wallet size={18} /> },
    { id: "assets", label: t("TAB_ASSETS"), icon: <LayoutGrid size={18} /> },
    {
      id: "payments",
      label: t("TAB_PAYMENTS"),
      icon: <CreditCard size={18} />,
    },
    { id: "security", label: t("TAB_SECURITY"), icon: <Shield size={18} /> },
    {
      id: "notifications",
      label: t("TAB_NOTIFICATIONS"),
      icon: <Bell size={18} />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
  };

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  if (isLoading)
    return (
      <div className="p-20 text-center font-black uppercase">
        {t("LOADING_PROFILE")}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-bg text-fg overflow-hidden">
      {/* --- Sidebar Navigation --- */}
      <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-4">
          {t("ACCOUNT_SETTINGS")}
        </h2>
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`shrink-0 cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                activeTab === item.id
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>

              {item.id === "notifications" && unreadCount > 0 && (
                <span
                  className={`flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[9px] font-black leading-none bg-down text-white`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "wallet" && <WalletSection user={user} />}
          {activeTab === "payments" && <PaymentsSection />}
          {activeTab === "overview" && (
            <OverviewSection user={user} setActiveTab={setActiveTab} />
          )}
          {activeTab === "security" && <SecuritySection user={user} />}
          {activeTab === "notifications" && (
            <NotificationsSection user={user} />
          )}
          {activeTab === "assets" && <AssetsSection />}
        </div>
      </main>
    </div>
  );
}

// ============================ SECTIONS ============================

function WalletSection({ user }: { user: Record<string, any> | null }) {
  const t = useTranslations();
  const [form] = Form.useForm();
  const [addPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const { data: methods, isLoading: methodsLoading } =
    useGetPaymentMethodsQuery();
  const [status, setStatus] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | undefined
  >(undefined);
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAWAL">("WITHDRAWAL");
  const [withdraw, { isLoading: isSubmitting }] =
    useRequestWithdrawalMutation();
  const { data: history, isLoading: historyLoading } = useGetWalletHistoryQuery(
    { status, type },
  );
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [addMethod] = useAddPaymentMethodMutation();

  const transactionColumns: Column<any>[] = [
    {
      header: t("COL_DATE"),
      render: (tx) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-fg tabular-nums">
            {new Date(tx.createdAt).toLocaleDateString()}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(tx.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      header: t("COL_TYPE"),
      render: (tx) => (
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
            tx.type === "DEPOSIT"
              ? "bg-up/10 text-up"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}
        >
          {tx.type === "DEPOSIT" ? t("DEPOSITS") : t("WITHDRAWALS")}
        </span>
      ),
    },
    {
      header: t("COL_METHOD"),
      render: (tx) => (
        <div>
          <p className="text-[10px] font-black uppercase text-fg">
            {tx.paymentMethod?.name || t("SYSTEM_CREDIT")}
          </p>
          <p className="text-[9px] font-mono text-slate-500 truncate max-w-37.5">
            {tx.paymentMethod?.detail || t("DIRECT_DEPOSIT")}
          </p>
        </div>
      ),
    },
    {
      header: t("COL_AMOUNT"),
      render: (tx) => (
        <span
          className={`text-sm font-black tabular-nums ${tx.type === "WITHDRAWAL" ? "text-red-500" : "text-up"}`}
        >
          {tx.type === "WITHDRAWAL" ? "-" : "+"}
          {formatCurrency(tx.amount)} <span className="text-[10px]">TRY</span>
        </span>
      ),
    },
    {
      header: t("COL_STATUS"),
      align: "right",
      render: (tx) => {
        const statusStyles = {
          PENDING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
          APPROVED: "bg-up/10 text-up border-up/20",
          REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
        };

        const statusLabels = {
          PENDING: t("STATUS_PENDING"),
          APPROVED: t("STATUS_APPROVED"),
          REJECTED: t("STATUS_REJECTED"),
        };

        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${statusStyles[tx.status as keyof typeof statusStyles]}`}
          >
            {tx.status === "PENDING" && (
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            )}
            {statusLabels[tx.status as keyof typeof statusLabels]}
          </div>
        );
      },
    },
    {
      header: t("ACTIONS"),
      align: "right",
      render: (tx) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedHistory(tx)}
            className="p-2 rounded-lg bg-gray-300/10 text-gray-500 hover:bg-gray-500 hover:text-white transition-all cursor-pointer"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleWithdrawal = async () => {
    if (!amount || amount <= 0) return toast.error(t("ERROR_INVALID_AMOUNT"));
    if (!selectedMethodId) return toast.error(t("ERROR_SELECT_METHOD"));
    if (amount > (user?.balance || 0))
      return toast.error(t("ERROR_INSUFFICIENT"));

    try {
      await withdraw({ amount, paymentMethodId: selectedMethodId }).unwrap();
      toast.success(t("SUCCESS_SUBMITTED"));
      setAmount(null);
    } catch (err: any) {
      toast.error(err?.data?.message || t("FAILED_WITHDRAWAL"));
    }
  };

  const handleAdd = async (values: any) => {
    try {
      await addMethod(values).unwrap();
      toast.success(t("METHOD_ADDED_SUCCESS"));
      setIsAddPaymentModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      toast.error(err.data?.message || t("FAILED_ADD_METHOD"));
    }
  };

  const handleOpenDeposit = () => setIsDepositModalOpen(true);

  useEffect(() => {
    if (methods) {
      const primary = methods.find((m) => m.isDefault);
      if (primary) setSelectedMethodId(primary.id);
    }
  }, [methods]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">
          {t("WALLET_TITLE")}
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-2">
          {t("WALLET_SUBTITLE")}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 dark:bg-white p-8 rounded-4xl text-white dark:text-black relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
            {t("TOTAL_BALANCE")}
          </p>
          <h2 className="text-4xl font-black mt-2 tabular-nums">
            {formatCurrency(user?.balance)}{" "}
            <span className="text-lg ml-2">TRY</span>
          </h2>
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleOpenDeposit}
              className="cursor-pointer bg-brand text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              {t("DEPOSIT_BTN")}
            </button>
          </div>
          <Wallet
            className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform"
            size={120}
          />
        </div>

        <div className="border border-slate-200 dark:border-slate-800 p-8 rounded-4xl flex flex-col justify-between bg-white dark:bg-slate-900/20">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t("PENDING_WITHDRAWALS")}
            </p>
            <h2 className="text-3xl font-black mt-1 tabular-nums text-orange-500">
              {formatCurrency(user?.frozenBalance)}{" "}
              <span className="text-sm">TRY</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase">
            <ArrowUpRight size={14} /> {t("LOCKED_REVIEW")}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10">
        <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 italic">
          <Download size={18} className="text-brand" />{" "}
          {t("PROCESS_WITHDRAWAL")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest">
              {t("SELECT_VERIFIED_METHOD")}
            </label>
            <div className="space-y-3">
              {methodsLoading ? (
                <div className="h-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ) : methods?.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    {t("NO_VERIFIED_METHODS")}
                  </p>
                  <button
                    onClick={() => setIsAddPaymentModalOpen(true)}
                    className="cursor-pointer text-brand text-[10px] font-black uppercase mt-2 hover:underline"
                  >
                    {t("ADD_METHOD")}
                  </button>
                </div>
              ) : (
                methods?.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      selectedMethodId === method.id
                        ? "border-brand bg-brand/5 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      {method.type === "Bank Account" ? (
                        <CreditCard size={18} />
                      ) : (
                        <Zap size={18} />
                      )}
                      <div>
                        <p className="text-[10px] font-black uppercase leading-none">
                          {method.name}
                        </p>
                        <p className="text-[9px] font-mono mt-1 opacity-60">
                          {method.detail}
                        </p>
                      </div>
                    </div>
                    {selectedMethodId === method.id && (
                      <div className="h-2 w-2 rounded-full bg-brand" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest flex justify-between">
                <span>{t("AMOUNT_TO_WITHDRAW")}</span>
                <span className="opacity-50">
                  {t("FEE")}: {formatCurrency(0.0)} TRY
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder={formatCurrency(0.0)}
                  className="w-full bg-white dark:bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-brand transition-colors tabular-nums"
                />
                <button
                  onClick={() => setAmount(user?.balance || 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand uppercase hover:underline"
                >
                  {t("MAX")}
                </button>
              </div>
            </div>

            <button
              disabled={isSubmitting || !amount}
              onClick={handleWithdrawal}
              className="cursor-pointer w-full bg-fg text-bg dark:bg-white dark:text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("PROCESSING_REQUEST") : t("CONFIRM_WITHDRAWAL")}
            </button>

            <p className="text-[9px] text-center text-down font-bold uppercase tracking-widest leading-relaxed">
              {t("WITHDRAWAL_DISCLAIMER")}
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 italic">
            <History size={18} className="text-brand" />{" "}
            {t("TRANSACTION_HISTORY")}
          </h3>
        </div>

        <div>
          <div className="flex items-end justify-end gap-4 mb-4">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
              <button
                onClick={() => setType("WITHDRAWAL")}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${type === "WITHDRAWAL" ? "bg-white dark:bg-slate-800 shadow-sm text-brand" : "text-slate-500"}`}
              >
                {t("WITHDRAWALS")}
              </button>
              <button
                onClick={() => setType("DEPOSIT")}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${type === "DEPOSIT" ? "bg-white dark:bg-slate-800 shadow-sm text-brand" : "text-slate-500"}`}
              >
                {t("DEPOSITS")}
              </button>
            </div>

            <Select
              placeholder={
                <div className="flex items-center gap-2 text-slate-500 font-bold">
                  <Filter size={14} />
                  <span>{t("STATUS_FILTER")}</span>
                </div>
              }
              allowClear
              onChange={(value) => setStatus(value)}
              className="w-48 h-11.5 custom-select"
            >
              <Select.Option value="PENDING">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {t("STATUS_PENDING")}
                  </span>
                </div>
              </Select.Option>
              <Select.Option value="APPROVED">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-up"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {t("STATUS_APPROVED")}
                  </span>
                </div>
              </Select.Option>
              <Select.Option value="REJECTED">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {t("STATUS_REJECTED")}
                  </span>
                </div>
              </Select.Option>
            </Select>
          </div>
        </div>

        {historyLoading ? (
          <div className="h-64 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-3xl" />
        ) : history && history?.length > 0 ? (
          <DataTable
            data={history || []}
            columns={transactionColumns}
            itemsPerPage={5}
          />
        ) : (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              {t("NO_TRANSACTIONS")}
            </p>
          </div>
        )}
      </section>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      <Modal
        open={!!selectedHistory}
        onCancel={() => setSelectedHistory(null)}
        footer={null}
        centered
        title={
          <span className="font-black uppercase text-xs tracking-widest">
            {t("TX_DETAILS")}
          </span>
        }
        width={500}
      >
        {selectedHistory && (
          <div className="flex flex-col gap-6 py-4">
            {/* 1. Status & Amount Header */}
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {selectedHistory.type} {t("TOTAL")}
                </p>
                <p className="text-3xl font-black text-fg tracking-tighter">
                  {formatCurrency(selectedHistory.amount)}
                </p>
              </div>
              <StatusBadge status={selectedHistory.status} />
            </div>

            {/* 2. Target Bank Details (Only for Deposits) */}
            {selectedHistory.type === "DEPOSIT" &&
              selectedHistory.bankAccount && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <Building2 size={14} /> {t("DEPOSITED_TO")}
                  </h4>
                  <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl">
                    <p className="text-xs font-black text-brand uppercase">
                      {selectedHistory.bankAccount.bankName}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {selectedHistory.bankAccount.accountNumber}
                    </p>
                    <p className="text-[9px] font-medium text-slate-500 mt-1 italic">
                      Label: {selectedHistory.bankAccount.title}
                    </p>
                  </div>
                </div>
              )}

            {/* 3. Withdrawal Destination (Only for Withdrawals) */}
            {selectedHistory.type === "WITHDRAWAL" &&
              selectedHistory.paymentMethod && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-orange-500 border-b border-orange-100 dark:border-orange-900/30 pb-2 flex items-center gap-2">
                    <CreditCard size={14} /> {t("PAYOUT_DESTINATION")}
                  </h4>
                  <div className="p-5 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-3xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-tighter">
                          {t("METHOD_TYPE")}
                        </p>
                        <span className="text-xs font-black text-fg uppercase">
                          {selectedHistory.paymentMethod.type}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm">
                        {selectedHistory.paymentMethod.type === "CRYPTO" ? (
                          <Wallet size={20} className="text-orange-500" />
                        ) : (
                          <Building2 size={20} className="text-orange-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {t("ACCOUNT_NETWORK")}
                        </p>
                        <p className="text-sm font-bold text-fg">
                          {selectedHistory.paymentMethod.name}
                        </p>
                      </div>

                      <div className="group relative">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {t("ACCOUNT_WALLET")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-mono font-black text-brand break-all">
                            {selectedHistory.paymentMethod.detail}
                          </p>
                        </div>
                      </div>

                      {selectedHistory.paymentMethod.bankName && (
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {t("BANK_NAME")}
                          </p>
                          <p className="text-xs font-bold text-fg">
                            {selectedHistory.paymentMethod.bankName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* 5. Admin Note */}
            {selectedHistory.adminNote && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-red-500 border-b border-red-100 dark:border-red-900/30 pb-2 flex items-center gap-2">
                  <XCircle size={14} /> {t("ADMIN_NOTE")}
                </h4>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
                  <p className="text-xs font-medium text-red-800 dark:text-red-400 leading-relaxed">
                    {selectedHistory.adminNote}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ADD PAYMENT MODAL */}
      <Modal
        title={
          <span className="text-sm font-black uppercase italic tracking-widest">
            {t("ADD_PAYMENT_METHOD")}
          </span>
        }
        open={addPaymentModalOpen}
        onCancel={() => setIsAddPaymentModalOpen(false)}
        footer={null}
        centered
        className="custom-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          className="mt-6"
        >
          <Form.Item
            name="type"
            label={t("METHOD_TYPE")}
            rules={[{ required: true }]}
          >
            <Select placeholder={t("SELECT_TYPE")} className="h-12 rounded-xl">
              <Select.Option value="Bank Account">
                {t("TURKISH_BANK_IBAN")}
              </Select.Option>
              <Select.Option value="Crypto Wallet">
                {t("CRYPTO_WALLET")}
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label={t("PROVIDER_NAME")}
            rules={[{ required: true }]}
          >
            <Input
              placeholder={t("PROVIDER_PLACEHOLDER")}
              className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold"
            />
          </Form.Item>

          <Form.Item
            name="detail"
            label={t("ACCOUNT_DETAILS")}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue("type") === "Bank Account") {
                    const ibanRegex = /^TR[a-zA-Z0-9]{24}$/;
                    if (!value || ibanRegex.test(value.replace(/\s/g, "")))
                      return Promise.resolve();
                    return Promise.reject(
                      new Error(t("IBAN_VALIDATION_ERROR")),
                    );
                  }
                  if (!value || value.length > 25) return Promise.resolve();
                  return Promise.reject(
                    new Error(t("CRYPTO_VALIDATION_ERROR")),
                  );
                },
              }),
            ]}
          >
            <Input
              placeholder={t("IBAN_PLACEHOLDER")}
              className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-mono text-sm"
            />
          </Form.Item>

          <button
            type="submit"
            className="cursor-pointer w-full bg-brand text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all mt-4"
          >
            {t("VERIFY_SAVE_METHOD")}
          </button>
        </Form>
      </Modal>
    </div>
  );
}

function PaymentsSection() {
  const t = useTranslations();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: methods, isLoading: methodIsLoading } =
    useGetPaymentMethodsQuery();
  const [addMethod] = useAddPaymentMethodMutation();
  const [setPrimary] = useSetPrimaryMethodMutation();
  const [deleteMethod] = useDeletePaymentMethodMutation();

  const handleAdd = async (values: any) => {
    try {
      await addMethod(values).unwrap();
      toast.success(t("METHOD_ADDED_SUCCESS"));
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      toast.error(err.data?.message || t("FAILED_ADD_METHOD"));
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimary(id).unwrap();
      toast.success(t("PRIMARY_UPDATED"));
    } catch (err) {
      toast.error(t("FAILED_PRIMARY_UPDATE"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMethod(id).unwrap();
      toast.success(t("METHOD_REMOVED"));
    } catch (err: any) {
      toast.error(err.data?.message || t("FAILED_DELETE"));
    }
  };

  if (methodIsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse h-24 bg-slate-100 dark:bg-slate-900 rounded-4xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">
          {t("SAVED_PAYMENT_METHODS")}
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all"
        >
          <Plus size={14} /> {t("ADD_NEW")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {methods && methods.length > 0 ? (
          methods.map((card) => (
            <div
              key={card.id}
              className={`flex items-center justify-between p-6 border rounded-4xl transition-all duration-300 ${
                card.isDefault
                  ? "border-brand bg-brand/3 shadow-lg shadow-brand/5"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center gap-6">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                    card.isDefault
                      ? "bg-brand text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {card.type === "Bank Account" ? (
                    <Wallet size={24} />
                  ) : (
                    <Zap size={24} />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                    {card.type}
                  </p>
                  <h4 className="text-sm font-black uppercase mt-0.5 text-fg">
                    {card.name}
                  </h4>
                  <p className="text-xs font-mono text-slate-500 mt-1 tracking-tight">
                    {card.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <Tooltip title={t("SET_AS_PRIMARY")}>
                    <button
                      onClick={() => handleSetPrimary(card.id)}
                      className="cursor-pointer p-2.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-full transition-all"
                    >
                      <Star size={18} />
                    </button>
                  </Tooltip>
                )}
                {card.isDefault && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-up/10 text-up rounded-lg border border-up/20 mr-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-up animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {t("PRIMARY")}
                    </span>
                  </div>
                )}
                <Popconfirm
                  title={t("DELETE_METHOD")}
                  description={t("DELETE_CONFIRMATION")}
                  onConfirm={() => handleDelete(card.id)}
                  okText={t("DELETE")}
                  cancelText={t("CANCEL")}
                  okButtonProps={{
                    danger: true,
                    className: "rounded-lg font-bold",
                  }}
                >
                  <button className="cursor-pointer p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
                    <Trash2 size={18} />
                  </button>
                </Popconfirm>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-4xl">
            <CreditCard size={40} className="text-slate-300 mb-4" />
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              {t("NO_METHODS_FOUND")}
            </p>
          </div>
        )}
      </div>

      <Modal
        title={
          <span className="text-sm font-black uppercase italic tracking-widest">
            {t("ADD_PAYMENT_METHOD")}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        className="custom-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          className="mt-6"
        >
          <Form.Item
            name="type"
            label={t("METHOD_TYPE")}
            rules={[{ required: true }]}
          >
            <Select placeholder={t("SELECT_TYPE")} className="h-12 rounded-xl">
              <Select.Option value="Bank Account">
                {t("TURKISH_BANK_IBAN")}
              </Select.Option>
              <Select.Option value="Crypto Wallet">
                {t("CRYPTO_WALLET")}
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label={t("PROVIDER_NAME")}
            rules={[{ required: true }]}
          >
            <Input
              placeholder={t("PROVIDER_PLACEHOLDER")}
              className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-bold"
            />
          </Form.Item>

          <Form.Item
            name="detail"
            label={t("ACCOUNT_DETAILS")}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue("type") === "Bank Account") {
                    const ibanRegex = /^TR[a-zA-Z0-9]{24}$/;
                    if (!value || ibanRegex.test(value.replace(/\s/g, "")))
                      return Promise.resolve();
                    return Promise.reject(
                      new Error(t("IBAN_VALIDATION_ERROR")),
                    );
                  }
                  if (!value || value.length > 25) return Promise.resolve();
                  return Promise.reject(
                    new Error(t("CRYPTO_VALIDATION_ERROR")),
                  );
                },
              }),
            ]}
          >
            <Input
              placeholder={t("IBAN_PLACEHOLDER")}
              className="h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-mono text-sm"
            />
          </Form.Item>

          <button
            type="submit"
            className="cursor-pointer w-full bg-brand text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all mt-4"
          >
            {t("VERIFY_SAVE_METHOD")}
          </button>
        </Form>
      </Modal>
    </div>
  );
}

function OverviewSection({
  user,
  setActiveTab,
}: {
  user: Record<string, any> | null;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  const t = useTranslations();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [
    updateAvatar,
    {
      isLoading: isUpdating,
      isSuccess: updateAvatarSuccess,
      error: updateAvatarError,
    },
  ] = useUpdateAvatarMutation();
  const [
    updateProfile,
    {
      isLoading: isProfileUpdating,
      isSuccess: updateProfileSuccess,
      error: updateProfileError,
    },
  ] = useUpdateProfileMutation();
  const { data: activities, refetch: refetchActivity } =
    useGetUserActivityQuery(undefined);

  const { data: myStat, isLoading: myStatIsLoading } =
    useGetMyStatsQuery(undefined);

  const getIcon = (type: ActivityType) => {
    const iconClass = "text-brand";
    switch (type) {
      case "LOGIN":
        return <Clock size={16} className={iconClass} />;
      case "WITHDRAWAL":
        return <ArrowUpRight size={16} className={iconClass} />;
      case "SECURITY":
        return <Shield size={16} className={iconClass} />;
      case "TRADE":
        return <Ticket size={16} className={iconClass} />;
      case "PROFILE":
        return <UserPen size={16} className={iconClass} />;
      case "TRANSACTION":
        return <ArrowLeftRight size={16} className={iconClass} />;
      default:
        return <Zap size={16} />;
    }
  };

  useEffect(() => {
    if (updateAvatarSuccess) {
      refetchActivity();
      toast.success(t("AVATAR_UPDATE_SUCCESS"));
    }
    if (updateProfileSuccess) {
      refetchActivity();
      toast.success(t("PROFILE_UPDATE_SUCCESS"));
    }

    const handleError = (error: any) => {
      const message = Array.isArray(error?.data?.message)
        ? error?.data?.message?.join(", ")
        : error?.data?.message || t("REQUEST_FAILED");
      toast.error(message);
    };

    if (updateAvatarError) handleError(updateAvatarError);
    if (updateProfileError) handleError(updateProfileError);
  }, [
    updateAvatarSuccess,
    updateAvatarError,
    updateProfileSuccess,
    updateProfileError,
    t,
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Identity Header */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <label className="cursor-pointer block relative">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) updateAvatar(file);
              }}
              disabled={isUpdating}
            />
            <div
              className={`h-24 w-24 rounded-full bg-linear-to-tr from-brand to-up p-1 transition-opacity ${isUpdating ? "opacity-50" : "opacity-100"}`}
            >
              <div className="h-full w-full rounded-full bg-bg flex items-center justify-center overflow-hidden">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black">
                    {user?.fullname?.substring(0, 2).toUpperCase() || "BY"}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={20} className="text-white" />
            </div>
          </label>
          <div className="absolute -bottom-1 -right-1 bg-brand text-white p-1.5 rounded-full border-4 border-bg">
            <BadgeCheck size={16} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-fg">
              {user?.fullname}
            </h1>
            <span className="w-fit mx-auto md:mx-0 px-3 py-1 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-full border border-brand/20">
              {user?.tag} | {user?.role.name}
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-tight">
            {user?.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {t("JOINED")}{" "}
                {formatDate(user?.createdAt)}
              </span>
            )}
            {user?.phoneNumber && (
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> {user?.phoneNumber}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {user?.email}
            </span>
          </div>
        </div>
      </div>

      <Modal
        title={
          <span className="font-black uppercase tracking-widest italic">
            {t("EDIT_LEXER_PROFILE")}
          </span>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isProfileUpdating}
        okText={t("SAVE_CHANGES")}
        okButtonProps={{
          className:
            "bg-brand font-black uppercase text-[10px] tracking-widest rounded-lg h-10",
        }}
        cancelButtonProps={{
          className:
            "font-black uppercase text-[10px] tracking-widest rounded-lg h-10",
        }}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => updateProfile(v).then(() => setIsModalOpen(false))}
          className="mt-6"
        >
          <Form.Item
            name="fullname"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("FULL_NAME")}
              </span>
            }
            rules={[{ required: true, message: t("FULL_NAME_REQ") }]}
          >
            <Input
              className="rounded-xl py-3 font-bold"
              placeholder="John Doe"
            />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("PHONE_NUMBER")}
              </span>
            }
          >
            <Input
              className="rounded-xl py-3 font-bold"
              placeholder="+90 ..."
            />
          </Form.Item>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-[10px] font-medium text-amber-700 dark:text-amber-500 leading-relaxed">
              {t("PROFILE_NOTE")}
            </p>
          </div>
        </Form>
      </Modal>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {myStatIsLoading ? (
            // Skeleton Loaders
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"
                />
              ))
          ) : (
            <>
              <MetricCard
                label={t("WIN_RATE")}
                value={`${myStat?.winRate.toFixed(1)}%`}
                subValue={t("TOTAL_WINS_X")}
                isPositive={myStat?.winRate >= 50}
              />
              <MetricCard
                label={t("TOTAL_TRADES")}
                value={myStat?.totalTrades.toLocaleString()}
                subValue={t("INVESTED_X", {
                  amount: formatCurrency(myStat?.totalInvested),
                })}
                isPositive={null}
              />
              <MetricCard
                label={t("AVG_PROFIT")}
                value={formatCurrency(myStat?.avgProfit)}
                subValue={t("PER_WINNING_TRADE")}
                isPositive={true}
              />
              <MetricCard
                label={t("BALANCE")}
                value={myStat?.balance.toFixed(2)}
                subValue={
                  myStat?.profitFactor >= 2 ? t("INSTITUTIONAL") : t("RETAIL")
                }
                isPositive={myStat?.profitFactor >= 1}
              />
            </>
          )}
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-4xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {t("SECURITY_STATUS")}
            </h4>
            <div className="space-y-3">
              <SecurityItem
                label={t("TWO_FA_AUTH")}
                active={user?.isTwoFactorEnabled}
              />
            </div>
          </div>
          <button
            onClick={() => setActiveTab("security")}
            className="cursor-pointer mt-8 group flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            {t("MANAGE_SECURITY")}{" "}
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 ml-4">
          {t("RECENT_ACTIVITY")}
        </h3>
        <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl overflow-hidden">
          {activities?.map((activity: any) => (
            <ActivityRow
              key={activity.id}
              type={activity.type}
              detail={activity.description}
              time={formatDate(activity.createdAt)}
              icon={getIcon(activity.type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySection({ user }: { user: Record<string, any> | null }) {
  const t = useTranslations();
  const isTotpActive = user?.isTwoFactorEnabled && user?.mfaMethod === "TOTP";
  const isEmailActive = user?.isTwoFactorEnabled && user?.mfaMethod === "EMAIL";
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [totp, setTotp] = useState({
    code: "",
    secret: "",
  });
  const [showCurrrentPassword, setShowCurrrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const kycStatus = user?.kyc?.status;
  const isVerified = kycStatus === "ACTIVE";
  const isPending = kycStatus === "PENDING";
  const isRejected = kycStatus === "INACTIVE";

  const [
    revokeOthers,
    { isLoading: isRevoking, isSuccess: revokeIsSuccess, error: revokeError },
  ] = useRevokeOtherSessionsMutation();
  const [
    changePassword,
    { isLoading, isSuccess: updatePassowrdSuccess, error: updatePassowrdError },
  ] = useChangePasswordMutation();
  const { data: history, refetch: refetchLoginHistory } =
    useGetLoginHistoryQuery(undefined);
  const { refetch: refetchGetMe } = useGetMeQuery(undefined);
  const [toggleMfa] = useToggleMfaMutation();
  const [setupTotp, { data: setupTotpData }] = useTotpSetupMutation();
  const [
    activateTotp,
    {
      isLoading: activateTotpLoading,
      isSuccess: activateTotpIsSuccess,
      error: activateTotpError,
    },
  ] = useActivateTotpMutation();

  const [kycFiles, setKycFiles] = useState<{
    document: File | null;
    selfie: File | null;
  }>({ document: null, selfie: null });
  const [kycData, setKycData] = useState({
    documentType: "passport",
    country: "Turkey",
  });
  const [submitKYC, { isLoading: isSubmittingKYC }] = useSubmitKYCMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async () => {
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      }).unwrap();
    } catch (err: any) {
      console.error(err?.data?.message || t("FAIL_UPDATE_PASSWORD"));
    }
  };

  const handleRevokeOthers = async () => {
    if (window.confirm(t("REVOKE_CONFIRM"))) {
      try {
        await revokeOthers(undefined).unwrap();
      } catch (err: any) {
        console.error(t("FAIL_REVOKE"));
      }
    }
  };

  const handleActivateTotp = async () => {
    try {
      await activateTotp({ code: totp.code, secret: totp.secret }).unwrap();
    } catch (err: any) {
      console.error(err?.data?.message || t("FAIL_UPDATE_PASSWORD"));
    }
  };

  const handleToggle = async (
    method: "TOTP" | "EMAIL",
    currentStatus: boolean,
  ) => {
    try {
      const methodEnum = method === "TOTP" ? MFAEnum.TOTP : MFAEnum.EMAIL;
      if (currentStatus) {
        await toggleMfa({ method: methodEnum, status: false }).unwrap();
        toast.success(t("MFA_DEACTIVATED"));
      } else {
        await toggleMfa({ method: methodEnum }).unwrap();
        toast.success(`${t("MFA_SWITCHED")} ${method}`);
      }
      refetchGetMe();
    } catch (err: any) {
      const message = err?.data?.message || t("FAIL_ACTION");
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const handleKYCUpload = async () => {
    if (!kycFiles.document || !kycFiles.selfie) {
      return toast.error(t("KYC_FILE_ERROR"));
    }

    const formData = new FormData();
    formData.append("document", kycFiles.document);
    formData.append("selfie", kycFiles.selfie);
    formData.append("documentType", kycData.documentType);
    formData.append("country", kycData.country);

    try {
      await submitKYC(formData).unwrap();
      toast.success(t("KYC_SUCCESS"));
      setKycFiles({ document: null, selfie: null });
      refetchGetMe();
    } catch (err: any) {
      toast.error(err?.data?.message || t("FAIL_ACTION"));
    }
  };

  useEffect(() => {
    if (updatePassowrdSuccess) {
      toast.success(t("SAVE_CHANGES"));
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    if (revokeIsSuccess) {
      refetchLoginHistory();
      toast.success(t("REVOKE_SUCCESS"));
    }
    if (activateTotpIsSuccess) {
      refetchGetMe();
      toast.success(t("TWO_FA_ACTIVATED"));
    }
    // Shared Error Handler Logic
    const handleError = (error: any) => {
      if (error) {
        const errData = error as any;
        const message = Array.isArray(errData?.data?.message)
          ? errData?.data?.message?.join(", ")
          : errData?.data?.message || t("FAIL_ACTION");
        toast.error(message);
      }
    };
    handleError(updatePassowrdError);
    handleError(revokeError);
    handleError(activateTotpError);
  }, [
    updatePassowrdSuccess,
    updatePassowrdError,
    revokeIsSuccess,
    revokeError,
    activateTotpIsSuccess,
    activateTotpError,
    t,
  ]);

  useEffect(() => {
    if (twoFactorEnabled) setupTotp(undefined);
  }, [twoFactorEnabled]);

  useEffect(() => {
    if (setupTotpData?.secret)
      setTotp((prev) => ({ ...prev, secret: setupTotpData.secret }));
  }, [setupTotpData]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            {t("SECURITY_CENTER_TITLE")}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">
            {t("SECURITY_CENTER_SUBTITLE")}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
            {t("ACCOUNT_SAFETY")}
          </p>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full ${i < Number(user?.tier) ? "bg-up" : "bg-slate-200 dark:bg-slate-800"}`}
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase text-up mt-1">
            {t("HIGH_PROTECTION")}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Password Update */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock size={18} className="text-brand" /> {t("UPDATE_PASSWORD")}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 relative">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                  {t("CURRENT_PASSWORD")}
                </label>
                <input
                  onChange={handleInputChange}
                  name="currentPassword"
                  placeholder={t("PASSWORD_PLACEHOLDER")}
                  type={showCurrrentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrrentPassword(!showCurrrentPassword)}
                  className="absolute right-4 top-1/2 text-slate-400 hover:text-fg cursor-pointer"
                >
                  {showCurrrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                    {t("NEW_PASSWORD")}
                  </label>
                  <input
                    name="newPassword"
                    onChange={handleInputChange}
                    value={passwords.newPassword}
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t("PASSWORD_PLACEHOLDER")}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 text-slate-400 hover:text-fg cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                    {t("CONFIRM_PASSWORD")}
                  </label>
                  <input
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleInputChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("PASSWORD_PLACEHOLDER")}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-black outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 text-slate-400 hover:text-fg cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="cursor-pointer mt-6 bg-fg text-bg dark:bg-white dark:text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand transition-all disabled:opacity-50"
            >
              {isLoading ? t("UPDATING") : t("SAVE_CHANGES")}
            </button>
          </div>

          {/* 2FA Setup */}
          <div
            className={`bg-bg border rounded-4xl p-8 transition-all ${twoFactorEnabled ? "border-up/30 bg-up/5" : "border-slate-200 dark:border-slate-800"}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className={twoFactorEnabled ? "text-up" : "text-slate-400"}
                  />
                  {t("TWO_FACTOR_TITLE")}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">
                  {t("TWO_FACTOR_DESC")}
                </p>
              </div>
              {!user?.mfaSecret ? (
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!twoFactorEnabled ? "bg-up" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!twoFactorEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              ) : (
                <CircleCheckBig className="text-up" />
              )}
            </div>

            {!user?.mfaSecret && !twoFactorEnabled && (
              <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="bg-white p-3 rounded-2xl border-4 border-slate-100">
                  <div className="h-32 w-32">
                    <img
                      src={setupTotpData?.qrCodeImageUrl}
                      alt="totp-qr-code"
                      className="bg-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t("TOTP_STEP_1")}
                    <br />
                    {t("TOTP_STEP_2")}
                    <br />
                    {t("TOTP_STEP_3")}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      name="code"
                      value={totp.code}
                      type="text"
                      maxLength={6}
                      placeholder="000 000"
                      onChange={(e) =>
                        setTotp((prev) => ({
                          ...prev,
                          code: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className="w-full bg-bg border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-center text-lg font-black tracking-[0.2em] outline-none focus:border-brand"
                    />
                    <button
                      onClick={handleActivateTotp}
                      className="cursor-pointer bg-brand text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest py-3"
                    >
                      {activateTotpLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <span>{t("ACTIVATE")}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MFA Toggles */}
          <div className="space-y-4">
            <div
              className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${isTotpActive ? "border-up/30 bg-up/5" : "border-transparent bg-slate-50 dark:bg-slate-900/50"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isTotpActive ? "bg-up text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">
                    {t("AUTHENTICATOR_APP")}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase italic">
                    {t("RECOMMENDED")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("TOTP", isTotpActive)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isTotpActive ? "bg-up" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTotpActive ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            <div
              className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${isEmailActive ? "border-up/30 bg-up/5" : "border-transparent bg-slate-50 dark:bg-slate-900/50"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isEmailActive ? "bg-up text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">
                    {t("EMAIL_OTP")}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase italic">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("EMAIL", isEmailActive)}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEmailActive ? "bg-up" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEmailActive ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>

          {/* KYC Section */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    className={isVerified ? "text-up" : "text-brand"}
                  />
                  {t("KYC_TITLE")}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">
                  {isVerified
                    ? t("KYC_DESC_VERIFIED")
                    : t("KYC_DESC_UNVERIFIED")}
                </p>
              </div>
              {kycStatus && (
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isVerified ? "bg-up/10 text-up" : isPending ? "bg-orange-500/10 text-orange-500" : "bg-down/10 text-down"}`}
                >
                  {isVerified
                    ? t("KYC_STATUS_APPROVED")
                    : isRejected
                      ? t("KYC_STATUS_REJECTED")
                      : t("KYC_STATUS_PENDING")}
                </div>
              )}
            </div>

            {isVerified || isPending ? (
              <div className="p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center bg-slate-50/30">
                <div
                  className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-4 ${isVerified ? "bg-up text-white" : "bg-orange-500/10 text-orange-500 animate-pulse"}`}
                >
                  {isVerified ? (
                    <CheckCircle2 size={36} />
                  ) : (
                    <Clock size={36} />
                  )}
                </div>
                <h4 className="text-lg font-black uppercase tracking-tight text-fg">
                  {isVerified
                    ? t("KYC_COMPLETE_TITLE")
                    : t("KYC_PENDING_TITLE")}
                </h4>
                <p className="max-w-xs mx-auto text-xs text-slate-500 font-medium mt-2">
                  {isVerified ? t("KYC_COMPLETE_DESC") : t("KYC_PENDING_DESC")}
                </p>
                {isPending && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase text-slate-400">
                    <Loader2 size={12} className="animate-spin" />{" "}
                    {t("AWAITING_APPROVAL")}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {isRejected && (
                  <div className="p-5 bg-down/5 border border-down/20 rounded-2xl flex gap-4 items-start">
                    <AlertCircle className="text-down shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-black uppercase text-down tracking-widest mb-1">
                        {t("VERIFICATION_REJECTED")}
                      </p>
                      <p className="text-xs font-bold text-slate-600">
                        {user?.kyc?.rejectionReason || t("SECURITY_TIP_DESC")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                      {t("DOCUMENT_TYPE")}
                    </label>
                    <select
                      value={kycData.documentType}
                      onChange={(e) =>
                        setKycData({ ...kycData, documentType: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-brand"
                    >
                      <option value="passport">{t("PASSPORT")}</option>
                      <option value="id-card">{t("ID_CARD")}</option>
                      <option value="driver-license">
                        {t("DRIVER_LICENSE")}
                      </option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                      {t("COUNTRY_ISSUE")}
                    </label>
                    <input
                      type="text"
                      value={kycData.country}
                      onChange={(e) =>
                        setKycData({ ...kycData, country: e.target.value })
                      }
                      placeholder="e.g. Turkey"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-brand"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadBox
                    label={t("DOCUMENT_PHOTO")}
                    onFileSelect={(file) =>
                      setKycFiles((prev) => ({ ...prev, document: file }))
                    }
                    file={kycFiles.document}
                  />
                  <FileUploadBox
                    label={t("SELFIE_PHOTO")}
                    onFileSelect={(file) =>
                      setKycFiles((prev) => ({ ...prev, selfie: file }))
                    }
                    file={kycFiles.selfie}
                  />
                </div>
                <button
                  onClick={handleKYCUpload}
                  disabled={
                    isSubmittingKYC || !kycFiles.document || !kycFiles.selfie
                  }
                  className="w-full bg-fg text-bg dark:bg-white dark:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand transition-all disabled:opacity-30"
                >
                  {isSubmittingKYC ? (
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  ) : (
                    t("SUBMIT_DOCUMENTS")
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">
            {t("AUTHORIZED_DEVICES")}
          </h3>
          <div className="flex flex-col gap-4">
            {history?.map((item: any) => (
              <DeviceCard key={item?.id} data={item} />
            ))}
            <button
              onClick={handleRevokeOthers}
              disabled={isRevoking}
              className="cursor-pointer w-full py-4 border border-red-500/20 text-red-500 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            >
              {isRevoking ? t("REVOKING") : t("REVOKE_ALL")}
            </button>
          </div>
          <div className="p-6 bg-brand/5 border border-brand/20 rounded-4xl space-y-3">
            <div className="flex items-center gap-2 text-brand">
              <Zap size={16} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t("SECURITY_TIP_TITLE")}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 leading-normal">
              Bulls Yatirim{" "}
              <span className="text-fg font-black underline">asla</span>{" "}
              şifrenizi istemez. Giriş yaptığınız URL'yi kontrol edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ user }: { user: Record<string, any> | null }) {
  const t = useTranslations();
  const [filter, setFilter] = useState("all");

  const { data: notifications = [], isLoading } = useGetNotificationsQuery(
    undefined,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [updateSettings, { isLoading: isUpdatingSettings }] =
    useUpdateNotificationSettingsMutation();

  const filteredItems =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  // Handlers
  const handleMarkAllRead = async () => {
    await markAsRead({}).unwrap();
  };

  const handleMarkSingleRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    await markAsRead({ id }).unwrap();
  };

  const handleToggle = async (type: "push" | "email", currentVal: boolean) => {
    await updateSettings({
      [type === "push" ? "pushEnabled" : "emailEnabled"]: !currentVal,
    }).unwrap();
  };

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse font-black uppercase tracking-widest">
        {t("LOADING_FEED")}
      </div>
    );

  const filters = [
    { key: "all", label: t("FILTER_ALL") },
    { key: "trade", label: t("FILTER_TRADE") },
    { key: "wallet", label: t("FILTER_WALLET") },
    { key: "security", label: t("FILTER_SECURITY") },
    { key: "system", label: t("FILTER_SYSTEM") },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            {t("NOTIFICATIONS_TITLE")}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">
            {t("NOTIFICATIONS_SUBTITLE")}
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors"
        >
          {t("MARK_ALL_READ")}
        </button>
      </header>

      {/* --- Filter Bar --- */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`cursor-pointer px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f.key
                ? "bg-white dark:bg-slate-800 text-brand shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* --- Notification List --- */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-4xl text-slate-500 text-xs font-bold uppercase tracking-widest">
            {t("NO_NOTIFICATIONS_FOUND", {
              filter: t(`FILTER_${filter.toUpperCase()}`),
            })}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkSingleRead(item.id, item.isRead)}
              className={`cursor-pointer group relative flex items-start gap-5 p-6 rounded-4xl border transition-all ${
                !item.isRead
                  ? "bg-bg border-slate-200 dark:border-slate-700 shadow-md"
                  : "bg-transparent border-slate-100 dark:border-slate-900 opacity-60"
              } ${item.urgent ? "bg-red-500/5 border-red-500/20" : "hover:border-brand/40"}`}
            >
              <div
                className={`mt-2 h-2 w-2 rounded-full shrink-0 ${
                  item.urgent
                    ? "bg-red-500 animate-pulse"
                    : item.isRead
                      ? "bg-slate-700"
                      : "bg-brand"
                }`}
              />

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-black uppercase tracking-tight ${item.urgent ? "text-red-600 dark:text-red-400" : "text-fg"}`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter tabular-nums">
                    {formatDate(item?.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Notification Settings Toggle --- */}
      <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-1 text-center lg:text-left">
            <h3 className="text-sm font-black uppercase tracking-widest">
              {t("NOTIFICATION_CHANNELS")}
            </h3>
            <p className="text-xs text-slate-400 font-medium italic">
              {t("CHANNELS_SUBTITLE")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.emailEnabled}
                  onChange={() => handleToggle("email", !!user?.emailEnabled)}
                  disabled={isUpdatingSettings}
                />
                <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-brand transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                {t("EMAIL_ALERTS")}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.pushEnabled}
                  onChange={() => handleToggle("push", !!user?.pushEnabled)}
                  disabled={isUpdatingSettings}
                />
                <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-brand transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                {t("PUSH_NOTIFICATIONS")}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetsSection() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { data: positions, isLoading } = useGetPositionsQuery();
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenSellModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const columns: Column<any>[] = [
    {
      header: t("ASSET"),
      render: (pos) => {
        const logoUrl = getLogoUrl(pos.website);

        return (
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt={pos.symbol}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-[10px] uppercase z-[-1]">
                {pos.symbol.substring(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase">{pos.symbol}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">
                {t("BIST_EQUITY")}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: t("QUANTITY"),
      render: (pos) => (
        <span className="text-xs font-black">
          {pos.quantity} {t("LOT")}
        </span>
      ),
    },
    {
      header: t("AVG_COST"),
      render: (pos) => (
        <span className="text-xs font-bold tabular-nums">
          ₺{formatCurrency(pos.averageEntryPrice)}
        </span>
      ),
    },
    {
      header: t("CURRENT_VALUE"),
      render: (pos) => {
        const pnl = (pos.currentPrice - pos.averageEntryPrice) * pos.quantity;
        const isProfit = pnl >= 0;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-black tabular-nums">
              ₺{formatCurrency(pos.currentPrice)}
            </span>
            <div
              className={`flex items-center gap-0.5 text-[10px] font-black ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {formatCurrency(pnl)} {t("TRY")}
            </div>
          </div>
        );
      },
    },
    {
      header: t("TOTAL_COST"),
      render: (pos) => (
        <div className="flex flex-col">
          <span className="text-xs font-black tabular-nums">
            ₺{formatCurrency(pos.quantity * pos.averageEntryPrice)}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            {pos.quantity} × ₺{formatCurrency(pos.averageEntryPrice)}
          </span>
        </div>
      ),
    },
    {
      header: t("PNL"),
      render: (pos) => {
        const totalCost = pos.quantity * pos.averageEntryPrice;
        const currentEquity = pos.quantity * pos.currentPrice;
        const pnl = currentEquity - totalCost;
        const pnlPercentage = (pnl / totalCost) * 100;
        const isProfit = pnl >= 0;

        return (
          <div className="flex flex-col">
            <span
              className={`text-sm font-black tabular-nums ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? "+" : ""}₺{formatCurrency(pnl)}
            </span>
            <div
              className={`flex items-center gap-1 text-[10px] font-black ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {pnlPercentage.toFixed(2)}%
            </div>
          </div>
        );
      },
    },
    {
      header: t("TOTAL_EQUITY"),
      align: "right",
      render: (pos) => {
        const currentEquity = pos.quantity * pos.currentPrice;
        const totalCost = pos.quantity * pos.averageEntryPrice;
        const pnl = currentEquity - totalCost;
        const isProfit = pnl >= 0;

        return (
          <div className="flex flex-col items-end">
            <span className="text-sm font-black tabular-nums text-fg">
              ₺{formatCurrency(currentEquity)}
            </span>
            <span
              className={`text-[10px] flex items-center gap-1 font-bold ${isProfit ? "text-up" : "text-down"}`}
            >
              {isProfit ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{" "}
              {formatCurrency(Math.abs(pnl))}
            </span>
          </div>
        );
      },
    },
    {
      header: t("ACTIONS"),
      align: "right",
      render: (pos) => (
        <button
          onClick={() => handleOpenSellModal(pos)}
          className="cursor-pointer px-4 py-2 bg-down/10 text-down hover:bg-down hover:text-white rounded-lg text-[10px] font-black uppercase transition-all"
        >
          {t("SELL")}
        </button>
      ),
    },
  ];

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}/trade`);

    socket.on("marketUpdate", (allStocks) => {
      dispatch(
        tradeApi.util.updateQueryData("getPositions", undefined, (draft) => {
          draft.forEach((pos) => {
            const live = allStocks.find((s: any) => s.symbol === pos.symbol);
            if (live) {
              pos.currentPrice = live.price;
              pos.pnl = (live.price - pos.averageEntryPrice) * pos.quantity;
            }
          });
        }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">
          {t("PORTFOLIO_HOLDINGS")}
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-2">
          {t("PORTFOLIO_DESC")}
        </p>
      </header>

      {isLoading ? (
        <div className="h-64 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-3xl" />
      ) : positions && positions?.length > 0 ? (
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
          <DataTable data={positions} columns={columns} itemsPerPage={10} />
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <LayoutGrid size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            {t("PORTFOLIO_EMPTY")}
          </p>
        </div>
      )}

      {selectedAsset && (
        <SellModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          asset={selectedAsset}
        />
      )}
    </div>
  );
}

// ============================ SUB COMPONENTS ============================

function FileUploadBox({
  label,
  onFileSelect,
  file,
}: {
  label: string;
  onFileSelect: (file: File) => void;
  file: File | null;
}) {
  const t = useTranslations();

  return (
    <div className="relative">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
        {label}
      </label>
      <div className="group relative h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-transparent">
        {file ? (
          <div className="absolute inset-0 bg-up/10 flex flex-col items-center justify-center animate-in zoom-in-95">
            <CheckCircle2 size={24} className="text-up mb-1" />
            <span className="text-[10px] font-bold text-up truncate max-w-[80%]">
              {file.name}
            </span>
            <button
              onClick={() => onFileSelect(null as any)}
              className="absolute top-2 right-2 p-1 bg-white dark:bg-slate-800 rounded-md shadow-sm"
            >
              <X size={12} className="text-slate-500" />
            </button>
          </div>
        ) : (
          <>
            <Upload
              size={20}
              className="text-slate-400 group-hover:text-brand mb-2"
            />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-brand">
              {t("CLICK_TO_UPLOAD")}
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) =>
            e.target.files?.[0] && onFileSelect(e.target.files[0])
          }
        />
      </div>
    </div>
  );
}

function DeviceCard({ data }: { data: any }) {
  return (
    <div
      className={`p-5 rounded-3xl border transition-all ${data?.isCurrent ? "border-brand/30 bg-brand/5" : "border-slate-200 dark:border-slate-800 bg-bg"}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-black uppercase text-fg">
            {data?.device}
          </h4>
          <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase">
            {data?.ipAddress} | {data?.os}
          </p>
          <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase">
            {data?.browser}
          </p>
        </div>
        {data?.isCurrent && (
          <div className="h-2 w-2 rounded-full bg-up animate-pulse" />
        )}
      </div>
      <div className="mt-4 flex justify-between items-end">
        <span className="text-[9px] font-black uppercase text-slate-400">
          {data?.isCurrent ? "Current Session" : formatDate(data?.loginAt)}
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subValue,
  isPositive,
}: {
  label: string;
  value: string;
  subValue: string;
  isPositive: boolean | null;
}) {
  return (
    <div className="bg-bg border border-slate-200 dark:border-slate-800 p-6 rounded-4xl hover:border-brand/30 transition-all">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
        {label}
      </p>
      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-fg">
        {value}
      </h3>
      <p
        className={`text-[10px] font-bold mt-1 uppercase ${
          isPositive === null
            ? "text-slate-500"
            : isPositive
              ? "text-up"
              : "text-red-500"
        }`}
      >
        {subValue}
      </p>
    </div>
  );
}

function SecurityItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-300">{label}</span>
      {active ? (
        <span className="text-[9px] font-black uppercase text-up">Enabled</span>
      ) : (
        <span className="text-[9px] font-black uppercase text-red-400 cursor-pointer">
          Disabled
        </span>
      )}
    </div>
  );
}

function ActivityRow({
  type,
  detail,
  time,
  icon,
}: {
  type: string;
  detail: string;
  time: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-fg">{type}</h4>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
            {detail}
          </p>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
        {time}
      </span>
    </div>
  );
}
