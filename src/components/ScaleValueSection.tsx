"use client";

import {
  FileText,
  QrCode,
  ShieldAlert,
  PackageCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const valueCards = [
  {
    icon: <FileText className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400" />,
    title: "Automated Fee & Cash Ledger",
    description:
      "Track physical cash payments at the door and online slips in one unified dashboard. Know your exact income and pending dues in real time.",
  },
  {
    icon: <QrCode className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400" />,
    title: "Physical Gate Scan to Parent SMS",
    description:
      "Instant gate check-in using a phone camera or barcode gun. Automatically notifies parents the second their child enters the classroom.",
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400" />,
    title: "Anti-Leak Hybrid Classrooms",
    description:
      "Teach in-person while streaming securely. Recordings automatically publish with the student's dynamic phone number watermarked on screen.",
  },
  {
    icon: <PackageCheck className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400" />,
    title: "Tute & Material Inventory",
    description:
      "Zero missing handouts. Mark printed tute collection at the gate and track postal courier dispatches for online students.",
  },
];

export default function ScaleValueSection() {
  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#0D5C52] dark:text-emerald-400 font-mono mb-2">
            Tailored For Every Scale
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Whether You Teach 30 Students or 5,000+, You Get the Same Enterprise Power
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            No more messy WhatsApp slips, manual attendance sheets, or leaked recordings.
          </p>
        </div>

        {/* Four Clear Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {valueCards.map((card) => (
            <div
              key={card.title}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 mb-4">
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold text-zinc-950 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Banner */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              Start your class with 1 click. Zero server setup required.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Onboard in less than 3 minutes. Test hardware gate scanning and live video DRM for free.
            </p>
          </div>

          <a
            href="#login-card"
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-lg text-white bg-[#FF5A26] hover:bg-[#E04818] active:scale-[0.99] shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Create Your Tutor Portal</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
