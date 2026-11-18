"use client";

import { ShieldCheck, Eye, Fingerprint, Wifi, AlertTriangle, CheckCircle, Lock, MonitorX } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <Fingerprint className="w-5 h-5" />,
    title: "Cryptographic Student Binding",
    desc: "Every enrolled student is bound to their verified NIC and mobile number. Device tokens are stored securely in hardware keystores.",
  },
  {
    step: "02",
    icon: <Eye className="w-5 h-5" />,
    title: "Dynamic Quad-Hopping Watermark",
    desc: "A semi-transparent overlay displaying the student's phone number and ID hops across screen quadrants every 3 seconds during playback.",
  },
  {
    step: "03",
    icon: <MonitorX className="w-5 h-5" />,
    title: "Single-Device Playback Enforcement",
    desc: "Simultaneous logins on secondary phones, tablets, or PC browsers are instantly terminated with automatic session invalidation.",
  },
  {
    step: "04",
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Forensic Leak Attribution",
    desc: "If any student attempts to record using an external camera, the captured watermark immediately identifies their specific student file.",
  },
];

export default function AntiPiracySection() {
  return (
    <section id="anti-piracy" className="py-20 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300/70 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium mb-3">
            <Lock className="w-3.5 h-3.5 text-[#0D5C52] dark:text-emerald-400" />
            Anti-Piracy Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Protecting Sri Lanka's Most Valuable Teaching Intellectual Property
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            A/L tuition content leaks destroy class enrollment. NexLMS is designed specifically to make screen recording useless and illicit file sharing impossible to conceal.
          </p>
        </div>

        {/* 4 Steps - Clean, Grounded Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((s) => (
            <div
              key={s.step}
              className="surface-card rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[#0D5C52] dark:text-emerald-400 border border-zinc-200 dark:border-zinc-700">
                    {s.icon}
                  </div>
                  <span className="font-mono text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Specification Bar */}
        <div className="surface-card rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
            <div className="pt-3 md:pt-0">
              <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">0 Leaks</div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Reported on Telegram/YT in 2026</div>
            </div>
            <div className="pt-3 md:pt-0 md:pl-6">
              <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">&lt; 3.0s</div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Watermark quadrant hop frequency</div>
            </div>
            <div className="pt-3 md:pt-0 md:pl-6">
              <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">100%</div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Encrypted HLS stream coverage</div>
            </div>
            <div className="pt-3 md:pt-0 md:pl-6">
              <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">1 Device</div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Concurrent active session lock</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
