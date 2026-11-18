"use client";

import { CreditCard, Receipt, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";

export default function CashierPortalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Cashier Counter & Door Fee Drawer
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Counter shift cash reconciliation, monthly paper class stamps, and bank slip approval.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-mono text-zinc-500">Shift Opening Float</div>
          <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-1 tabular-nums">
            LKR 25,000
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Counter 01 • Shift verified</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-mono text-zinc-500">Today's Door Cash Collected</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            LKR 184,500
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">62 receipts issued</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-mono text-zinc-500">Online Slip Verifications</div>
          <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-1 tabular-nums">
            18 Pending
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">PayHere IPN auto-settled</div>
        </div>
      </div>
    </div>
  );
}
