import "./../globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import StoreProvider from "@/components/StoreProvider";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin - Bulls Yatirim",
  description: "Bulls yatirim admin panel",
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
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <StoreProvider>
          <NextIntlClientProvider>
            {children} <Toaster />
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
