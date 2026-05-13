import BottomNavbar from "@/components/navbar/BottomNavbar";
import Navbar from "@/components/navbar/Navbar";
import React from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="mt-17 pb-5">{children}</main>
      <BottomNavbar />
    </div>
  );
}
