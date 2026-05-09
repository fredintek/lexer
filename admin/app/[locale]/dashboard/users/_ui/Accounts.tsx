"use client";
import { useState, useMemo, useEffect } from "react";
import { Eye, Globe, Search, Smartphone, UserRoundKey } from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useTranslations } from "next-intl";
import { useGetUsersQuery } from "@/lib/redux/services/user.api";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/helpers";
import { Link } from "@/i18n/navigation";

export default function Accounts() {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const debouncedSearch = useDebounce(search, 500);
  const { data: users, isLoading: isUsersLoading } = useGetUsersQuery({
    search: debouncedSearch,
    accountStatus: statusFilter,
    kycStatus: kycFilter,
    page: page,
    limit: ITEMS_PER_PAGE,
  });

  const column: Column<any>[] = [
    {
      header: t("USER_ID"),
      render: (user) => (
        <span className="text-xs font-mono font-bold text-slate-400">
          {user.tag}
        </span>
      ),
    },
    {
      header: t("USER_DETAIL"),
      render: (user) => (
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand font-bold flex items-center justify-center text-xs shrink-0">
            {user?.fullname
              ?.split(" ")
              ?.map((n: any) => n[0])
              ?.join("")}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-fg truncate max-w-30">
              {user.fullname}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("KYC_STATUS"),
      render: (user) => <StatusBadge status={user?.kyc?.status} />,
    },
    {
      header: t("TC_ID_NO"),
      render: (user) => {
        const id = user.identificationNumber;
        if (!id) return <StatusBadge status={""} />;

        const maskedId = `${id.substring(0, 2)}*******${id.substring(9)}`;

        return (
          <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
            {/* {maskedId} */}
            {id}
          </span>
        );
      },
    },
    {
      header: t("ROLE"),
      render: (user) => (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <UserRoundKey size={14} className="text-slate-400" />
          {user?.role?.name}
        </div>
      ),
    },
    {
      header: t("ACCOUNT_STATUS"),
      render: (user) => <StatusBadge status={user?.status} />,
    },
    {
      header: t("CONTACT"),
      render: (user) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-fg">
            <Smartphone size={13} className="text-slate-400" />
            {user.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      header: t("JOIN_DATE"),
      render: (user) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Globe size={12} className="shrink-0" />
            {t("JOINED")}: {formatDate(user.createdAt)}
          </div>
        </div>
      ),
    },
    {
      header: t("ACTIONS"),
      render: (user) => (
        <Link
          href={`/dashboard/users/${user.id}`}
          className="w-fit p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all cursor-pointer block"
        >
          <Eye size={18} />
        </Link>
      ),
    },
  ];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, kycFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("SEARCH_NAME_EMAIL")}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 ring-brand/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none cursor-pointer"
          >
            <option value="ALL">{t("KYC_STATUS_ALL")}</option>
            <option value="PENDING">{t("KYC_STATUS_PENDING")}</option>
            <option value="VERIFIED">{t("KYC_STATUS_VERIFIED")}</option>
            <option value="REJECTED">{t("KYC_STATUS_REJECTED")}</option>
          </select>

          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none cursor-pointer font-medium text-slate-600 dark:text-slate-300"
          >
            <option value="ALL">{t("ACCOUNT_STATUS_ALL")}</option>
            <option value="ACTIVE">{t("ACCOUNT_STATUS_ACTIVE")}</option>
            <option value="PENDING">{t("ACCOUNT_STATUS_PENDING")}</option>
            <option value="SUSPENDED">{t("ACCOUNT_STATUS_SUSPENDED")}</option>
            <option value="DEACTIVATED">
              {t("ACCOUNT_STATUS_DEACTIVATED")}
            </option>
          </select>
        </div>
      </div>
      <DataTable
        data={users?.items ?? []}
        columns={column}
        minWidth="1000px"
        isLoading={isUsersLoading}
        totalItems={users?.total ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
