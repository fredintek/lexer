import {
  CircleOff,
  Eye,
  HistoryIcon,
  LayoutList,
  Search,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import Accounts from "./Accounts";
import { useGetAllPositionsQuery } from "@/lib/redux/services/position.api";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable from "@/components/dataTable/DataTable";
import { formatDate, formatFullTimestamp, getLogoUrl } from "@/lib/helpers";
import { Link } from "@/i18n/navigation";

type Props = {};

const UserTab = (props: Props) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [activeTab, setActiveTab] = useState("users");
  const { data: positions, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery(undefined);

  const tabs = useMemo(() => {
    return [
      { id: "users", label: t("USERS"), icon: Users },
      {
        id: "open",
        label: `${t("OPEN_POSITIONS")} (${positions?.counts?.open})`,
        icon: LayoutList,
      },
      {
        id: "waiting",
        label: `${t("WAITING_POSITIONS")} (${positions?.counts?.waiting})`,
        icon: HistoryIcon,
      },
      {
        id: "cancelled",
        label: `${t("CANCELLED_POSITIONS")} (${positions?.counts?.cancelled})`,
        icon: CircleOff,
      },
      {
        id: "closed",
        label: `${t("CLOSED_POSITIONS")} (${positions?.counts?.closed})`,
        icon: X,
      },
    ];
  }, [positions]);

  const filteredData = useMemo(() => {
    if (!positions?.tables?.[activeTab]) return [];
    return positions.tables[activeTab].filter((pos: any) =>
      pos.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [positions, activeTab, debouncedSearch]);

  const columns = useMemo(
    () => [
      {
        header: "ID",
        render: (pos: any) => (
          <span className="text-[10px] font-bold text-slate-400">
            #{pos.id.slice(0, 8)}
          </span>
        ),
      },
      {
        header: t("SYMBOL"),
        render: (pos: any) => (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10">
              {getLogoUrl(pos?.website) ? (
                <img
                  src={getLogoUrl(pos?.website)}
                  alt=""
                  className="w-full h-full"
                />
              ) : (
                <div className="text-white w-full h-full bg-brand/50 rounded-2xl flex items-center justify-center font-black">
                  <p className="">{pos?.symbol?.slice(0, 2)}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black uppercase">
                {pos.symbol}
              </span>
              <span
                className={`text-[9px] font-bold ${pos.type === "BUYING" ? "text-up" : "text-down"}`}
              >
                {pos.type}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("USER"),
        render: (pos: any) => (
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase">
              {pos.user?.fullname}
            </span>
            <span className="text-[10px] text-slate-500">
              {pos.user?.email}
            </span>
          </div>
        ),
      },
      {
        header: t("LOTS"),
        render: (pos: any) => (
          <div className="flex flex-col">
            <span className="text-xs font-black">
              {pos.displayLot}{" "}
              <span className="text-slate-400 font-normal">(Display)</span>
            </span>
            <span className="text-[9px] text-slate-400 font-bold">
              ACTUAL: {pos.lots}
            </span>
          </div>
        ),
      },
      {
        header: t("STARTING_PRICE"),
        render: (pos: any) => (
          <div className="flex flex-col">
            <span className="text-xs font-black">
              ₺{pos.displayCost}{" "}
              <span className="text-slate-400 font-normal">(Display)</span>
            </span>
            <span className="text-[9px] text-slate-400 font-bold">
              ACTUAL: ₺{pos.startingPrice}
            </span>
          </div>
        ),
      },
      {
        header: t("HISTORY"),
        render: (pos: any) => {
          const { datePart, timePart } = formatFullTimestamp(pos.openingDate);
          return (
            <span className="text-[10px] font-bold text-slate-500">
              {datePart}, {timePart}
            </span>
          );
        },
      },
      {
        header: t("ACTIONS"),
        align: "right" as const,
        render: (pos: any) => (
          <Link
            href={`/dashboard/users/${pos?.user?.id}?tab=finance`}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-brand transition-colors"
          >
            <Eye size={16} />
          </Link>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="mt-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
              relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all cursor-pointer
              ${
                isActive
                  ? "text-brand"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }
            `}
            >
              <TabIcon size={18} />
              <span>{tab.label}</span>

              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      <div className="transition-all duration-200">
        {activeTab === "users" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <Accounts />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-4">
            <div className="relative w-full max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("SEARCH_SYMBOL")}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 ring-brand/10"
              />
            </div>
            <DataTable
              columns={columns}
              data={filteredData}
              isLoading={isPositionsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTab;
