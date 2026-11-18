"use client";

import { CheckCircle2, Star, ShieldCheck, Building2, User, Users } from "lucide-react";

const teachers = [
  {
    name: "Ajith Bandara",
    subject: "A/L Physics (Theory & Revision)",
    institute: "Rotary Hall Nugegoda & Syzygy",
    students: "12,400+ Active Students",
    quote:
      "Before NexLMS, counterfeit paper class cards cost us over 400,000 LKR every month. The hardware gate barcode reader paired with instant parent SMS completely stopped hall gate fraud.",
    tag: "Island Top-1 Physics",
  },
  {
    name: "Nirosha Peris",
    subject: "A/L Combined Mathematics",
    institute: "Apex Matara & Galle Hub",
    students: "8,900+ Active Students",
    quote:
      "When 6,000 students join our online paper discussion at 7:00 PM on Sunday, international LMS servers would crash or buffer. NexLMS handles the local traffic seamlessly with zero video leaks.",
    tag: "Combined Maths Leader",
  },
  {
    name: "Channa Wijesuriya",
    subject: "A/L Accounting & Economics",
    institute: "Sasip Nugegoda & Sakya",
    students: "6,200+ Active Students",
    quote:
      "The Dual-Sponsor Card Matrix is brilliant. My teacher-sponsored scholarship students are reconciled from my net payout automatically, without messy manual Excel sheets.",
    tag: "Commerce Island Rank",
  },
  {
    name: "Dr. Dilanthi Seneviratne",
    subject: "A/L Chemistry",
    institute: "Kandy Science Hub & Kurunegala",
    students: "5,700+ Active Students",
    quote:
      "The 3-second hopping dynamic watermark stopped our recorded video discussions from being circulated in pirated Telegram groups overnight. It pays for itself tenfold.",
    tag: "Chemistry Specialist",
  },
];

const tiers = [
  {
    name: "Free Tier",
    badge: "For Solo Starters",
    price: "0",
    unit: "forever",
    description: "Ideal for individual tuition masters starting a specialized paper or revision group.",
    capacity: "Up to 100 Students",
    highlight: false,
    cta: "Start Free Tier",
    ctaStyle: "bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors duration-150 shadow-sm",
    features: [
      "USB/Camera QR attendance scan",
      "100 Dialog BizSMS included/mo",
      "Dynamic hopping watermark on video",
      "Single-device login lock",
      "Digital student ID passcard",
      "Excel student import/export",
    ],
  },
  {
    name: "Solo Tutor",
    badge: "Most Popular in Colombo",
    price: "4,900",
    unit: "month",
    description: "Designed for established individual tuition teachers with mid-sized hall & online batches.",
    capacity: "Up to 500 Students (~LKR 9.80/student)",
    highlight: true,
    cta: "Activate Solo Tutor Plan",
    ctaStyle: "bg-[#FF5A26] hover:bg-[#E04818] text-white font-medium shadow-sm transition-colors duration-150",
    features: [
      "Everything in Free Tier, plus:",
      "1,500 Dialog BizSMS included/mo",
      "Direct PayHere & LANKAQR payments",
      "Dual-Sponsor free card allocations",
      "Automated attendance WhatsApp triggers",
      "HD encrypted video hosting (1080p)",
      "Daily cashier gate report by SMS",
    ],
  },
  {
    name: "Multi-Branch Institute",
    badge: "For Physical Institutes",
    price: "39,900",
    unit: "month",
    description: "Engineered for multi-hall tuition complexes managing dozens of independent teachers.",
    capacity: "5,000+ Students (~LKR 7.90/student)",
    highlight: false,
    cta: "Contact Enterprise Team",
    ctaStyle: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-colors duration-150",
    features: [
      "Everything in Solo Tutor, plus:",
      "Unlimited simultaneous gate turnstiles",
      "Multi-teacher automated commission split",
      "30-day Safe Staff Archiving & handover",
      "Dialog BizSMS custom sender mask (e.g. ROTARY)",
      "Dedicated high-speed CDN in Sri Lanka",
      "24/7 Priority WhatsApp & On-Site support",
    ],
  },
];

export default function SocialProofPricing() {
  return (
    <>
      {/* ─── TEACHER SOCIAL PROOF / REVIEWS ─── */}
      <section id="reviews" className="py-20 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300/70 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium mb-3">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Verified Instructor References
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Trusted by 180+ Island-Top A/L Tuition Masters
            </h2>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              Read how teachers in Colombo, Kandy, Galle, and Kurunegala eliminated ticket fraud and scaled their hybrid classes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((t) => (
              <div
                key={t.name}
                className="surface-card rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      {t.tag}
                    </span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic mb-4">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-xs text-[#0D5C52] dark:text-emerald-400 font-medium">
                    {t.subject}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">
                    {t.institute}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Metric Bar */}
          <div className="mt-12 surface-card rounded-xl p-6 flex flex-wrap items-center justify-between gap-6 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">250,000+</span> Students Assisted
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">180+</span> Registered Masters
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">99.98%</span> Dialog SMS Gate Throughput
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">0%</span> DRM Video Piracy
            </div>
          </div>

        </div>
      </section>

      {/* ─── PER-STUDENT TRANSPARENT PRICING ─── */}
      <section id="pricing" className="py-20 bg-white dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-3">
              Transparent Local Currency Rates
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Simple, Predictable Sri Lankan Pricing
            </h2>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              Billed in Sri Lankan Rupees (LKR). No foreign currency transaction fees, no surprise exchange rate fluctuations, and zero hardware lock-in.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`surface-card rounded-xl p-6 flex flex-col justify-between ${
                  t.highlight
                    ? "border-2 border-[#0D5C52] dark:border-emerald-500 shadow-md relative"
                    : ""
                }`}
              >
                <div>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                      {t.name}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {t.badge}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-mono text-zinc-500">LKR</span>
                      <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-zinc-950 dark:text-white">
                        {t.price}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">/{t.unit}</span>
                    </div>
                    <div className="text-xs text-[#0D5C52] dark:text-emerald-400 font-medium font-mono mt-1">
                      {t.capacity}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    {t.description}
                  </p>

                  {/* Checklist */}
                  <div className="space-y-2.5 mb-8">
                    {t.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Button: Solid, sharp-to-medium rounded-lg, subtle shadow */}
                <a
                  href="#login-card"
                  className={`w-full py-2.5 px-4 text-center text-sm font-medium rounded-lg active:scale-[0.99] transition-all block ${t.ctaStyle}`}
                >
                  {t.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Sri Lankan Payment & Telecom Integration Badges */}
          <div className="mt-14 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4 text-center">
              Official Sri Lankan Payment & Telecom Integrations
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { name: "PayHere", desc: "CBSL Regulated Gateway", tag: "Credit / Debit Cards" },
                { name: "LANKAQR", desc: "Direct App Transfer", tag: "Zero Merchant Fee" },
                { name: "Dialog BizSMS", desc: "Direct SS7 Gateway", tag: "99.9% Attendance SMS" },
                { name: "Mobitel mCentrex", desc: "Automated IVR Support", tag: "Voice Hotlines" },
                { name: "BOC / Commercial", desc: "Local Bank Settlement", tag: "Same-Day Payouts" },
              ].map((partner) => (
                <div
                  key={partner.name}
                  className="surface-card rounded-lg px-4 py-2.5 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-[#0D5C52] dark:bg-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {partner.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {partner.desc} • <span className="text-emerald-600 dark:text-emerald-400">{partner.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
