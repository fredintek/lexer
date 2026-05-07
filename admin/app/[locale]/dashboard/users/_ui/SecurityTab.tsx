"use client";
import { formatFullTimestamp } from "@/lib/helpers";
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  History,
  Lock,
  Unlock,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function SecurityTab({ user }: { user: any }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. MFA & ACCESS CONTROL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <ShieldCheck size={14} className="text-brand" />{" "}
              {t("MFA_CONFIGURATION")}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-fg">{t("STATUS")}</p>
                    <p className="text-[10px] font-bold text-brand uppercase">
                      {user.mfaEnabled ? t("ENABLED") : t("DISABLED")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
                  {t("PREFERRED_METHOD")}
                </p>
                <div className="flex items-center gap-2">
                  <KeyRound size={14} className="text-brand" />
                  <span className="text-xs font-bold text-fg uppercase">
                    {user.mfaMethod || t("NONE")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. RECENT LOGIN HISTORY */}
        <div className="lg:col-span-2 bg-bg border border-slate-200 dark:border-slate-800 rounded-4xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <History size={14} className="text-brand" /> {t("LOGIN_ACTIVITY")}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {t("EVENT_IP")}
                  </th>
                  <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {t("BROWSER_DEVICE")}
                  </th>
                  <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter text-right">
                    {t("TIMESTAMP")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {user?.loginHistories
                  ?.slice?.(0, 5)
                  ?.map((log: any, i: number) => (
                    <tr key={i} className="group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                            {i === 0 ? (
                              <Unlock size={14} className="text-green-500" />
                            ) : (
                              <Lock size={14} />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-fg uppercase">
                              {log?.wasSuccessful
                                ? t("LOGIN_SUCCESS")
                                : t("LOGIN_FAILED")}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">
                              {log?.ipAddress}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-[11px] font-bold text-fg">
                          {log?.browser}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase">
                          {log?.device}
                        </p>
                      </td>
                      <td className="py-4 text-right">
                        {log.loginAt ? (
                          (() => {
                            const { datePart, timePart } = formatFullTimestamp(
                              log.loginAt,
                            );
                            return (
                              <>
                                <p className="text-[10px] font-black text-fg uppercase">
                                  {datePart}
                                </p>
                                <p className="text-[9px] font-medium text-slate-400">
                                  {timePart}
                                </p>
                              </>
                            );
                          })()
                        ) : (
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            {t("NOT_AVAILABLE")}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
