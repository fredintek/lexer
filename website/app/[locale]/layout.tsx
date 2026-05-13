import "./../globals.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import StoreProvider from "@/components/StoreProvider";
import { Toaster } from "react-hot-toast";
import NotificationSync from "@/components/NotificationSync";
import AppWrapper from "@/components/AppWrapper";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bulls Yatırım | Profesyonel Yatırım Platformu",
  description: "Bulls Yatırım ile BIST hisselerinde güvenle işlem yapın.",
  keywords: ["Bulls Yatırım", "Borsa İstanbul", "Hisse Senedi"],
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
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
      className={`${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <StoreProvider>
          <NextIntlClientProvider>
            <AppWrapper>{children}</AppWrapper>
            <Toaster />
            <NotificationSync />
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
