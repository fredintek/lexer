import {
  useAddPaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useSetPrimaryMethodMutation,
} from "@/lib/redux/services/payment.api";
import { Form, Input, Modal, Popconfirm, Select, Tooltip } from "antd";
import { CreditCard, Plus, Star, Trash2, Wallet, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PaymentsSection() {
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
