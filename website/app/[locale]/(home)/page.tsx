// import Features from "@/components/home-sections/Features";
// import FooterBanner from "@/components/home-sections/FooterBanner";
// import Hero from "@/components/home-sections/Hero";
// import HeroBanner from "@/components/home-sections/HeroBanner";
// import RiskAndCTA from "@/components/home-sections/RiskAndCta";
// import Stats from "@/components/home-sections/Stats";
// import Steps from "@/components/home-sections/Steps";

// export default function Home() {
//   return (
//     <>
//       <Hero />
//       <HeroBanner />
//       <Features />
//       <Steps />
//       <Stats />
//       <RiskAndCTA />
//       <FooterBanner />
//     </>
//   );
// }

"use client";
import { useLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";

export default function Home() {
  const locale = useLocale();
  redirect({ href: "/auth/login", locale });

  return null;
}
