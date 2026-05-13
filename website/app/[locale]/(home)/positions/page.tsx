"use client";
import DesktopPositions from "@/components/screens/DesktopPositions";
import MobilePositions from "@/components/screens/MobilePositions";

type Props = {};

const page = (props: Props) => {
  return (
    <>
      {/* MOBILE */}
      <MobilePositions />

      {/* DESKTOP */}
      <DesktopPositions />
    </>
  );
};

export default page;
