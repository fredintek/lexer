"use client";
import { useState, useEffect } from "react";
import { X, ShieldCheck, User, Loader2, Save } from "lucide-react";
import { useGetRolesQuery } from "@/lib/redux/services/role.api";

interface UserEditModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
  isLoading: boolean;
}

const UserEditModal = ({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: UserEditModalProps) => {
  const { data: roles } = useGetRolesQuery(undefined);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    roleId: "",
    tier: 1,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        roleId: user.role?.id || "",
        tier: user.tier || 1,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  const SectionHeader = ({
    title,
    icon: Icon,
  }: {
    title: string;
    icon: any;
  }) => (
    <div className="flex items-center gap-2 mb-4 mt-2">
      <Icon size={16} className="text-brand" />
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
        {title}
      </h3>
      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg">
              {user.tag?.substring(1, 3).toUpperCase() || "LX"}
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-fg leading-tight">
                User Configuration
              </h2>
              <p className="text-xs font-mono text-slate-400 font-bold">
                {user.tag}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
            {/* Section 1: Profile */}
            <section>
              <SectionHeader title="Account Identity" icon={User} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData?.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    className="lexer-input w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData?.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="lexer-input w-full"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Financials */}
            {/* <section>
              <SectionHeader title="Financial Ledger" icon={Wallet} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                    Available Balance ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                    className="lexer-input w-full font-mono text-up bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                    Frozen Funds ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.frozenBalance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frozenBalance: e.target.value,
                      })
                    }
                    className="lexer-input w-full font-mono text-down bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </section> */}

            {/* Section 3: Access Control */}
            <section>
              <SectionHeader
                title="Privileges & Verification"
                icon={ShieldCheck}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                    Assign System Role
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData({ ...formData, roleId: e.target.value })
                    }
                    className="lexer-input w-full appearance-none"
                  >
                    {roles?.map((role: any) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                    KYC Verification Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) =>
                      setFormData({ ...formData, tier: Number(e.target.value) })
                    }
                    className="lexer-input w-full"
                  >
                    <option value={1}>Tier 1: Basic Access</option>
                    <option value={2}>Tier 2: Advanced Pro</option>
                    <option value={3}>Tier 3: Institutional</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-fg text-bg dark:bg-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-brand/10"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              Synchronize Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
