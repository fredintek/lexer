"use client";
import MobileHome from "@/components/screens/MobileHome";
import TradeSection from "./trade/_ui/TradeSection";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      {/* MOBILE */}
      <MobileHome />

      {/* DESKTOP */}
      <TradeSection />
    </div>
  );
};

export default page;
