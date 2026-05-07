"use client";
import { useState } from "react";
import {
  Send,
  Users,
  User,
  Mail,
  Layout,
  AlertTriangle,
  FileText,
  Trash2,
  Loader2,
} from "lucide-react";
import RecipientSelector from "@/components/ReciepientSelector";
import { useSendBroadcastMutation } from "@/lib/redux/services/email.api";
import toast from "react-hot-toast";
import { EMAIL_TEMPLATES, TEMPLATE_LABELS } from "./_ui/data";
import { useTranslations } from "next-intl";

export default function EmailPage() {
  const t = useTranslations();
  const [recipientType, setRecipientType] = useState<
    "single" | "multiple" | "all"
  >("single");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [sendBroadcast, { isLoading }] = useSendBroadcastMutation();

  const handleSend = async () => {
    if (!subject || !message)
      return toast.error("Subject and Message are required");
    if (recipientType !== "all" && selectedUserIds.length === 0)
      return toast.error("Please select recipients");

    try {
      await sendBroadcast({
        mode: recipientType,
        userIds: recipientType === "all" ? undefined : selectedUserIds,
        subject,
        message,
      }).unwrap();

      toast.success("Broadcast queued successfully!");
      setSubject("");
      setMessage("");
      setSelectedUserIds([]);
    } catch (err) {
      toast.error("Failed to dispatch emails");
    }
  };

  const applyTemplate = (templateName: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[templateName];
    if (template) {
      setSubject(t(template.subjectKey));
      setMessage(t(template.messageKey));
      toast.success(`${t(TEMPLATE_LABELS[templateName])} ${t("APPLIED")}`);
    }
  };

  const discardMessage = () => {
    setSubject("");
    setMessage("");
    toast.success(`Fields cleared`);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tighter text-fg uppercase">
          {t("EMAIL_SYSTEM")}
        </h1>
        <p className="text-sm font-medium text-slate-500">
          {t("EMAIL_SYSTEM_DESC")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: The Composer (Main Form) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="space-y-6">
              {/* Recipient Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("RECIPIENT_MODE")}
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                  {[
                    { id: "single", icon: User, label: t("SINGLE") },
                    { id: "multiple", icon: Users, label: t("MULTIPLE") },
                    { id: "all", icon: Mail, label: t("ALL_USERS") },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setRecipientType(type.id as any)}
                      className={`cursor-pointer flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                        recipientType === type.id
                          ? "bg-bg text-brand shadow-sm"
                          : "text-slate-500 hover:text-fg"
                      }`}
                    >
                      <type.icon size={14} />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Input (Conditional) */}
              {recipientType !== "all" && (
                <RecipientSelector
                  type={recipientType}
                  selectedIds={selectedUserIds}
                  onSelectionChange={(ids) => setSelectedUserIds(ids)}
                />
              )}

              {/* Email Content */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-fg">
                    {t("SUBJECT_LINE")}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t("SUBJECT_PLACEHOLDER")}
                    className="w-full px-4 py-3 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-brand transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-fg">
                      {t("MESSAGE_BODY")}
                    </label>
                  </div>
                  <textarea
                    rows={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("MESSAGE_PLACEHOLDER")}
                    className="w-full px-4 py-4 bg-bg border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:border-brand transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={discardMessage}
                  className="cursor-pointer flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                  <span className="text-xs font-bold">{t("DISCARD")}</span>
                </button>

                <div className="flex gap-3">
                  {/* <button className="cursor-pointer px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-fg text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    Save Draft
                  </button> */}
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className={`cursor-pointer disabled:opacity-60 flex items-center gap-2 px-8 py-2.5 bg-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 hover:scale-105 transition-all ${recipientType === "all" ? "ring-1 ring-brand/10" : ""}`}
                  >
                    <Send size={18} />
                    <span>
                      {isLoading ? (
                        <div className="flex gap-2 items-center">
                          <Loader2 className="animate-spin" />{" "}
                          <span>{t("DISPATCHING")}</span>
                        </div>
                      ) : recipientType === "all" ? (
                        t("BROADCAST_TO_ALL")
                      ) : (
                        t("SEND_EMAIL")
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warning for "All Users" */}
          {recipientType === "all" && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="text-orange-500 shrink-0" size={20} />
              <p className="text-[11px] text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                <span className="font-black uppercase">{t("CAUTION")}:</span>{" "}
                {t("BROADCAST_WARNING", { count: "12,408" })}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Templates */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-4">
              <Layout size={18} className="text-brand" />
              <h2 className="text-xs font-black uppercase tracking-widest text-fg">
                {t("QUICK_TEMPLATES")}
              </h2>
            </div>
            <div className="space-y-2">
              {Object.keys(EMAIL_TEMPLATES).map((temp) => (
                <button
                  key={temp}
                  onClick={() =>
                    applyTemplate(temp as keyof typeof EMAIL_TEMPLATES)
                  }
                  className="cursor-pointer w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand hover:bg-brand/5 text-left transition-all group"
                >
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-brand">
                    {t(TEMPLATE_LABELS[temp as keyof typeof EMAIL_TEMPLATES])}
                  </span>
                  <FileText
                    size={14}
                    className="text-slate-300 group-hover:text-brand"
                  />
                </button>
              ))}
            </div>
            {/* Pro Tip: Visual Guide for Placeholders */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">
                {t("EDITOR_TIP")}
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {t("EDITOR_TIP_DESC")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
