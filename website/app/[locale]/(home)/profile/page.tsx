"use client";
import DesktopProfile from "@/components/screens/DesktopProfile";
import MobileProfile from "@/components/screens/MobileProfile";

type Props = {};

const page = (props: Props) => {
  return (
    <>
      {/* MOBILE */}
      <MobileProfile />

      {/* DESKTOP */}
      <DesktopProfile />
    </>
  );
};

export default page;
