"use client";

import DesktopTrade from "@/components/screens/DesktopTrade";
import MobileTrade from "@/components/screens/MobileTrade";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      {/* MOBILE */}
      <MobileTrade />

      {/* DESKTOP */}
      <DesktopTrade />
    </div>
  );
};

export default page;
