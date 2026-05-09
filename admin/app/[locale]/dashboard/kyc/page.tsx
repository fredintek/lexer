"use client";
import { useMemo, useRef, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import {
  Eye,
  FileText,
  ShieldCheck,
  AlertCircle,
  Search,
  Loader2,
  Fingerprint,
  TimerReset,
  RotateCcw,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import { useGetKYCRequestsQuery } from "@/lib/redux/services/kyc.api";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/helpers";
import { Link } from "@/i18n/navigation";

const KYCPage = () => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  // 1. Fetch Real Data
  const { data: requests, isLoading } = useGetKYCRequestsQuery({
    search: debouncedSearch,
    status: filters.status || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setSearchTerm("");
  };

  // 4. Stats Calculation
  const stats = useMemo(() => {
    if (!requests) return { pending: 0, verified: 0 };
    return {
      pending: requests.filter((r: any) => r.status === "PENDING").length,
      verified: requests.filter((r: any) => r.status === "APPROVED").length,
    };
  }, [requests]);

  const kycColumns: Column<any>[] = [
    {
      header: t("COLUMN_ID"),
      render: (kyc) => (
        <span className="text-xs font-mono font-bold text-slate-400">
          {kyc?.user?.tag}
        </span>
      ),
    },
    {
      header: t("USER_DETAILS"),
      render: (kyc) => (
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand font-bold flex items-center justify-center text-xs shrink-0">
            {kyc?.user?.fullname
              ?.split(" ")
              ?.map((n: any) => n[0])
              ?.join("")}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-fg truncate max-w-30">
              {kyc?.user.fullname}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {kyc?.user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("COLUMN_DOCUMENT"),
      render: (item) => (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <FileText size={14} className="text-brand" />
          <span className="capitalize">
            {item.documentType.replace("-", " ")}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            ({item.country})
          </span>
        </div>
      ),
    },
    {
      header: t("COLUMN_TIER"),
      render: (kyc) => (
        <div className="flex items-center gap-1">
          {[...Array(kyc?.user?.tier)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-4 rounded-full ${i < kyc?.user?.tier ? "bg-brand" : "bg-slate-200 dark:bg-slate-800"}`}
            />
          ))}
          <span className="ml-2 text-[10px] font-black text-slate-500 uppercase">
            {t("LVL")} {kyc?.user?.tier}
          </span>
        </div>
      ),
    },
    {
      header: t("COLUMN_SUBMISSION_DATE"),
      render: (kyc) => (
        <span className="text-xs font-medium text-slate-500">
          {formatDate(kyc?.createdAt)}
        </span>
      ),
    },
    {
      header: t("REVIEWED_BY"),
      render: (kyc) => (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Fingerprint size={14} className="text-brand" />
          <span className="capitalize">{kyc?.reviewedBy?.fullname}</span>
          <span className="text-[10px] text-slate-400 font-medium">
            ({kyc?.reviewedBy?.role?.name})
          </span>
        </div>
      ),
    },
    {
      header: t("COLUMN_STATUS"),
      render: (kyc) => <StatusBadge status={kyc?.status} />,
    },
    {
      header: t("COLUMN_ACTIONS"),
      align: "right",
      render: (kyc) => (
        <Link
          href={`/dashboard/users/${kyc?.user?.id}?tab=identity`}
          className="p-2 text-slate-400 hover:text-brand transition-all"
        >
          <Eye size={18} />
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg flex items-center gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t("AWAITING_REVIEW")}
            </p>
            <h3 className="text-xl font-black text-fg">
              {isLoading ? "..." : stats.pending}
            </h3>
          </div>
        </div>
        <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-bg flex items-center gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-2xl bg-up/10 text-up flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t("VERIFIED_USERS")}
            </p>
            <h3 className="text-xl font-black text-fg">
              {isLoading ? "..." : stats.verified}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="relative w-70 group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("SEARCH_PLACEHOLDER_KYC")}
              className="w-full pl-12 pr-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:border-brand focus:ring-1 ring-brand/10 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="cursor-pointer px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-brand"
          >
            <option value="">{t("STATUS")}</option>
            <option value="PENDING">{t("PENDING")}</option>
            <option value="APPROVED">{t("APPROVED")}</option>
            <option value="REJECTED">{t("REJECTED")}</option>
          </select>

          {/* Date Range Group */}
          <div className="flex items-center gap-2">
            <input
              ref={startDateRef}
              type="date"
              name="startDate"
              value={filters.startDate}
              onClick={() => startDateRef.current?.showPicker()}
              onChange={handleFilterChange}
              className="cursor-pointer flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              ref={endDateRef}
              type="date"
              name="endDate"
              value={filters.endDate}
              onClick={() => endDateRef.current?.showPicker()}
              onChange={handleFilterChange}
              className="cursor-pointer flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
            />
          </div>

          {/* Clear Button */}
          <button
            onClick={clearFilters}
            className="cursor-pointer text-[10px] font-black uppercase text-slate-400 hover:text-down transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Table Section */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-bg/50 backdrop-blur-[1px] flex items-center justify-center rounded-3xl">
              <Loader2 className="animate-spin text-brand" size={32} />
            </div>
          )}
          <DataTable
            data={(requests as any[]) ?? []}
            columns={kycColumns}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default KYCPage;
