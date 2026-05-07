import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <main className="pt-20 lg:pt-24 min-h-screen">{children}</main>
      {/* <Footer /> */}
    </>
  );
};

export default HomeLayout;
