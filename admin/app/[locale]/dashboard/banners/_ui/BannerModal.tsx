"use client";
import { useState, useEffect, useRef } from "react";
import { X, Upload, Save, Loader2 } from "lucide-react";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "@/lib/redux/services/banner.api";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerType: "hero" | "footer";
  editingBanner?: any;
}

export default function BannerModal({
  isOpen,
  onClose,
  bannerType,
  editingBanner,
}: BannerModalProps) {
  const t = useTranslations();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const isEdit = !!editingBanner;

  // Sync state when editing
  useEffect(() => {
    if (editingBanner) {
      setTitle(editingBanner.title);
      setLink(editingBanner.link || "");
      setPreview(editingBanner.image?.url || null);
    } else {
      setTitle("");
      setLink("");
      setFile(null);
      setPreview(null);
    }
  }, [editingBanner, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!title) return toast.error("Title is required");
    if (!isEdit && !file) return toast.error("Please select an image");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("link", link);
    formData.append("type", bannerType);
    if (file) formData.append("file", file);

    try {
      if (isEdit) {
        await updateBanner({ id: editingBanner.id, data: formData }).unwrap();
        toast.success("Banner updated!");
      } else {
        await createBanner(formData).unwrap();
        toast.success("Banner created!");
      }
      onClose();
    } catch (err) {
      toast.error("Failed to save banner");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-900">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter text-fg">
              {isEdit
                ? t("EDIT_BANNER")
                : t("NEW_BANNER_SLIDE", { type: bannerType })}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("LEXER_MEDIA_ENGINE")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* File Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-full h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-all"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform">
                  <Upload
                    size={24}
                    className="text-slate-400 group-hover:text-brand"
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("CLICK_TO_UPLOAD")}
                </span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {t("BANNER_TITLE")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("BANNER_TITLE_PLACEHOLDER")}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {t("REDIRECT_LINK")}
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={t("REDIRECT_PLACEHOLDER")}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-fg transition-colors"
          >
            {t("CANCEL")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
            className="cursor-pointer flex-1 bg-brand text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isCreating || isUpdating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Save size={16} />
                <span>{isEdit ? t("UPDATE_SLIDE") : t("SAVE_BANNER")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
