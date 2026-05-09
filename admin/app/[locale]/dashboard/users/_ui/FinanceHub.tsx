import React, { useState, useMemo, useEffect } from "react";
import { Edit3, Search, ShieldAlert, X, Info, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useEditUserPositionMutation,
  useGetUserPositionsQuery,
} from "@/lib/redux/services/position.api";
import toast from "react-hot-toast";
import DataTable from "@/components/dataTable/DataTable";
import { useDebounce } from "@/hooks/useDebounce";

const FinanceHub = ({ userId }: { userId: string }) => {
  const t = useTranslations();
  const [activeSubTab, setActiveSubTab] = useState<
    "open" | "waiting" | "closed" | "cancelled"
  >("open");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const { data: portfolio, isLoading } = useGetUserPositionsQuery(userId);
  const [updatePosition, { isLoading: isUpdating }] =
    useEditUserPositionMutation();

  // Search Logic
  const filteredData = useMemo(() => {
    const data = portfolio?.[activeSubTab] || [];
    if (!debouncedSearch) return data;
    return data.filter((pos: any) =>
      pos.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [portfolio, activeSubTab, debouncedSearch]);

  const handleOpenEdit = (pos: any) => {
    setSelectedPosition(pos);
    setFormData({
      displayLot: pos.displayLot,
      displayCost: pos.displayCost,
      lots: pos.lots,
      startingPrice: pos.startingPrice,
      marginUsed: pos.marginUsed,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await updatePosition({
        userId,
        positionId: selectedPosition.id,
        data: formData,
      }).unwrap();
      toast.success(t("UPDATE_SUCCESS"));
      setIsModalOpen(false);
    } catch (err) {
      toast.error(t("UPDATE_FAILED"));
    }
  };

  const columns = [
    {
      header: t("SYMBOL"),
      render: (pos: any) => (
        <div className="flex flex-col">
          <span className="font-black uppercase">{pos.symbol}</span>
          <span
            className={`text-[9px] font-bold ${pos.type === "BUYING" ? "text-up" : "text-down"}`}
          >
            {t(pos.type)}
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
            <small className="text-slate-400 font-normal">
              ({t("DISPLAY")})
            </small>
          </span>
          <span className="text-[9px] text-red-500 font-bold">
            {pos.lots}{" "}
            <small className="text-slate-400 font-normal">
              ({t("ACTUAL")})
            </small>
          </span>
        </div>
      ),
    },
    {
      header: t("COST"),
      render: (pos: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-black">₺{pos.displayCost}</span>
          <span className="text-[9px] text-red-500 font-bold">
            ₺{pos.startingPrice}
          </span>
        </div>
      ),
    },
    {
      header: t("ACTIONS"),
      align: "right" as const,
      render: (pos: any) => (
        <button
          onClick={() => handleOpenEdit(pos)}
          className="cursor-pointer p-2 hover:bg-slate-50 text-brand rounded-lg transition-all"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder={t("SEARCH_SYMBOL")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 ring-brand/10"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          {["open", "waiting", "closed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`cursor-pointer px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${
                activeSubTab === tab
                  ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                  : "text-slate-400"
              }`}
            >
              {t(tab.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} isLoading={isLoading} />

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("EDIT_POSITION")}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
            <Info size={18} />
            <p className="text-[11px] font-medium">
              {t("WARNING_ACTUAL_DATA")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Display Layer */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-brand uppercase tracking-widest">
                {t("DISPLAY_LAYER")}
              </h4>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  {t("LOTS")}
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-brand"
                  value={formData.displayLot}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayLot: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  {t("COST")}
                </label>
                <input
                  type="number"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-brand"
                  value={formData.displayCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayCost: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Actual Layer */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                {t("SOURCE_OF_TRUTH")}
              </h4>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  {t("ACTUAL")} {t("LOTS")}
                </label>
                <input
                  type="number"
                  disabled
                  className="w-full p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl text-sm border border-red-100 dark:border-red-900/30 outline-none focus:border-red-500"
                  value={formData.lots}
                  onChange={(e) =>
                    setFormData({ ...formData, lots: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  {t("ACTUAL")} {t("PRICE")}
                </label>
                <input
                  disabled
                  type="number"
                  className="w-full p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl text-sm border border-red-100 dark:border-red-900/30 outline-none focus:border-red-500"
                  value={formData.startingPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startingPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="cursor-pointer px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all"
            >
              {t("CANCEL")}
            </button>
            <button
              disabled={isUpdating}
              onClick={handleSave}
              className="cursor-pointer px-6 py-3 bg-brand text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {t("SAVE_CHANGES")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinanceHub;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
