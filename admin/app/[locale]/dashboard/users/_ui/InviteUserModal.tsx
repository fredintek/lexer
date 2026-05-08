"use client";
import { useState } from "react";
import { X, Mail, User, Shield, Loader2 } from "lucide-react";
import { useInviteUserMutation } from "@/lib/redux/services/user.api";
import { useGetRolesQuery } from "@/lib/redux/services/role.api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const InviteUserModal = ({ isOpen, onClose }: InviteUserModalProps) => {
  const t = useTranslations();
  const [inviteUser, { isLoading }] = useInviteUserMutation();
  const { data: roles } = useGetRolesQuery(undefined);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    roleId: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleId) return toast.error("Please select a role");

    try {
      await inviteUser(formData).unwrap();
      toast.success("Invitation sent successfully!");
      setFormData({ fullname: "", email: "", roleId: "" });
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send invitation");
    }
  };
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-bg border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase tracking-tight text-fg">
              {t("INVITE_USER")}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {t("INVITE_USER_GUIDE")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              {t("FULLNAME")}
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                type="text"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                placeholder="e.g. Arda Güler"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              {t("EMAIL_ADDRESS")}
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@bullsyatirim.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand outline-none transition-all"
              />
            </div>
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              {t("ASSIGN_ROLE")}
            </label>
            <div className="relative">
              <Shield
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                required
                value={formData.roleId}
                onChange={(e) =>
                  setFormData({ ...formData, roleId: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-brand outline-none appearance-none transition-all"
              >
                <option value="">{t("SELECT_ROLE")}...</option>
                {roles?.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer w-full bg-fg text-bg dark:bg-white dark:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mx-auto" size={18} />
            ) : (
              `${t("SUBMIT")}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
