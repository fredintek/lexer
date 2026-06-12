"use client";
import { useState } from "react";
import {
  Building2,
  Wallet,
  Globe,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  CreditCard,
  Eye,
  Filter,
  Search,
  Loader2,
  Trash2,
  Plus,
  Mail,
  PhoneCall,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import StatusBadge from "@/components/StatusBadge";
import {
  useActivateSingleAccountMutation,
  useCreateBankAccountMutation,
  useDeleteBankAccountMutation,
  useGetBankAccountsQuery,
  useUpdateBankAccountMutation,
} from "@/lib/redux/services/bank-account.api";
import toast from "react-hot-toast";
import { Form, Input, Modal, Radio, Select } from "antd";
import {
  useApproveTransactionMutation,
  useGetAllTxQuery,
  useGetTxStatsQuery,
  useRejectTransactionMutation,
} from "@/lib/redux/services/wallet.api";
import { formatCurrency, formatDate, formatFullTimestamp } from "@/lib/helpers";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useGetPaymentMethodsByUserIdQuery } from "@/lib/redux/services/payment.api";

export default function PaymentsControlPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"payouts" | "requests">(
    "requests",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [typeFilter, setTypeFilter] = useState<"DEPOSIT" | "WITHDRAWAL">(
    "WITHDRAWAL",
  );

  // API Hooks
  const [addForm] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createAccount, { isLoading: isCreating }] =
    useCreateBankAccountMutation();
  const { data: bankAccounts = [], isLoading: isBanksLoading } =
    useGetBankAccountsQuery(undefined);
  const [updateAccount, { isLoading: isUpdating }] =
    useUpdateBankAccountMutation();
  const [deleteAccount] = useDeleteBankAccountMutation();

  // Stats for both types
  const { data: withdrawalStats } = useGetTxStatsQuery("WITHDRAWAL");
  const { data: depositStats } = useGetTxStatsQuery("DEPOSIT");

  // Main Table Query - Passing type, status and search
  const { data: txData = [], isLoading: isTableLoading } = useGetAllTxQuery({
    search: debouncedSearch,
    status: statusFilter,
    type: typeFilter,
  });

  const [rejectTx, { isLoading: txIsRejecting }] =
    useRejectTransactionMutation();
  const { data: paymentMethods } = useGetPaymentMethodsByUserIdQuery(
    selectedTx?.user?.id,
  );
  const [approveTx] = useApproveTransactionMutation();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [setActive, { isLoading }] = useActivateSingleAccountMutation();

  const [localState, setLocalState] = useState<Record<string, any>>({});
  const selectedType = Form.useWatch("type", addForm);

  const handleFieldChange = (id: string, field: string, value: string) => {
    setLocalState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleProcess = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED") {
      setRejectingId(id); // Open the note modal
      return;
    }

    try {
      await approveTx({ id }).unwrap();
      toast.success("Transaction approved");
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const confirmRejection = async () => {
    if (!rejectingId) return;
    try {
      await rejectTx({ id: rejectingId, adminNote }).unwrap();
      toast.success("Transaction rejected");
      setRejectingId(null);
      setAdminNote("");
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  const onUpdate = async (id: string) => {
    try {
      const data = localState[id];
      if (!data) return toast.error("No changes detected");
      await updateAccount({ id, data }).unwrap();
      toast.success("Account updated!");
      setLocalState((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      await deleteAccount(id).unwrap();
      toast.success("Account deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const onAddAccountSubmit = async (values: any) => {
    try {
      await createAccount(values).unwrap();
      toast.success("New account established!");
      setIsAddModalOpen(false);
      addForm.resetFields();
    } catch (err: any) {
      toast.error(err?.data?.message || "Creation failed");
    }
  };

  const requestColumn: Column<any>[] = [
    {
      header: "Id",
      render: (tx) => (
        <span className="text-xs font-mono font-bold text-slate-400">
          {tx?.user?.tag}
        </span>
      ),
    },
    {
      header: t("USER_DETAILS"),
      render: (tx) => (
        <div className="flex flex-col">
          <p className="text-xs font-black text-fg uppercase tracking-tight">
            {tx?.user?.fullname}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {tx?.user?.email}
          </p>
        </div>
      ),
    },
    {
      header: t("TYPE"),
      render: (tx) => <StatusBadge status={tx?.type} />,
    },
    {
      header: t("AMOUNT"),
      render: (tx) => (
        <div className="text-xs font-black text-fg tracking-tight">
          ₺{formatCurrency(tx.marginAmount)}
        </div>
      ),
    },
    {
      header: t("STATUS"),
      render: (tx) => <StatusBadge status={tx.status} />,
    },
    {
      header: t("DATE"),
      render: (tx) => (
        <div className="text-xs font-black text-fg tracking-tight">
          {formatFullTimestamp(tx.createdAt).datePart},{" "}
          {formatFullTimestamp(tx.createdAt).timePart}
        </div>
      ),
    },
    {
      header: t("ACTIONS"),
      align: "right",
      render: (tx) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedTx(tx)}
            className="p-2 rounded-lg bg-gray-300/10 text-gray-500 hover:bg-gray-500 hover:text-white transition-all cursor-pointer"
          >
            <Eye size={16} />
          </button>
          {tx.status === "PENDING" && (
            <>
              <button
                onClick={() => handleProcess(tx.id, "REJECTED")}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer transition-all"
              >
                <XCircle size={16} />
              </button>
              <button
                onClick={() => handleProcess(tx.id, "APPROVED")}
                className="p-2 rounded-lg bg-up/10 text-up hover:bg-up hover:text-white cursor-pointer transition-all"
              >
                <CheckCircle2 size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-8 pb-20">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tighter text-fg uppercase flex items-center gap-3">
              <CreditCard className="text-brand" size={28} />{" "}
              {t("PAYMENT_CONTROL")}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {t("PAYMENT_DESC")}
            </p>
          </div>
          <div className="flex w-fit bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
            {["requests", "payouts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-bg text-brand shadow-sm"
                    : "text-slate-500 hover:text-fg"
                }`}
              >
                {tab === "requests" ? t("TRANSACTIONS") : t("BANK_ACCOUNTS")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Withdrawal Stats */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 p-6 rounded-4xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {t("PENDING_WITHDRAWALS")}
            </p>
            <h2 className="text-2xl font-black text-orange-500 tracking-tighter">
              {withdrawalStats?.pendingCount ?? 0} {t("REQUESTS")}
            </h2>
            <p className="text-[10px] text-slate-500 font-medium mt-2">
              {t("VALUE")}: {formatCurrency(withdrawalStats?.totalValue ?? 0)}
            </p>
          </div>

          {/* Deposit Stats */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 p-6 rounded-4xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {t("PENDING_DEPOSITS")}
            </p>
            <h2 className="text-2xl font-black text-up tracking-tighter">
              {depositStats?.pendingCount ?? 0} {t("REQUESTS")}
            </h2>
            <p className="text-[10px] text-slate-500 font-medium mt-2">
              {t("VALUE")}: {formatCurrency(depositStats?.totalValue ?? 0)}
            </p>
          </div>

          <div className="bg-bg border border-slate-200 dark:border-slate-800 p-6 rounded-4xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {t("ACTIVE_CHANNELS")}
            </p>
            <h2 className="text-2xl font-black text-brand tracking-tighter">
              {bankAccounts?.length} {t("METHODS")}
            </h2>
          </div>
        </div>
      </div>

      {activeTab === "payouts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {isBanksLoading && (
            <Loader2 className="animate-spin text-brand mx-auto col-span-full" />
          )}
          {bankAccounts.map((acc: any) => (
            <div
              key={acc.id}
              className="bg-bg border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div
                  className={`h-12 w-12 rounded-2xl bg-brand text-white flex items-center justify-center`}
                >
                  {acc.type === "CRYPTO" ? (
                    <Wallet size={24} />
                  ) : (
                    <Globe size={24} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDelete(acc.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => !acc.isActive && setActive(acc.id)}
                    disabled={isLoading || acc.isActive}
                    className={`cursor-pointer px-4 py-1 rounded-md text-xs font-bold transition-all ${acc.isActive ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    {acc.isActive ? t("ACTIVE") : t("SET_ACTIVE")}
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-black text-fg uppercase tracking-tight">
                  {acc.title}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {acc.type}
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  defaultValue={acc.bankName}
                  onChange={(e) =>
                    handleFieldChange(acc.id, "bankName", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                  placeholder={t("BANK_NAME")}
                />
                <input
                  type="text"
                  defaultValue={acc.accountNumber}
                  onChange={(e) =>
                    handleFieldChange(acc.id, "accountNumber", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                  placeholder={t("ACCOUNT_IBAN_WALLET")}
                />
              </div>
              <button
                disabled={isUpdating || !localState[acc.id]}
                onClick={() => onUpdate(acc.id)}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest mt-auto cursor-pointer"
              >
                {isUpdating ? t("UPDATING") : t("UPDATE_ACCOUNT")}
              </button>
            </div>
          ))}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-brand hover:text-brand transition-all cursor-pointer"
          >
            <Plus size={24} />
            <span className="text-[10px] font-black uppercase">
              {t("ADD_NEW_ACCOUNT")}
            </span>
          </button>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-70 group">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder={t("SEARCH_USER")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              {/* Type Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => setTypeFilter("WITHDRAWAL")}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${typeFilter === "WITHDRAWAL" ? "bg-white dark:bg-slate-800 shadow-sm text-brand" : "text-slate-500"}`}
                >
                  {t("WITHDRAWALS")}
                </button>
                <button
                  onClick={() => setTypeFilter("DEPOSIT")}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${typeFilter === "DEPOSIT" ? "bg-white dark:bg-slate-800 shadow-sm text-brand" : "text-slate-500"}`}
                >
                  {t("DEPOSITS")}
                </button>
              </div>
            </div>

            <Select
              placeholder={
                <div className="flex items-center gap-2 text-slate-500 font-bold">
                  <Filter size={14} />
                  <span>{t("STATUS")}</span>
                </div>
              }
              allowClear
              onChange={(value) => setStatusFilter(value)}
              className="w-48 h-11.5 custom-select"
            >
              <Select.Option value="PENDING">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {t("PENDING")}
                  </span>
                </div>
              </Select.Option>

              <Select.Option value="APPROVED">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-up"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {t("APPROVED")}
                  </span>
                </div>
              </Select.Option>

              <Select.Option value="REJECTED">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {t("REJECTED")}
                  </span>
                </div>
              </Select.Option>
            </Select>
          </div>

          <DataTable
            data={txData}
            columns={requestColumn}
            isLoading={isTableLoading}
          />
        </div>
      )}

      {/* Add Modal and Details Modal */}
      <Modal
        open={!!selectedTx}
        onCancel={() => setSelectedTx(null)}
        footer={null}
        centered
        title={
          <span className="font-black uppercase text-xs tracking-widest">
            {t("TX_DETAILS")}
          </span>
        }
        width={500}
      >
        {selectedTx && (
          <div className="flex flex-col gap-6 py-4">
            {/* 1. Status & Amount Header */}
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {selectedTx.type} {t("TOTAL")}
                </p>
                <p className="text-3xl font-black text-fg tracking-tighter">
                  ₺{formatCurrency(selectedTx.marginAmount)}
                </p>
              </div>
              <StatusBadge status={selectedTx.status} />
            </div>

            {/* 3. Withdrawal Destination (Only for Withdrawals) */}
            {selectedTx.type === "WITHDRAWAL" && selectedTx.method && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-orange-500 border-b border-orange-100 dark:border-orange-900/30 pb-2 flex items-center gap-2">
                  <CreditCard size={14} /> {t("PAYOUT_DESTINATION")}
                  {" | "}
                  {formatFullTimestamp(selectedTx?.createdAt).datePart},
                  {formatFullTimestamp(selectedTx?.createdAt).timePart}
                </h4>
                <div className="p-5 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-tighter">
                        {t("METHOD_TYPE")}
                      </p>
                      <span className="text-xs font-black text-fg uppercase">
                        {
                          paymentMethods?.find(
                            (item) => item?.id === selectedTx?.method,
                          )?.type
                        }
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm">
                      {paymentMethods?.find(
                        (item) => item?.id === selectedTx?.method,
                      )?.type === "CRYPTO" ? (
                        <Wallet size={20} className="text-orange-500" />
                      ) : (
                        <Building2 size={20} className="text-orange-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="group relative">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {t("ACCOUNT_WALLET")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono font-black text-brand break-all">
                          {
                            paymentMethods?.find(
                              (item) => item?.id === selectedTx?.method,
                            )?.detail
                          }
                        </p>
                      </div>
                    </div>

                    {paymentMethods?.find(
                      (item) => item?.id === selectedTx?.method,
                    )?.name && (
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {t("BANK_NAME")}
                        </p>
                        <p className="text-xs font-bold text-fg">
                          {
                            paymentMethods?.find(
                              (item) => item?.id === selectedTx?.method,
                            )?.name
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payment Receipt (For Deposits) */}
            {selectedTx.receipt && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                  {t("PROOF_TRANSFER")}
                </h4>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}${selectedTx?.receipt?.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 bg-slate-900 dark:bg-slate-100 rounded-2xl hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-black/5 rounded-lg">
                      <Eye size={18} className="text-brand" />
                    </div>
                    <span className="text-xs font-black text-brand uppercase">
                      {t("VIEW_RECEIPT")}
                    </span>
                  </div>
                  <ArrowUpRight size={18} className="text-brand" />
                </a>
              </div>
            )}

            {/* 5. Admin Note */}
            {selectedTx.adminNote && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-red-500 border-b border-red-100 dark:border-red-900/30 pb-2 flex items-center gap-2">
                  <XCircle size={14} /> {t("ADMIN_NOTE")}
                </h4>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
                  <p className="text-xs font-medium text-red-800 dark:text-red-400 leading-relaxed">
                    {selectedTx.adminNote}
                  </p>
                </div>
              </div>
            )}

            {selectedTx?.notes && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
                <p className="text-xs font-medium text-orange-800 dark:text-orange-400 leading-relaxed">
                  {selectedTx?.notes}
                </p>
              </div>
            )}

            {/* 6. User Information */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Search size={14} /> {t("SENDER_INFO")}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    {t("FULL_NAME")}
                  </p>
                  <p className="text-xs font-bold text-fg">
                    {selectedTx.user.fullname}
                  </p>
                </div>
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    {t("SYSTEM_TAG")}
                  </p>
                  <p className="text-xs font-mono font-bold text-brand">
                    {selectedTx.user.tag}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Mail size={14} />
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {selectedTx.user.email}
                </p>
              </div>

              {selectedTx.user.phoneNumber && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <PhoneCall size={14} />
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {selectedTx.user.phoneNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Note Modal */}
      <Modal
        title={
          <span className="font-black uppercase text-xs text-red-500 flex items-center gap-2">
            <XCircle size={16} /> {t("CONFIRM_REJECTION")}
          </span>
        }
        open={!!rejectingId}
        onCancel={() => {
          setRejectingId(null);
          setAdminNote("");
        }}
        onOk={confirmRejection}
        confirmLoading={txIsRejecting}
        okText={t("REJECT_TX")}
        okButtonProps={{ danger: true, className: "rounded-xl font-bold" }}
        cancelButtonProps={{ className: "rounded-xl" }}
        centered
      >
        <div className="py-4 flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase text-slate-500">
            {t("REJECTION_REASON")}
          </p>
          <Input.TextArea
            rows={4}
            placeholder="e.g. Invalid receipt, Incorrect account details, etc."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="rounded-2xl p-4 font-medium border-slate-200 focus:border-red-500"
          />
        </div>
      </Modal>

      {/* Register Payout Modal */}
      <Modal
        title={
          <div className="font-black uppercase tracking-tight text-fg flex items-center gap-2">
            <Plus size={18} className="text-brand" /> {t("REGISTER_CHANNEL")}
          </div>
        }
        open={isAddModalOpen}
        onOk={() => addForm.submit()}
        onCancel={() => setIsAddModalOpen(false)}
        confirmLoading={isCreating}
        okText={t("CREATE_CHANNEL")}
        centered
        width={450}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onAddAccountSubmit}
          initialValues={{ type: "BANK", isActive: true }}
        >
          <Form.Item
            name="type"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("CHANNEL_TYPE")}
              </span>
            }
          >
            <Radio.Group className="w-full">
              <div className="flex items-center gap-4">
                <Radio.Button
                  value="BANK"
                  className="h-12 flex items-center justify-center font-bold flex-1"
                >
                  {t("BANK")}
                </Radio.Button>
                <Radio.Button
                  value="CRYPTO"
                  className="h-12 flex items-center justify-center font-bold flex-1"
                >
                  {t("CRYPTO")}
                </Radio.Button>
              </div>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="title"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("INTERNAL_TITLE")}
              </span>
            }
            rules={[{ required: true }]}
          >
            <Input className="rounded-xl h-11 font-bold" />
          </Form.Item>
          <Form.Item
            name="bankName"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("BANK_NAME")}
              </span>
            }
            hidden={selectedType === "CRYPTO"}
          >
            <Input className="rounded-xl h-11 font-medium" />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label={
              <span className="text-[10px] font-black uppercase text-slate-500">
                {t("ACCOUNT_IBAN_WALLET")}
              </span>
            }
            rules={[{ required: true }]}
          >
            <Input className="rounded-xl h-11 font-bold" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
