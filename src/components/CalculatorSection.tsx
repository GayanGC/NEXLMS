"use client";

import { useState } from "react";
import {
  Users,
  Building2,
  Calculator,
  MessageSquare,
  Server,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

function formatLKR(n: number) {
  return `LKR ${n.toLocaleString("en-US")}`;
}

export default function CalculatorSection() {
  const [studentCount, setStudentCount] = useState(450);
  const [isInstitute, setIsInstitute] = useState(false);

  // Sri Lankan tuition operational metrics
  const smsPerStudent = 4;
  const smsCostPerUnit = 1.25; // Dialog BizSMS volume rate
  const manualCashierCost = isInstitute ? 140000 : 45000;
  const manualHosting = studentCount > 1000 ? 65000 : 25000;
  
  const platformFee =
    studentCount <= 100
      ? 0
      : studentCount <= 500
      ? 4900
      : studentCount <= 2000
      ? 14900
      : 39900;

  const smsMonthly = Math.round(studentCount * smsPerStudent * smsCostPerUnit);
  const totalManual = manualCashierCost + manualHosting + smsMonthly;
  const totalNexLMS = platformFee + smsMonthly;
  const monthlySavings = totalManual - totalNexLMS;
  const savingsPct = Math.round((monthlySavings / totalManual) * 100);

  const planName =
    studentCount <= 100
      ? "Free Tier"
      : studentCount <= 500
      ? "Solo Tutor"
      : studentCount <= 2000
      ? "Growing Academy"
      : "Multi-Branch Institute";

  return (
    <section id="portal-preview" className="py-20 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300/70 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium mb-3">
            <Calculator className="w-3.5 h-3.5 text-[#0D5C52] dark:text-emerald-400" />
            Operational Expense Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Calculate Your Tuition Class Savings
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Compare the hard cost of manual counter staff, fragmented Zoom/Vimeo hosting, and paper ticket fraud against the unified NexLMS engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-7 surface-card rounded-xl p-6 sm:p-7">
            {/* Student Count Range */}
            <div className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  Monthly Active Students
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-zinc-950 dark:text-white">
                    {studentCount.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {planName}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={30}
                max={5000}
                step={20}
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-zinc-200 dark:bg-zinc-800 cursor-pointer accent-[#0D5C52]"
              />

              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mt-2">
                <span>30 (Paper Group)</span>
                <span>500 (Solo Hall)</span>
                <span>2,000 (Hub)</span>
                <span>5,000+ (Mega Class)</span>
              </div>
            </div>

            {/* Operating Model Switcher */}
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {isInstitute ? <Building2 className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {isInstitute ? "Multi-Teacher Institute Branch" : "Solo Tuition Master"}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {isInstitute ? "Shared multi-counter staff & hall turnstiles" : "Direct teacher ledger & private hall"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInstitute(!isInstitute)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                  isInstitute
                    ? "bg-[#0D5C52] text-white border-[#0D5C52]"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {isInstitute ? "Multi-Teacher" : "Solo Mode"}
              </button>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400 font-sans">Dialog BizSMS Gate Alerts ({smsPerStudent * studentCount} SMS)</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatLKR(smsMonthly)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400 font-sans">Fragmented Video Hosting & CDN (Manual)</span>
                <span className="text-red-600 dark:text-red-400 line-through">{formatLKR(manualHosting)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400 font-sans">Manual Cashier Counter & Card Punching</span>
                <span className="text-red-600 dark:text-red-400 line-through">{formatLKR(manualCashierCost)}</span>
              </div>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Net Savings Display */}
            <div className="surface-card rounded-xl p-6 border-2 border-emerald-600/30 dark:border-emerald-500/30">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono mb-2">
                <TrendingDown className="w-4 h-4" />
                Estimated Monthly Savings
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mb-2">
                {formatLKR(monthlySavings)}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
                You reduce overhead by <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{savingsPct}%</span> compared to legacy offline/paper registration and manual SMS tools.
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="surface-card rounded-lg p-4">
                <div className="text-zinc-400 mb-1">Traditional Cost:</div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">{formatLKR(totalManual)}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5 font-sans">Manual tools & cashier overhead</div>
              </div>
              <div className="surface-card rounded-lg p-4 border border-[#0D5C52]/40 dark:border-emerald-500/40">
                <div className="text-[#0D5C52] dark:text-emerald-400 font-semibold mb-1">NexLMS All-In:</div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">{formatLKR(totalNexLMS)}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5 font-sans">Platform + BizSMS included</div>
              </div>
            </div>

            {/* Quick Action Button */}
            <a
              href="#login-card"
              className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-[#FF5A26] hover:bg-[#E04818] active:scale-[0.99] shadow-sm transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <span>Deploy NexLMS for {studentCount} Students</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
