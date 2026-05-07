"use client";
import Navbar from "@/components/nav/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import React, { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-bg transition-colors duration-300">
      {/* 1. Fixed/Collapsible Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. Main Content Wrapper */}
      <div className="flex flex-1 flex-col transition-all duration-300 min-w-0">
        {/* 3. Sticky Header */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* 4. Scrollable Page Content */}
        <main className="overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
