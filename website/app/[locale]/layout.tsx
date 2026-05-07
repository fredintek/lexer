import "./../globals.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import StoreProvider from "@/components/StoreProvider";
import { Toaster } from "react-hot-toast";
import NotificationSync from "@/components/NotificationSync";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bulls Yatırım | Profesyonel Yatırım Platformu",
  description:
    "Bulls Yatırım ile BIST hisselerinde güvenle işlem yapın. Gerçek zamanlı veriler ve gelişmiş işlem araçları.",
  keywords: [
    "Bulls Yatırım",
    "Borsa İstanbul",
    "Hisse Senedi",
    "Trading",
    "Yatırım",
  ],
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html
      data-scroll-behavior="smooth"
      lang={locale}
      className={`${raleway.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <StoreProvider>
          <NextIntlClientProvider>
            {children} <Toaster />
            <NotificationSync />
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
