"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  CalendarCheck,
  UserCheck,
} from "lucide-react";

interface TabItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: any;
  requiresTeacher?: boolean;
}

const navTabs: TabItem[] = [
  { label: "Overview", shortLabel: "Overview", href: "/portal/teacher", icon: LayoutDashboard },
  { label: "Tutes & Requests", shortLabel: "Tutes", href: "/portal/teacher/tutes", icon: FileText },
  { label: "Finance & Profit", shortLabel: "Finance", href: "/portal/teacher/finance", icon: DollarSign, requiresTeacher: true },
  { label: "Appointments & Summons", shortLabel: "Summons", href: "/portal/teacher/appointments", icon: CalendarCheck },
  { label: "Class Assistant", shortLabel: "Assistant", href: "/portal/teacher/assistant", icon: UserCheck, requiresTeacher: true },
];

export default function TeacherPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("SOLO_TEACHER");

  useEffect(() => {
    async function loadRole() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUserRole(data.user.role);
        }
      } catch {
        // Fallback default
      }
    }
    loadRole();
  }, []);

  const visibleTabs = navTabs.filter((tab) => {
    if (tab.requiresTeacher && userRole === "CLASS_ASSISTANT") {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Desktop Sub-Navbar (hidden on mobile) */}
      <div className="hidden md:block border-b border-zinc-200 dark:border-zinc-800 pb-1">
        <nav className="flex space-x-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/portal/teacher"
                ? pathname === "/portal/teacher"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-[#0D5C52] text-white shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Tab Content */}
      <div className="min-w-0">{children}</div>

      {/* Mobile Fixed Bottom Navigation Bar (md:hidden) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-around px-2"
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/portal/teacher"
              ? pathname === "/portal/teacher"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors ${
                isActive
                  ? "text-[#0D5C52] dark:text-emerald-400 font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/60"
                    : "bg-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#0D5C52] dark:text-emerald-400" : ""}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
