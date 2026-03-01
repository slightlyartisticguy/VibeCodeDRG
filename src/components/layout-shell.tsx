"use client";

import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#121212]">
      <Sidebar className="hidden md:flex flex-shrink-0" />
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {children}
      </div>
      <Toaster />
    </div>
  );
}
