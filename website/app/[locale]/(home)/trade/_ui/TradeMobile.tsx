import Logo from "@/components/icons/Logo";
import LanguageSwitcher from "@/components/navbar/LanguageSwitcher";
import ThemeToggle from "@/components/navbar/ThemeToggle";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {};

const TradeMobile = (props: Props) => {
  const t = useTranslations();
  return (
    <div className="md:hidden">
      <nav className="py-4 relative bg-bg text-fg font-sans border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 z-50">
        <div className="box flex justify-between items-center">
          {/* left */}
          <Link href="/" className="flex items-center gap-3">
            <div className="border border-red-500 w-14 flex items-center justify-center text-white font-bold text-lg">
              <Logo />
            </div>
          </Link>

          {/* right */}
          <div className="flex gap-4 items-center">
            <button className="md:hidden shrink-0 bg-brand text-white p-3 rounded-md font-bold shadow-md active:scale-95 transition-transform">
              {t("NAV_DEPOSIT")}
            </button>
            <Search size={18} className="text-slate-500 cursor-pointer" />
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TradeMobile;
