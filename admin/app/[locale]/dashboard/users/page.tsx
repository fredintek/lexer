"use client";
import {
  Search,
  UserPlus,
  Smartphone,
  Globe,
  UserRoundKey,
  Eye,
  Trash2,
} from "lucide-react";
import DataTable, { Column } from "@/components/dataTable/DataTable";
import { useState } from "react";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "@/lib/redux/services/user.api";
import toast from "react-hot-toast";
import InviteUserModal from "./_ui/InviteUserModal";
import { formatDate } from "@/lib/helpers";
import StatusBadge from "@/components/StatusBadge";
import { useDebounce } from "@/hooks/useDebounce";
import { Popconfirm } from "antd";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const UsersPage = () => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const router = useRouter();

  const goToUserDetails = (id: string) => {
    router.push(`/dashboard/users/${id}`);
  };

  // 1. Hook up the API
  const { data: users } = useGetUsersQuery({
    search: debouncedSearch,
  });
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      toast.success("User profile deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const userColumn: Column<any>[] = [
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
          <div className="flex flex-col">
            <span className="text-sm font-bold text-fg truncate max-w-30">
              {user.name}
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
      header: t("ROLE"),
      render: (user) => (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <UserRoundKey size={14} className="text-slate-400" />
          {user?.role?.name}
        </div>
      ),
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
            <Globe size={12} />
            {t("JOINED")}: {formatDate(user.createdAt)}
          </div>
        </div>
      ),
    },
    {
      header: t("ACTIONS"),
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToUserDetails(user.id)}
            className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all cursor-pointer"
          >
            <Eye size={18} />
          </button>
          <Popconfirm
            onConfirm={() => handleDelete(user?.id)}
            title="Are you sure?"
          >
            <button className="p-2 text-down hover:text-down hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
              <Trash2 size={18} />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
            {t("USER_MANAGEMENT")}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {t("VIEW_EDIT_GUIDE")}
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="w-fit flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all cursor-pointer"
        >
          <UserPlus size={18} />
          <span>{t("ADD_NEW_USER")}</span>
        </button>
      </div>

      {/* 2. Search and Table Controls */}
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
            placeholder={t("SEARCH_NAME_EMAIL_ROLE")}
            className="w-full pl-12 pr-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:border-brand focus:ring-1 ring-brand/10 transition-all"
          />
        </div>
      </div>

      {/* 3. Users Table */}
      <DataTable data={users ?? []} columns={userColumn} />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
