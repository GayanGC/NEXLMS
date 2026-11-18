"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GraduationCap,
} from "lucide-react";

type AuthTab = "login" | "register" | "parent";
type ClassScale = "solo" | "mega" | "institute";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("login");
  const [scale, setScale] = useState<ClassScale>("solo");
  const [showPassword, setShowPassword] = useState(false);

  // Form states (Teacher & Staff)
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Form states (Parent View)
  const [parentStudentCode, setParentStudentCode] = useState("");
  const [parentPhoneOrPin, setParentPhoneOrPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync tab switching via custom events and URL hashes
  useEffect(() => {
    const handleTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<AuthTab>;
      if (customEvent.detail) {
        setTab(customEvent.detail);
        setErrorMessage(null);
        setSuccessMessage(null);
      }
    };
    window.addEventListener("nexlms-switch-tab", handleTabSwitch);
    if (typeof window !== "undefined") {
      if (window.location.hash === "#parent-portal" || window.location.hash === "#parent-view") {
        setTab("parent");
      }
    }
    return () => window.removeEventListener("nexlms-switch-tab", handleTabSwitch);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (tab === "parent") {
        // Parent View Authentication
        const cleanCode = parentStudentCode.toUpperCase().trim();
        const cleanPhone = parentPhoneOrPin.trim();

        if (!cleanCode || !cleanPhone) {
          setErrorMessage("Please enter both Student Code and Parent Mobile Number (or last 4 digits).");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/parent/${encodeURIComponent(cleanCode)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "VERIFY",
            phoneOrPin: cleanPhone,
            last4Phone: cleanPhone.replace(/\D/g, "").slice(-4),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.verified) {
          setErrorMessage(
            data.error ||
              "Student code or parent phone number did not match. Please check with your class teacher."
          );
          setLoading(false);
          return;
        }

        // Store verified session flag in sessionStorage
        try {
          sessionStorage.setItem(
            `parent_verified_${cleanCode}`,
            cleanPhone.replace(/\D/g, "").slice(-4)
          );
        } catch {
          // Fallback if sessionStorage is disabled
        }

        setSuccessMessage(`Verified for ${data.student?.fullName || cleanCode}! Redirecting to child portal...`);
        setTimeout(() => {
          router.push(`/parent/${cleanCode}`);
        }, 500);
        return;
      }

      if (tab === "login") {
        if (!phoneOrEmail || !password) {
          setErrorMessage("Please enter your phone/email and password.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneOrEmail, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorMessage(data.error || "Login failed. Please check your credentials.");
          setLoading(false);
          return;
        }

        setSuccessMessage("Login successful! Redirecting to your class portal...");
        setTimeout(() => {
          router.push(data.redirectUrl || "/portal");
        }, 600);
      } else {
        // Register mode
        if (!instituteName || !fullName || !phone || !password) {
          setErrorMessage("Please fill in all required registration fields.");
          setLoading(false);
          return;
        }

        if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
          setErrorMessage("Password must be at least 8 characters long and contain at least 1 letter and 1 number.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instituteName,
            instituteOrClassName: instituteName,
            fullName,
            phone,
            email: email.trim().length > 0 ? email.trim() : undefined,
            password,
            studentScale: scale === "solo" ? "< 100 Students" : scale === "mega" ? "1,000 - 5,000 Students" : "Institute (Multi-Hall)",
            tenantType: scale === "solo" ? "SOLO_TEACHER" : "INSTITUTE",
            accountType: scale === "solo" ? "SOLO_TEACHER" : "INSTITUTE",
          }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorMessage(data.error || "Registration failed. Please check your details.");
          setLoading(false);
          return;
        }

        setSuccessMessage("Onboarding complete! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push(data.redirectUrl || "/portal");
        }, 600);
      }
    } catch {
      setErrorMessage("Network error. Please check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-28 md:pb-24 ambient-mesh border-b border-zinc-200/80 dark:border-zinc-800 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading + Interactive Form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.15] mb-4">
              The Unified Operating System for Sri Lanka's Tuition Classes
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed mb-6 sm:mb-8 max-w-2xl">
              Engineered for island-rank teachers and mega institutes. Handle physical hall barcode scans, single-device anti-leak video streaming, and parent SMS alerts at sub-second speeds.
            </p>

            {/* Quick Interactive Login / Register Card */}
            <div
              id="login-card"
              className="bg-white border border-zinc-200 shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none rounded-2xl p-5 sm:p-6 max-w-xl w-full"
            >
              {/* Segmented Tabs (3 tabs with 44px min tap targets) */}
              <div className="grid grid-cols-3 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl mb-5 border border-zinc-200/70 dark:border-zinc-700/60">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setTab("login");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`min-h-[44px] px-1 sm:px-2 py-2 text-[11px] sm:text-xs md:text-sm font-medium rounded-lg transition-all flex items-center justify-center text-center leading-tight ${
                    tab === "login"
                      ? "bg-[#FF5A26] text-white shadow-sm font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  Login to Portal
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setTab("register");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`min-h-[44px] px-1 sm:px-2 py-2 text-[11px] sm:text-xs md:text-sm font-medium rounded-lg transition-all flex items-center justify-center text-center leading-tight ${
                    tab === "register"
                      ? "bg-[#FF5A26] text-white shadow-sm font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  Register Class
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setTab("parent");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`min-h-[44px] px-1 sm:px-2 py-2 text-[11px] sm:text-xs md:text-sm font-medium rounded-lg transition-all flex items-center justify-center text-center leading-tight ${
                    tab === "parent"
                      ? "bg-[#0D5C52] text-white shadow-sm font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  Parent View
                </button>
              </div>

              {/* Status alerts */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Segmented Selector for Class Scale (when in register mode) */}
              {tab === "register" && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Select Class Operating Scale:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "solo", label: "Solo Teacher (<100)" },
                      { id: "mega", label: "Mega Class (5,000+)" },
                      { id: "institute", label: "Institute Owner" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={loading}
                        onClick={() => setScale(item.id as ClassScale)}
                        className={`min-h-[44px] px-2 py-2 text-xs font-medium text-center rounded-lg border transition-all flex items-center justify-center ${
                          scale === item.id
                            ? "bg-[#0D5C52] text-white border-[#0D5C52] shadow-sm"
                            : "bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inputs */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {tab === "parent" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Student Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          disabled={loading}
                          value={parentStudentCode}
                          onChange={(e) => setParentStudentCode(e.target.value.toUpperCase().trim())}
                          placeholder="e.g. STU-1042"
                          className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 text-sm font-mono tracking-wider bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60 uppercase"
                        />
                        <GraduationCap className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Found on student ID card, fee receipts, or attendance SMS alerts.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Parent Mobile Number or Last 4 Digits <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          disabled={loading}
                          value={parentPhoneOrPin}
                          onChange={(e) => setParentPhoneOrPin(e.target.value)}
                          placeholder="e.g. 077 123 4567 or 4567"
                          className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60"
                        />
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        No password required. Enter your registered mobile number or its last 4 digits.
                      </p>
                    </div>
                  </>
                ) : tab === "register" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Class / Institute Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          disabled={loading}
                          value={instituteName}
                          onChange={(e) => setInstituteName(e.target.value)}
                          placeholder="e.g. Bandara Physics Academy"
                          className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60"
                        />
                        <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          disabled={loading}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ajith Bandara"
                          className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60"
                        />
                        <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Sri Lankan Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          disabled={loading}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="077 123 4567"
                          className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60"
                        />
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled={loading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="teacher@example.com"
                          className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60"
                        />
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Email address or Mobile number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={phoneOrEmail}
                        onChange={(e) => setPhoneOrEmail(e.target.value)}
                        placeholder="e.g. 077 123 4567 or teacher@gmail.com"
                        className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60"
                      />
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                    </div>
                  </div>
                )}

                {tab !== "parent" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Password
                      </label>
                      {tab === "login" && (
                        <a href="#" className="text-xs font-medium text-[#0D5C52] dark:text-emerald-400 hover:underline">
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full min-h-[44px] pl-9 pr-11 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]/20 dark:focus:ring-emerald-500/20 focus:border-[#0D5C52] transition-colors disabled:opacity-60"
                      />
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(!showPassword)}
                        className="w-11 h-11 flex items-center justify-center absolute right-0 top-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {tab === "register" && (
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Must be at least 8 characters with at least 1 letter and 1 number.
                      </p>
                    )}
                  </div>
                )}

                {/* Primary Button (44px min tap target) */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full min-h-[44px] py-2.5 px-4 text-sm font-medium rounded-lg text-white active:scale-[0.99] shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 mt-3 disabled:opacity-70 disabled:cursor-not-allowed ${
                    tab === "parent"
                      ? "bg-[#0D5C52] hover:bg-[#09433c]"
                      : "bg-[#FF5A26] hover:bg-[#E04818]"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tab === "parent" ? "Verifying student..." : "Processing..."}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {tab === "parent"
                          ? "View Child's Attendance & Fees"
                          : tab === "login"
                          ? "Enter Class Portal"
                          : "Complete Free Institute Onboarding"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {tab !== "parent" ? (
                  <>
                    {/* Divider */}
                    <div className="relative my-3 flex items-center justify-center">
                      <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                      <span className="bg-white dark:bg-zinc-900 px-2 text-[11px] font-mono uppercase text-zinc-400 absolute">
                        or
                      </span>
                    </div>

                    {/* Secondary Button (44px min tap target) */}
                    <button
                      type="button"
                      disabled={loading}
                      className="w-full min-h-[44px] py-2 px-4 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors duration-150 active:scale-[0.99] shadow-sm flex items-center justify-center gap-2"
                    >
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </button>
                  </>
                ) : (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-emerald-900 dark:text-emerald-200">
                        Instant Student Academic Access
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-normal">
                        Check real-time gate attendance, monthly fee payment cards, homework worksheets, and schedule teacher consultations.
                      </span>
                    </div>
                  </div>
                )}
              </form>

              {/* Helper footnote */}
              <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D5C52] dark:text-emerald-400" />
                  PayHere Gateway Verified
                </span>
                <span className="font-mono">256-bit SSL • CBSL Guard</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Bold, Focused Student Photography */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-white dark:bg-zinc-900 p-2">
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src="/student-hero.jpg"
                  alt="Sri Lankan student with study materials giving a thumbs up"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
