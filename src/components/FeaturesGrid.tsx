"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  ShieldCheck,
  CreditCard,
  Archive,
  CheckCircle2,
  XCircle,
  Smartphone,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Check,
  UserCheck,
  FileSpreadsheet,
  Clock,
  Layers,
  Lock,
} from "lucide-react";

export default function FeaturesGrid() {
  // Feature 1: Gate Scanner Simulation State
  const [scanScenario, setScanScenario] = useState<"valid" | "flagged">("valid");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: "verified" | "flagged";
    name: string;
    id: string;
    subject: string;
    time: string;
  }>({
    status: "verified",
    name: "Kasun Sandaruwan",
    id: "STU-2026-MATHS-0418",
    subject: "Combined Maths Theory (Hall A)",
    time: "08:14:22 AM",
  });

  const triggerScan = (type: "valid" | "flagged") => {
    setIsScanning(true);
    setScanScenario(type);
    setTimeout(() => {
      setIsScanning(false);
      if (type === "valid") {
        setScanResult({
          status: "verified",
          name: "Kasun Sandaruwan",
          id: "STU-2026-MATHS-0418",
          subject: "Combined Maths Theory (Hall A)",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
      } else {
        setScanResult({
          status: "flagged",
          name: "Malith Fernando",
          id: "STU-2026-MATHS-0912",
          subject: "Combined Maths Revision (Hall A)",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
      }
    }, 400);
  };

  // Feature 2: Video Player Simulation State
  const [isPlaying, setIsPlaying] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setWatermarkPos((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const watermarkCoords = [
    { top: "12%", left: "8%" },
    { top: "15%", right: "8%" },
    { bottom: "16%", right: "12%" },
    { bottom: "18%", left: "10%" },
  ];

  // Feature 4: Safe Staff Archiving State
  const [archiveDays, setArchiveDays] = useState(24);
  const [isRestored, setIsRestored] = useState(false);

  return (
    <section id="features" className="py-20 bg-white dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-3">
            Physical & Online Hybrid Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Built Specifically for Sri Lanka's Tuition Architecture
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Generic international LMS software fails in Sri Lanka because it lacks gate barcode readers, island-wide SMS infrastructure, and watermarked anti-camcorder DRM. NexLMS handles all three out of the box.
          </p>
        </div>

        {/* 2x2 Clean Grounded Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Physical Hall Barcode / QR Scanner */}
          <div className="surface-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#0D5C52] dark:text-emerald-400 border border-zinc-200 dark:border-zinc-700">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Physical Hall Barcode / QR Scanning
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">Sub-0.4s hardware gate turnstile throughput</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                Connect any regular USB or Bluetooth 2D barcode scanner at the institute gate. Validates monthly fee stamps instantly and triggers automated SMS delivery to parents via Dialog BizSMS.
              </p>

              {/* Interactive Scanner Simulation */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
                {/* Simulation Control Switcher */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Simulate Gate Scanner:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => triggerScan("valid")}
                      className={`px-2.5 py-1 text-xs font-medium rounded border transition-all ${
                        scanScenario === "valid"
                          ? "bg-[#0D5C52] text-white border-[#0D5C52]"
                          : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      Scan Paid Card
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerScan("flagged")}
                      className={`px-2.5 py-1 text-xs font-medium rounded border transition-all ${
                        scanScenario === "flagged"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      Scan Due Card
                    </button>
                  </div>
                </div>

                {/* Gate Display Terminal Mockup */}
                <div className={`p-4 rounded-lg border transition-all ${
                  scanResult.status === "verified"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                    : "bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-800/60"
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        {scanResult.status === "verified" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                              PASS: ENTRY PERMITTED
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 font-mono">
                              FLAGGED: OCTOBER FEE UNPAID
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {scanResult.name}
                      </div>
                      <div className="text-xs font-mono text-zinc-500">
                        {scanResult.id} • {scanResult.subject}
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-zinc-500">
                      <div>{scanResult.time}</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-medium">Gate Scanner #02</div>
                    </div>
                  </div>

                  {/* SMS Dispatch Badge */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                      Parent SMS: <span className="font-mono text-zinc-900 dark:text-zinc-200">071 **** 882</span>
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      SENT (0.3s)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 font-mono flex items-center justify-between">
              <span>Hardware: Honeywell, Zebra, Sunmi POS</span>
              <span>Audit Trail: CBSL Level-3</span>
            </div>
          </div>

          {/* Card 2: Bulletproof Video Protection */}
          <div className="surface-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#0D5C52] dark:text-emerald-400 border border-zinc-200 dark:border-zinc-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Bulletproof Anti-Leak Video Protection
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">Dynamic hopping DRM watermark + Single-session lock</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                Prevents lecture re-recording for Telegram or WhatsApp piracy groups. The viewer's verified Mobile number & NIC ID hops positions every 3 seconds across the lecture video.
              </p>

              {/* Interactive Player Mockup */}
              <div className="relative rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-950 aspect-video flex flex-col justify-between p-3 select-none">
                {/* Top Player Bar */}
                <div className="flex items-center justify-between text-xs text-white/80 z-10">
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    A/L Physics 2026: Thermodynamics Unit 04
                  </span>
                  <span className="font-mono text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
                    1080p 60fps
                  </span>
                </div>

                {/* Hopping Dynamic Watermark (Clean, Grounded, Every 3s) */}
                <div
                  className="absolute z-20 transition-all duration-300 bg-black/60 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded text-white font-mono text-[11px] pointer-events-none"
                  style={watermarkCoords[watermarkPos] as any}
                >
                  <span className="text-amber-400 font-bold">077 481 2901</span> • STU-88219 • IP: 112.134.*
                </div>

                {/* Center Video Content Mockup */}
                <div className="my-auto text-center">
                  <div className="text-xs text-white/60 font-mono mb-1">
                    [Encrypted HLS Stream • Token Revocation Active]
                  </div>
                  <div className="text-sm text-white/90 font-medium">
                    dQ = dU + dW • First Law Formulation
                  </div>
                </div>

                {/* Bottom Player Controls */}
                <div className="z-10 flex items-center justify-between pt-2 border-t border-white/10 text-white/80 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <span className="font-mono text-[11px]">42:15 / 1:30:00</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <Lock className="w-3 h-3" />
                    <span>Single-Device Lock: 1/1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 font-mono flex items-center justify-between">
              <span>DRM: Widevine L1 & FairPlay Compatible</span>
              <span>Watermark interval: 3s hopping</span>
            </div>
          </div>

          {/* Card 3: Dual-Sponsor Free Card Matrix */}
          <div className="surface-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#0D5C52] dark:text-emerald-400 border border-zinc-200 dark:border-zinc-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Dual-Sponsor Free Card Matrix
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">Teacher-Sponsored vs Institute-Funded allocations</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                Tuition masters often grant free cards to top performers or underprivileged students. NexLMS differentiates who absorbs the cost, automating institute facility fee deductions cleanly.
              </p>

              {/* Comparison Matrix Table */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-medium">
                      <th className="p-2.5">Sponsorship Model</th>
                      <th className="p-2.5">Tutor Share</th>
                      <th className="p-2.5">Institute Hall Fee</th>
                      <th className="p-2.5">Automated Ledger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                        Teacher-Sponsored
                        <div className="text-[10px] text-zinc-400 font-mono font-normal">Tutor scholarship</div>
                      </td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">100% Waived</td>
                      <td className="p-2.5 text-zinc-600 dark:text-zinc-300">Paid by Tutor (LKR 450)</td>
                      <td className="p-2.5 text-zinc-500">Auto-deducted from payout</td>
                    </tr>
                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                        Institute-Funded
                        <div className="text-[10px] text-zinc-400 font-mono font-normal">Rank-1 merit aid</div>
                      </td>
                      <td className="p-2.5 text-zinc-600 dark:text-zinc-300">Paid by Institute</td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">100% Waived</td>
                      <td className="p-2.5 text-zinc-500">Comped by Director ledger</td>
                    </tr>
                    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                        50/50 Shared Aid
                        <div className="text-[10px] text-zinc-400 font-mono font-normal">Mutual community pass</div>
                      </td>
                      <td className="p-2.5 text-zinc-600 dark:text-zinc-300">50% Waived</td>
                      <td className="p-2.5 text-zinc-600 dark:text-zinc-300">50% Waived</td>
                      <td className="p-2.5 text-zinc-500">Split settlement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 font-mono flex items-center justify-between">
              <span>Auditing: Monthly reconciliation export</span>
              <span>Format: Excel / PDF Signed</span>
            </div>
          </div>

          {/* Card 4: Safe Staff Archiving with 30-Day Grace Period */}
          <div className="surface-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#0D5C52] dark:text-emerald-400 border border-zinc-200 dark:border-zinc-700">
                    <Archive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Safe Staff Archiving & Handover
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">30-day non-destructive grace period with instant restore</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                Avoid catastrophic accidental deletions of counter cashiers, attendance markers, or hall supervisors. NexLMS freezes credentials into a 30-day quarantine with full receipt history intact.
              </p>

              {/* Handover Simulation Panel */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                      PK
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Priyantha Kumara (Cashier Counter #03)
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Archived on Oct 16, 2026 • Reason: Shift Transition
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                    {isRestored ? "Restored" : `${archiveDays}d Grace Window`}
                  </span>
                </div>

                {/* Progress bar of 30-day period */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-1">
                    <span>Quarantine Progress</span>
                    <span>{isRestored ? "Active in system" : `${30 - archiveDays} / 30 days elapsed`}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isRestored ? "w-full bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: isRestored ? "100%" : `${((30 - archiveDays) / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Handover verification checklist */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Drawer float balanced</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Receipt books reconciled</span>
                  </div>
                </div>

                {/* Restore Action */}
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRestored(!isRestored)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-[0.99] transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isRestored ? "Re-archive Staff" : "One-Click Safe Restore"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 font-mono flex items-center justify-between">
              <span>Security: Permanent purge requires Director OTP</span>
              <span>Logs retained: 7 years</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
