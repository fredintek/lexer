"use client";

import MobileHome from "@/components/screens/MobileHome";
import TradeSection from "./_ui/TradeSection";

type Props = {};

const page = (props: Props) => {
  return (
    <>
      {/* MOBILE */}
      <MobileHome />

      {/* DESKTOP */}
      <TradeSection />
    </>
  );
};

export default page;
