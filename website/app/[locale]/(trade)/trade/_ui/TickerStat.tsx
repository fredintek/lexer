const TickerStat = ({
  label,
  value,
  color = "text-fg",
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div className="flex flex-col min-w-fit">
    <span className="text-[10px] text-gray-500 uppercase font-bold">
      {label}
    </span>
    <span className={`text-xs font-medium ${color}`}>{value}</span>
  </div>
);

export default TickerStat;
