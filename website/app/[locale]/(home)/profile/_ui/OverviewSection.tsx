import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/helpers";
import {
  useGetMyStatsQuery,
  useGetUserActivityQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from "@/lib/redux/services/user.api";
import { ActivityType } from "@/lib/types";
import { Form, Input, Modal } from "antd";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Plus,
  Shield,
  Ticket,
  UserPen,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OverviewSection({
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

        <StatusBadge status={user?.status} />
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
