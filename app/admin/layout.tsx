"use client";

import React from "react";
import { Outfit } from "next/font/google";
import { SidebarProvider, useSidebar } from "@/adminContext/SidebarContext";
import AppSidebar from "@/adminLayout/AppSidebar";
import Backdrop from "@/adminLayout/Backdrop";
import AppHeader from "@/adminLayout/AppHeader";
import { ThemeProvider } from "@/adminContext/ThemeContext";
import "./adminGlobals.css";
import TanstackProviders from "@/components/admin/Providers";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <TanstackProviders>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <div className="p-4 mx-auto max-w-[1536px] md:p-6">{children}</div>
        </div>
      </div>
    </TanstackProviders>
  );
}
