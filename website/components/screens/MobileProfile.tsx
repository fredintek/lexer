import {
  ChevronRight,
  ChevronLeft,
  LogOut,
  BadgeCheck,
  Plus,
} from "lucide-react";
import OverviewSection from "@/app/[locale]/(home)/profile/_ui/OverviewSection";
import WalletSection from "@/app/[locale]/(home)/profile/_ui/WalletSection";
import PaymentsSection from "@/app/[locale]/(home)/profile/_ui/PaymentsSection";
import SecuritySection from "@/app/[locale]/(home)/profile/_ui/SecuritySection";
import NotificationsSection from "@/app/[locale]/(home)/profile/_ui/NotificationSection";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  useGetMeQuery,
  useUpdateAvatarMutation,
} from "@/lib/redux/services/user.api";
import StatusBadge from "../StatusBadge";
import { useLogoutMutation } from "@/lib/redux/services/auth.api";

export default function MobileProfile() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logout] = useLogoutMutation();

  // The logic: If this exists, we swap the whole view.
  const activeSection = searchParams.get("view");
  const { data: user } = useGetMeQuery(undefined);

  const avatar = user?.avatar?.url
    ? `${process.env.NEXT_PUBLIC_BASE_URL}${user?.avatar?.url}`
    : null;

  const [updateAvatar, { isLoading: isUpdating }] = useUpdateAvatarMutation();

  const handleNavigation = (viewName: string) => {
    router.push(`?view=${viewName}`, { scroll: false });
  };

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (activeSection) {
    return (
      <div className="md:hidden pb-17 min-h-screen bg-bg animate-in slide-in-from-right-4 duration-200">
        <div className="p-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 bg-bg/80 backdrop-blur-md sticky top-0 z-50">
          <button onClick={handleBack} className="p-2 -ml-2 text-slate-500">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
            {t(`TAB_${activeSection.toUpperCase()}`)}
          </h1>
        </div>

        <div className="p-4">
          {activeSection === "overview" && <OverviewSection user={user} />}
          {activeSection === "wallet" && <WalletSection user={user} />}
          {activeSection === "payments" && <PaymentsSection />}
          {activeSection === "security" && <SecuritySection user={user} />}
          {activeSection === "notifications" && (
            <NotificationsSection user={user} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden flex flex-col bg-bg min-h-screen p-4 pb-24">
      {/* User Info Card */}
      <div className="bg-bg rounded-3xl p-6 flex items-center gap-4 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Avatar with Update Logic */}
        <div className="relative">
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
              className={`h-16 w-16 rounded-2xl bg-linear-to-tr from-brand to-up p-0.5 transition-opacity ${isUpdating ? "opacity-50" : "opacity-100"}`}
            >
              <div className="h-full w-full rounded-[14px] bg-bg flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-black text-brand">
                    {user?.fullname?.substring(0, 2).toUpperCase() || "BY"}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl opacity-0 active:opacity-100 transition-opacity">
              <Plus size={16} className="text-white" />
            </div>
          </label>
          <div className="absolute -bottom-1 -right-1 bg-brand text-white p-1 rounded-full border-2 border-bg">
            <BadgeCheck size={12} />
          </div>
        </div>

        {/* User Identity Info */}
        <div className="flex-1 overflow-hidden">
          <h2 className="text-slate-900 dark:text-white font-black uppercase tracking-tight leading-none truncate">
            {user?.fullname}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-tighter truncate">
            {user?.email}
          </p>
          {user?.phoneNumber && (
            <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-tighter truncate">
              {user?.phoneNumber}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-brand/10 text-brand text-[8px] font-black uppercase rounded-md border border-brand/20">
              {user?.tag}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 text-[8px] font-black uppercase rounded-md">
              {user?.role?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Group */}
      <div className="bg-bg rounded-3xl p-6 mb-4 border border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
          {t("VERIFICATION")}
        </p>
        <div className="space-y-4">
          <StatusRow
            label="Email"
            status={user?.isEmailVerified ? "APPROVED" : "INACTIVE"}
            color="text-up"
          />
          <StatusRow
            label="KYC"
            status={user?.kyc?.status ? user?.kyc?.status : "INACTIVE"}
            color="text-amber-500"
          />
          <StatusRow
            label="2FA"
            status={user?.mfaSecret ? "APPROVED" : "INACTIVE"}
            color="text-down"
          />
        </div>
      </div>

      {/* Navigation List */}
      <div className="bg-bg rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <MenuRow
          label={t("TAB_OVERVIEW")}
          onClick={() => handleNavigation("overview")}
        />
        <MenuRow
          label={t("TAB_SECURITY")}
          onClick={() => handleNavigation("security")}
        />
        <MenuRow
          label={t("TAB_WALLET")}
          onClick={() => handleNavigation("wallet")}
        />
        <MenuRow label={t("NAV_LOGOUT")} isDestructive onClick={handleLogout} />
      </div>
    </div>
  );
}

// Helpers to maintain consistent styling
function StatusRow({ label, status, color }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 last:border-none last:pb-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
        {label}
      </span>
      <StatusBadge status={status} />
    </div>
  );
}

function MenuRow({ label, onClick, value, isDestructive }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-none"
    >
      <span
        className={`text-[10px] font-black uppercase tracking-widest ${isDestructive ? "text-down" : "text-slate-900 dark:text-white"}`}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-slate-400 text-xs font-bold">{value}</span>
        )}
        {!value && !isDestructive && (
          <ChevronRight size={16} className="text-slate-300" />
        )}
        {isDestructive && <LogOut size={16} className="text-down" />}
      </div>
    </button>
  );
}
