"use client";

import { QrCode, Smartphone, CheckCircle2, XCircle } from "lucide-react";

export default function AttendancePortalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Hardware Gate Scanner Terminal
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Turnstile barcode/QR reader with instantaneous Dialog BizSMS parent alerts.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-zinc-500">USB / Bluetooth Scanner #01 Ready</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs uppercase">
            <CheckCircle2 className="w-4 h-4" />
            PASS: ENTRY GRANTED
          </div>
          <div className="text-sm font-semibold text-zinc-950 dark:text-white mt-2">
            Kasun Sandaruwan
          </div>
          <div className="text-xs font-mono text-zinc-500 mt-0.5">
            STU-2026-MATHS-0418 • Combined Maths Theory (Hall A)
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-xs flex justify-between font-mono">
            <span>Parent SMS: 071 **** 882</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">DELIVERED (0.3s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
