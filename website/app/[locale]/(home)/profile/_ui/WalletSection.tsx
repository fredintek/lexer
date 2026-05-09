"use client";
import DepositModal from "@/app/[locale]/(trade)/trade/_ui/DepositModal";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/helpers";
import {
  useAddPaymentMethodMutation,
  useGetPaymentMethodsQuery,
} from "@/lib/redux/services/payment.api";
import {
  useGetWalletHistoryQuery,
  useRequestWithdrawalMutation,
} from "@/lib/redux/services/wallet.api";
import { Form, Input, Modal, Select } from "antd";
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  Download,
  Eye,
  Filter,
  History,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type StatusType = "PENDING" | "APPROVED" | "REJECTED" | undefined;

export default function WalletSection({
  user,
}: {
  user: Record<string, any> | null;
}) {
  const t = useTranslations();
  const [form] = Form.useForm();
  const [addPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const { data: methods, isLoading: methodsLoading } =
    useGetPaymentMethodsQuery();
  const [status, setStatus] = useState<StatusType>(undefined);
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

            <select
              onChange={(e) => setStatus(e.target.value as StatusType)}
              className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">{t("STATUS_FILTER")}</option>
              <option value="PENDING">{t("STATUS_PENDING")}</option>
              <option value="APPROVED">{t("STATUS_APPROVED")}</option>
              <option value="REJECTED">{t("STATUS_REJECTED")}</option>
            </select>
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
