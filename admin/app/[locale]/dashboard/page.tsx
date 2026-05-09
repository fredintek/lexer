"use client";
import {
  Users,
  Activity,
  DollarSign,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  ArrowUpCircle,
  CheckCircle2,
} from "lucide-react";
import StatusCard from "./_ui/overview/StatusCard";
import { useGetUsersQuery } from "@/lib/redux/services/user.api";
import { useGetKYCRequestsQuery } from "@/lib/redux/services/kyc.api";
import {
  useGetFlowStatsQuery,
  useGetTxStatsQuery,
} from "@/lib/redux/services/wallet.api";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/helpers";
import { Link } from "@/i18n/navigation";
import FlowChart from "@/components/FlowChart";
import { useTranslations } from "next-intl";

export default function OverviewPage() {
  const t = useTranslations();
  const { data: users } = useGetUsersQuery({});
  const { data: kycRequests, isLoading: kycLoading } = useGetKYCRequestsQuery(
    {},
  );
  const { data: withdrawalStats } = useGetTxStatsQuery("WITHDRAWAL");
  const { data: flowStats } = useGetFlowStatsQuery();

  const metrics = useMemo(() => {
    if (!users) return { totalLiquidity: 0, tierDist: { t1: 0, t2: 0, t3: 0 } };

    const total = users?.items?.reduce(
      (acc: any, u: any) =>
        acc + (Number(u.balance) || 0) + (Number(u.frozenBalance) || 0),
      0,
    );

    const traders = Number(
      users?.items?.filter((user: any) => user?.role?.name === "TRADER")
        ?.length,
    );

    const tiers = {
      t1: users?.items?.filter((u: any) => u.tier === 1).length,
      t2: users?.items?.filter((u: any) => u.tier === 2).length,
      t3: users?.items?.filter((u: any) => u.tier === 3).length,
    };

    const mfaCompliance =
      (users?.items?.filter((user: any) => user?.mfaSecret)?.length /
        users?.length) *
      100;

    return { totalLiquidity: total, tierDist: tiers, traders, mfaCompliance };
  }, [users]);

  const pendingKycCount = useMemo(
    () => kycRequests?.filter((k) => k.status === "PENDING").length || 0,
    [kycRequests],
  );

  const pendingKyc = useMemo(
    () => kycRequests?.filter((k) => k.status === "PENDING"),
    [kycRequests],
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
            {t("SYSTEM_INTELLIGENCE")}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {t("OPERATIONAL_OVERVIEW")}
          </p>
        </div>
        <div className="w-fit flex items-center gap-2 px-4 py-2 bg-up/10 text-up rounded-full border border-up/20">
          <div className="h-2 w-2 bg-up rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {t("ENGINE_ONLINE")}
          </span>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title={t("PLATFORM_LIQUIDITY")}
          value={`₺${formatCurrency(metrics?.totalLiquidity)}`}
          change={t("LIVE_BALANCE")}
          isUp={true}
          icon={DollarSign}
        />
        <StatusCard
          title={t("IDENTITY_QUEUE")}
          value={pendingKycCount?.toString()}
          change={kycLoading ? "Loading..." : "KYC Pending"}
          isUp={pendingKycCount > 0 ? false : null}
          icon={ShieldAlert}
        />
        <StatusCard
          title={t("PENDING_WITHDRAWALS")}
          value={withdrawalStats?.pendingCount.toString() || "0"}
          change={`$${withdrawalStats?.totalValue.toLocaleString() || 0}`}
          isUp={false}
          icon={ArrowUpCircle}
        />
        <StatusCard
          title={t("TOTAL_TRADERS")}
          value={metrics?.traders?.toString() as string}
          change={`${t("NEW_MEMBERS")}`}
          isUp={true}
          icon={Users}
        />
      </div>

      {/* 3. Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Volume Analytics (Transactions Entity) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-fg uppercase tracking-tight">
                {t("DEPOSIT_VS_WITHDRAWAL")}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                {t("RTV")}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-up/5 rounded-lg border border-up/10">
                <div className="h-2 w-2 bg-up rounded-full" />
                <span className="text-[10px] font-bold text-up">
                  {t("INFLOW")}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-down/5 rounded-lg border border-down/10">
                <div className="h-2 w-2 bg-down rounded-full" />
                <span className="text-[10px] font-bold text-down">
                  {t("OUTFLOW")}
                </span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full bg-slate-50/50 dark:bg-slate-900/30 rounded-md border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <FlowChart data={flowStats ?? []} />
          </div>
        </div>

        {/* Right: Asset Health (Tier & Frozen Stats) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg p-8 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-black text-fg uppercase tracking-tight mb-1">
              {t("USER_TIERS")}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-6 text-brand">
              {t("INSTITUTIONAL_DISTRIBUTION")}
            </p>

            <div className="space-y-5">
              {[
                {
                  label: "TIER_3_INSTITUTION",
                  val: metrics.tierDist.t3,
                  color: "bg-brand",
                },
                {
                  label: "TIER_2_PRO",
                  val: metrics.tierDist.t2,
                  color: "bg-slate-500",
                },
                {
                  label: "TIER_1_BASIC",
                  val: metrics.tierDist.t1,
                  color: "bg-slate-200",
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">{t(item.label)}</span>
                    <span className="text-fg">
                      {item.val} {t("USERS")}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-1000`}
                      style={{
                        width: `${(item.val / (users?.length || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(pendingKyc?.length as number) > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-fg uppercase tracking-tight mb-4 flex items-center gap-2">
                <Clock size={16} className="text-brand" />
                {t("RECENT_KYC_EVENTS")}
              </h3>
              <div className="space-y-3">
                {/* Logic: Map through kyc queue */}
                {pendingKyc?.map((kyc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-fg truncate">
                        {kyc?.user?.fullname}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-black">
                        {kyc?.country} • {kyc?.documentType}
                      </span>
                    </div>
                    <Link href="/dashboard/kyc">
                      <button className="cursor-pointer px-3 py-1 bg-brand text-white text-[9px] font-black uppercase rounded-lg hover:bg-brand/90 transition-all">
                        {t("REVIEW")}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Financial Logs & Audit Entry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Withdrawals Card */}
        <Link
          href="/dashboard/payments"
          className="p-6 rounded-4xl border border-slate-200 dark:border-slate-800 bg-bg hover:border-brand transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <ArrowUpCircle size={20} />
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-300 group-hover:text-brand transition-colors"
            />
          </div>
          <h4 className="text-sm font-black text-fg uppercase mb-1">
            {withdrawalStats?.pendingCount} {t("PENDING_WITHDRAWALS")}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {formatCurrency(withdrawalStats?.totalValue as number)}{" "}
            {t("AWAITING_APPROVAL")}
          </p>
        </Link>

        {/* Global Security Summary */}
        <Link
          href="/dashboard/users"
          className="p-6 rounded-4xl border border-slate-200 dark:border-slate-800 bg-bg hover:border-brand transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-300 group-hover:text-brand transition-colors"
            />
          </div>
          <h4 className="text-sm font-black text-fg uppercase mb-1">
            {t("MFA_COMPLIANCE")}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {metrics?.mfaCompliance}% {t("ACCOUNTS_2FA_ACTIVE")}
          </p>
        </Link>

        {/* Quick Link to Users */}
        <Link
          href="/dashboard/users"
          className="p-6 rounded-4xl border border-slate-200 dark:border-slate-800 bg-bg hover:border-brand transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-fg flex items-center justify-center">
              <Zap size={20} />
            </div>
            <ArrowUpRight
              size={18}
              className="text-slate-300 group-hover:text-brand transition-colors"
            />
          </div>
          <h4 className="text-sm font-black text-fg uppercase mb-1">
            {t("USER_MANAGEMENT")}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {t("MANAGE_PERMISSION")}
          </p>
        </Link>
      </div>
    </div>
  );
}
