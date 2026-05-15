import { useTranslations } from "next-intl";

type Props = {
  status: string;
};

const StatusBadge = ({ status }: Props) => {
  const t = useTranslations();
  const styles: any = {
    ACTIVE: "bg-up/10 text-up border-up/20",
    APPROVE: "bg-up/10 text-up border-up/20",
    COMPLETED: "bg-up/10 text-up border-up/20",
    APPROVED: "bg-up/10 text-up border-up/20",
    VERIIFIED: "bg-up/10 text-up border-up/20",
    INACTIVE: "bg-red-500/10 text-red-500 border-red-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
    PENDING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    PAUSED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    SUSPENDED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",

    open: "bg-up/10 text-up border-up/20",
    closed: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    waiting: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",

    BUY_OPEN: "bg-up/10 text-up border-up/20",
    BUY_WAITING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    BUY_MERGE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    SELL_FULL: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    SELL_PARTIAL: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    CANCEL: "bg-red-500/10 text-red-500 border-red-500/20",
    DEPOSIT: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    WITHDRAWAL: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles[status]}`}
    >
      <div className={`h-1 w-1 rounded-full bg-current`} />
      {t(status?.toUpperCase())}
    </div>
  );
};

export default StatusBadge;
