"use client";
import {
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { Zap, Mail, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Products",
      links: [
        { name: "BIST Stocks", href: "/stocks" },
        { name: "Crypto Pairs", href: "/crypto" },
        { name: "Synthetic Indices", href: "/synthetics" },
        { name: "Leveraged Trading", href: "/leverage" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "API Docs", href: "/docs" },
        { name: "Market Hours", href: "/hours" },
        { name: "Fee Schedule", href: "/fees" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Lexer", href: "/about" },
        { name: "Security", href: "/security" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="bg-bg pt-24 pb-12 border-t border-slate-100 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="h-10 w-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:rotate-12 transition-transform">
                <Zap size={20} className="text-white fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-fg">
                Lexer<span className="text-brand">.</span>
              </span>
            </Link>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm uppercase italic tracking-tight">
              Bridging the gap between Borsa İstanbul and the global digital
              economy. Trade with institutional-grade speed and security.
            </p>
            <div className="flex items-center gap-5 text-slate-400">
              <TwitterOutlined
                size={20}
                className="hover:text-brand transition-colors cursor-pointer"
              />
              <LinkedinOutlined
                size={20}
                className="hover:text-brand transition-colors cursor-pointer"
              />
              <GithubOutlined
                size={20}
                className="hover:text-brand transition-colors cursor-pointer"
              />
              <Mail
                size={20}
                className="hover:text-brand transition-colors cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-fg/40">
                  {group.title}
                </h5>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs font-black uppercase tracking-tight text-slate-500 hover:text-brand transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Section: Regulatory Notice */}
        <div className="py-8 border-y border-slate-100 dark:border-slate-800/60 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="flex items-start gap-4 max-w-3xl">
            <ShieldCheck className="text-up shrink-0 mt-1" size={20} />
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
              Risk Warning: Trading financial instruments involves high risk.
              Synthetic assets and leverage can lead to losses exceeding your
              initial deposit. Lexer is a technology provider and does not
              provide financial advice. TR: Kaldıraçlı işlemler yüksek risk
              içerir.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="h-2 w-2 rounded-full bg-up animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Live Systems: <span className="text-fg">Operational</span>
            </span>
          </div>
        </div>

        {/* Bottom Section: Copyright & Language */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            © {currentYear} Lexer Trading Ltd. Built for the Bosphorus.
          </p>

          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-fg transition-all">
              <Globe size={14} /> English (US)
            </button>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:underline"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
