"use client";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import {
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  ShieldCheck,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import KYCReviewModal from "./_ui/KycReviewModal";
import {
  useGetKYCRequestsQuery,
  useUpdateKYCStatusMutation,
} from "@/lib/redux/services/kyc.api";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";

const KYCPage = () => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 1. Fetch Real Data
  const { data: requests, isLoading } = useGetKYCRequestsQuery({
    search: debouncedSearch,
  });
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateKYCStatusMutation();

  // 2. Action Handlers
  const handleAction = async (
    id: string,
    status: "Active" | "Inactive",
    reason?: string,
  ) => {
    try {
      await updateStatus({
        id,
        status: status.toUpperCase(),
        rejectionReason: reason,
      }).unwrap();

      toast.success(`KYC ${status === "Active" ? "Approved" : "Rejected"}`);
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleOpenModal = (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  // 3. Transform & Filter Data
  const filteredData = useMemo(() => {
    if (!requests) return [];

    return requests.map((r: any) => ({
      id: r?.user?.tag,
      userName: r.user?.fullname || `User #${r.user?.id?.slice(0, 6)}`,
      userEmail: r.user?.email,
      documentType: r.documentType,
      country: r.country,
      submittedAt: new Date(r.createdAt).toLocaleString(),
      tier: r?.user?.tier || 1,
      status: r.status,
      raw: r,
    }));
  }, [requests]);

  // 4. Stats Calculation
  const stats = useMemo(() => {
    if (!requests) return { pending: 0, verified: 0 };
    return {
      pending: requests.filter((r: any) => r.status === "PENDING").length,
      verified: requests.filter((r: any) => r.status === "ACTIVE").length,
    };
  }, [requests]);

  const kycColumns: Column<any>[] = [
    {
      header: t("COLUMN_ID"),
      render: (item) => (
        <span className="text-xs font-mono font-bold text-slate-400">
          {item.id}
        </span>
      ),
    },
    {
      header: t("COLUMN_USER"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-fg">{item.userName}</span>
          <span className="text-[11px] text-slate-400 font-medium">
            {item.userEmail}
          </span>
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
      render: (item) => (
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-4 rounded-full ${i < item.tier ? "bg-brand" : "bg-slate-200 dark:bg-slate-800"}`}
            />
          ))}
          <span className="ml-2 text-[10px] font-black text-slate-500 uppercase">
            {t("LVL")} {item.tier}
          </span>
        </div>
      ),
    },
    {
      header: t("COLUMN_SUBMISSION_DATE"),
      render: (item) => (
        <span className="text-xs font-medium text-slate-500">
          {item.submittedAt}
        </span>
      ),
    },
    {
      header: t("COLUMN_STATUS"),
      render: (item) => (
        <StatusBadge
          status={
            item.status === "ACTIVE"
              ? "APPROVED"
              : item.status === "INACTIVE"
                ? "REJECTED"
                : "PENDING"
          }
        />
      ),
    },
    {
      header: t("COLUMN_ACTIONS"),
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenModal(item.raw)}
            className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
            title={t("REVIEW_DETAILS")}
          >
            <Eye size={18} />
          </button>
          {item.status === "PENDING" && (
            <>
              <button
                onClick={() => handleAction(item.id, "Active")}
                className="p-2 text-slate-400 hover:text-up hover:bg-up/5 rounded-lg transition-all"
                title={t("QUICK_APPROVE")}
              >
                <CheckCircle2 size={18} />
              </button>
              <button
                onClick={() =>
                  handleAction(
                    item.id,
                    "Inactive",
                    t("REJECTION_REASON_MANUAL"),
                  )
                }
                className="p-2 text-slate-400 hover:text-down hover:bg-down/5 rounded-lg transition-all"
                title={t("QUICK_REJECT")}
              >
                <XCircle size={18} />
              </button>
            </>
          )}
        </div>
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

        {/* Table Section */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-bg/50 backdrop-blur-[1px] flex items-center justify-center rounded-3xl">
              <Loader2 className="animate-spin text-brand" size={32} />
            </div>
          )}
          <DataTable data={filteredData} columns={kycColumns} />
        </div>
      </div>

      {/* Detail Review Modal */}
      <KYCReviewModal
        isOpen={isModalOpen}
        request={selectedRequest}
        onClose={handleCloseModal}
        isUpdating={isUpdating}
        onApprove={(id) => handleAction(id, "Active")}
        onReject={(id, reason) => handleAction(id, "Inactive", reason)}
      />
    </div>
  );
};

export default KYCPage;
