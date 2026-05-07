"use client";
import { useState } from "react";
import {
  Plus,
  ImageIcon,
  Trash2,
  GripVertical,
  LayoutTemplate,
  ToggleRight,
  PencilLine,
  ArrowDownWideNarrow,
  Loader2,
  ToggleLeft,
} from "lucide-react";
import {
  useDeleteBannerMutation,
  useGetBannersQuery,
  useToggleBannerMutation,
} from "@/lib/redux/services/banner.api";
import toast from "react-hot-toast";
import BannerModal from "./_ui/BannerModal";
import { Popconfirm } from "antd";
import { useTranslations } from "next-intl";

export default function BannersPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"hero" | "footer">("hero");

  const { data: banners = [], isLoading } = useGetBannersQuery({
    type: activeTab,
  });
  const [toggleBanner, { isLoading: isToggling }] = useToggleBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const isLimitReached =
    activeTab === "hero" ? banners.length >= 5 : banners.length >= 1;

  const openCreate = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const openEdit = (banner: any) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleBanner(id).unwrap();
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id).unwrap();
      toast.success("Banner removed");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* --- Header & Tabs (Same as your draft) --- */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
            {t("BANNER_MANAGEMENT")}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {t("BANNER_MANAGEMENT_DESC")}
          </p>
        </div>
      </div>

      <div className="flex gap-4 p-1.5 bg-slate-100 dark:bg-slate-900 w-fit rounded-2xl">
        {(["hero", "footer"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-bg text-brand shadow-sm"
                : "text-slate-500 hover:text-fg"
            }`}
          >
            {tab === "hero" ? (
              <LayoutTemplate size={14} />
            ) : (
              <ArrowDownWideNarrow size={14} />
            )}
            {tab === "hero" ? t("HOME_HERO_SLIDER") : t("PRE_FOOTER_BANNER")}
          </button>
        ))}
      </div>

      {/* --- Content Area --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
            {activeTab === "hero"
              ? t("ACTIVE_SLIDER_SEQUENCE")
              : t("FOOTER_PROMO_SLOTS")}
          </h2>
          <span className="text-[10px] font-bold bg-brand/10 text-brand px-2 py-1 rounded-md lowercase">
            {t("SLOTS_USED", {
              count: banners.length,
              total: activeTab === "hero" ? "5" : "1",
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-brand" />
            </div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className={`group flex flex-col md:flex-row items-center gap-6 p-4 bg-bg border rounded-4xl transition-all ${
                  banner.isActive
                    ? "border-slate-200 dark:border-slate-800 hover:border-brand/50"
                    : "opacity-60 border-dashed border-slate-300 dark:border-slate-700"
                }`}
              >
                {activeTab === "hero" && (
                  <div className="hidden md:flex cursor-grab text-slate-300 hover:text-slate-500">
                    <GripVertical size={24} />
                  </div>
                )}

                {/* Image Preview - Using real Cloudinary URL */}
                <div className="w-full md:w-64 h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 relative">
                  {banner.image?.url ? (
                    <img
                      src={banner.image.url}
                      alt={banner.title}
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-fg uppercase tracking-tight">
                      {banner.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        banner.isActive
                          ? "bg-up/10 text-up"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {banner.isActive ? t("LIVE") : t("PAUSED")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                    {t("LINK")}:{" "}
                    <span className="text-brand">
                      {banner.link || t("NO_DESTINATION_LINK")}
                    </span>
                  </p>

                  <div className="flex gap-4 pt-2">
                    <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 pl-4">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {t("CREATED")}
                      </span>
                      <span className="text-[11px] font-bold text-fg">
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center gap-4 w-full md:w-auto md:border-l border-slate-100 dark:border-slate-800 md:pl-6">
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-brand transition-colors cursor-pointer"
                  >
                    <PencilLine size={18} />
                  </button>
                  <Popconfirm
                    onConfirm={() => handleDelete(banner.id)}
                    title={t("ARE_YOU_SURE")}
                  >
                    <button className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </Popconfirm>
                  <button
                    onClick={() => handleToggle(banner.id)}
                    disabled={isToggling}
                    className="cursor-pointer py-2"
                  >
                    {banner.isActive ? (
                      <ToggleRight
                        size={32}
                        className="text-up cursor-pointer"
                      />
                    ) : (
                      <ToggleLeft
                        size={32}
                        className="text-slate-300 cursor-pointer"
                      />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Empty State / Add Slot */}
          {!isLimitReached ? (
            <button
              onClick={openCreate}
              className="w-full py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-4xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <Plus size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">
                {activeTab === "hero"
                  ? t("ADD_NEW_SLIDE")
                  : t("ADD_NEW_FOOTER_BANNER")}
              </span>
            </button>
          ) : (
            /* Optional: Informative placeholder when full */
            <div className="w-full py-8 border border-slate-100 dark:border-slate-900 rounded-4xl flex flex-col items-center justify-center gap-1 opacity-50 grayscale">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("MAX_SLOTS_REACHED")}
              </span>
              <p className="text-[9px] font-medium text-slate-500">
                {t("DELETE_EXISTING_TO_ADD", { tab: activeTab })}
              </p>
            </div>
          )}
        </div>
      </div>

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bannerType={activeTab}
        editingBanner={editingBanner}
      />
    </div>
  );
}
