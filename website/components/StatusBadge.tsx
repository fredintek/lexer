type Props = {
  status: string;
};

const StatusBadge = ({ status }: Props) => {
  const styles: any = {
    ACTIVE: "bg-up/10 text-up border-up/20",
    APPROVE: "bg-up/10 text-up border-up/20",
    COMPLETED: "bg-up/10 text-up border-up/20",
    APPROVED: "bg-up/10 text-up border-up/20",
    INACTIVE: "bg-red-500/10 text-red-500 border-red-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
    PENDING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    PAUSED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles[status]}`}
    >
      <div className={`h-1 w-1 rounded-full bg-current`} />
      {status}
    </div>
  );
};

export default StatusBadge;
