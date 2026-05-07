"use client";
import { useState } from "react";
import { ShieldCheck, Globe, Save, Mail } from "lucide-react";
import { GithubOutlined } from "@ant-design/icons";

export default function LoginSecurityPage() {
  const [authMethods, setAuthMethods] = useState({
    email: true,
    google: true,
    github: false,
    wallet: true,
  });

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8 pb-20 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter text-fg uppercase flex items-center gap-3">
            <ShieldCheck className="text-brand" size={28} /> Auth Configuration
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Define how users access the platform and enforce global security
            protocols.
          </p>
        </div>
        <button className="cursor-pointer bg-brand text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="">
        {/* LEFT COLUMN: Auth Methods & Policies */}
        <div className="space-y-8">
          {/* Section: Allowed Login Methods */}
          <div className="bg-bg border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              Allowed Auth Methods
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "email",
                  name: "Email & Password",
                  icon: Mail,
                  desc: "Standard login",
                },
                {
                  id: "google",
                  name: "Google AUTH",
                  icon: Globe,
                  desc: "OAuth 2.0 via Google",
                },
                {
                  id: "github",
                  name: "GitHub",
                  icon: GithubOutlined,
                  desc: "Developer auth",
                  comingSoon: true, // Added flag
                },
              ].map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-transparent transition-all ${
                    method.comingSoon ? "opacity-70" : "hover:border-brand/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-bg border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500">
                      <method.icon style={{ fontSize: "18px" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-fg leading-none">
                          {method.name}
                        </p>
                        {method.comingSoon && (
                          <span className="text-[8px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md tracking-tighter">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {method.desc}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Logic */}
                  <button
                    disabled={method.comingSoon}
                    onClick={() =>
                      setAuthMethods((prev) => ({
                        ...prev,
                        [method.id]: !prev[method.id as keyof typeof prev],
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      method.comingSoon
                        ? "bg-slate-200 dark:bg-slate-800 cursor-not-allowed"
                        : authMethods[method.id as keyof typeof authMethods]
                          ? "bg-up cursor-pointer"
                          : "bg-slate-300 dark:bg-slate-700 cursor-pointer"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        authMethods[method.id as keyof typeof authMethods]
                          ? "translate-x-5"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
