"use client";
import DesktopTrade from "@/components/screens/DesktopTrade";
import MobileTrade from "@/components/screens/MobileTrade";

type Props = {};

const page = (props: Props) => {
  return (
    <>
      {/* MOBILE */}
      <MobileTrade />

      {/* DESKTOP */}
      <DesktopTrade />
    </>
  );
};

export default page;
