"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  PieChart,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClearCache } from "@/hooks/use-clear-cache";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const clearCacheMutation = useClearCache();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };


  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Explore",
      href: "/explore",
      icon: BarChart3,
    },
     // Added for completeness based on typical app structure
    {
      title: "Portfolio",
      href: "/portfolio", 
      icon: PieChart,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    }
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-slate-800 bg-[#1a1a1a] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!isCollapsed && (
          <span className="text-lg font-bold text-white tracking-tight">
            VibeCode
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-2 pt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.title}</span>}
              
              {isCollapsed && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50 whitespace-nowrap">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => clearCacheMutation.mutate()}
            disabled={clearCacheMutation.isPending}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-3 text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <Trash2 className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Clear Cache</span>
            )}
          </button>
        </div>

        <div className="border-t border-slate-800 p-4">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                US
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">User</span>
                <span className="text-xs text-slate-400">user@example.com</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                US
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
