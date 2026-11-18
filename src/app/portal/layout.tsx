"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  Building2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: string;
  status: string;
}

interface TenantProfile {
  id: string;
  name: string;
  slug: string;
  tenantType: string;
  studentScale?: string;
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user && data.tenant) {
          setUser(data.user);
          setTenant(data.tenant);
        } else {
          router.push("/#login-card");
        }
      } catch {
        router.push("/#login-card");
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0D5C52] animate-spin flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-xs font-mono text-zinc-500">Verifying NexLMS Tenant Session...</div>
        </div>
      </div>
    );
  }

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    INSTITUTE_ADMIN: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    SOLO_TEACHER: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    MANAGER: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    CASHIER: "bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    ATTENDANCE_CHECKER: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    STUDENT: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand + Active Tenant Context */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <a href="/" className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[#0D5C52] text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
                  Nex<span className="text-[#0D5C52] dark:text-emerald-400">LMS</span>
                </span>
              </a>

              <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

              {tenant && (
                <div className="hidden sm:flex items-center gap-2 min-w-0 truncate">
                  <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {tenant.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase shrink-0">
                    {tenant.tenantType.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>

            {/* Right: User Profile, Role Badge, Theme Toggle & Logout */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-bold font-mono">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 max-w-[160px] truncate">
                      {user.fullName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                          roleBadgeColors[user.role] || "bg-zinc-100"
                        }`}
                      >
                        {user.role}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">{user.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Switcher (Accessible touch target) */}
              <ThemeToggle />

              {/* Sign Out Button (Accessible touch target) */}
              <button
                onClick={handleLogout}
                type="button"
                className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900/50 bg-white dark:bg-zinc-900 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Portal View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
