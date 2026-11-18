"use client";

import { QrCode, Video, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function StudentPortalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Student Learning Dashboard & Digital Pass
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Your digital gate entry barcode, watermarked video lectures, and fee cards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Digital Passcard */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Digital Gate Pass</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold">
              PAID: NOV 2026
            </span>
          </div>

          <div className="flex flex-col items-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl mb-4">
            <QrCode className="w-32 h-32 text-zinc-800 dark:text-zinc-200" />
            <div className="text-xs font-mono text-zinc-500 mt-2">STU-2026-MATHS-0418</div>
          </div>

          <div className="text-xs text-zinc-500 font-mono text-center">
            Present this QR code to the turnstile scanner upon entering the hall.
          </div>
        </div>

        {/* Video Lectures */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Live Video Classes</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              DRM Active
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                Integration Theory - Part 04 (Definite Integrals)
              </div>
              <div className="text-zinc-500 font-mono text-[11px] mt-1">
                Recorded Sunday • Duration 2h 45m
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                Thermodynamics Heat Engine Paper Discussion
              </div>
              <div className="text-zinc-500 font-mono text-[11px] mt-1">
                Recorded Tuesday • Duration 1h 30m
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
