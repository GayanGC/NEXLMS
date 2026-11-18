"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Sun, Moon, Menu, X, Users } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Anti-Piracy", href: "#anti-piracy" },
  { label: "Portal", href: "#portal-preview" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabClick = (targetTab: "login" | "register" | "parent") => {
    if (typeof window !== "undefined") {
      const el = document.getElementById("login-card");
      if (el) {
        window.dispatchEvent(new CustomEvent("nexlms-switch-tab", { detail: targetTab }));
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = targetTab === "parent" ? "/#parent-portal" : "/#login-card";
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0D5C52] text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Nex<span className="text-[#0D5C52] dark:text-emerald-400">LMS</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Parent Portal Link */}
            <button
              type="button"
              onClick={() => handleTabClick("parent")}
              className="px-3 py-2 text-sm font-medium text-[#0D5C52] hover:text-[#09433c] dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Parent Portal</span>
            </button>

            {/* Flat Sign In Link */}
            <button
              type="button"
              onClick={() => handleTabClick("login")}
              className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>

            {/* Solid Register Class CTA Button */}
            <button
              type="button"
              onClick={() => handleTabClick("register")}
              className="min-h-[40px] px-4 py-2 text-sm font-medium rounded-lg text-white bg-[#FF5A26] hover:bg-[#E04818] active:scale-[0.99] shadow-sm transition-colors duration-150 flex items-center justify-center"
            >
              Register Class
            </button>
          </div>

          {/* Mobile hamburger & theme toggle (44px min tap targets) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              type="button"
              aria-label="Toggle menu"
              className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="min-h-[44px] flex items-center px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleTabClick("parent");
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 text-center px-3 text-sm font-medium text-[#0D5C52] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30"
            >
              <Users className="w-4 h-4" />
              <span>Parent Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleTabClick("login");
              }}
              className="w-full min-h-[44px] flex items-center justify-center text-center px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleTabClick("register");
              }}
              className="w-full min-h-[44px] flex items-center justify-center text-center px-3 text-sm font-medium text-white bg-[#FF5A26] hover:bg-[#E04818] rounded-lg shadow-sm transition-colors duration-150"
            >
              Register Class
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
