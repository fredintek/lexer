"use client";
import DesktopMarkets from "@/components/screens/DesktopMarkets";
import MobileMarkets from "@/components/screens/MobileMarkets";

type Props = {};

const page = (props: Props) => {
  return (
    <>
      {/* MOBILE */}
      <MobileMarkets />

      {/* DESKTOP */}
      <DesktopMarkets />
    </>
  );
};

export default page;
