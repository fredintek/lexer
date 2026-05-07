import React from "react";

interface Props {
  children: React.ReactNode;
}

const TradeLayout = ({ children }: Props) => {
  return <main className="min-h-screen">{children}</main>;
};

export default TradeLayout;
