"use client";

import {
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Lock,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

const footerNavigation = {
  Capabilities: [
    { name: "Hardware Gate Turnstile Scan", href: "#features" },
    { name: "Moving DRM Video Watermark", href: "#features" },
    { name: "Dual-Sponsor Scholarship Cards", href: "#features" },
    { name: "30-Day Safe Staff Archiving", href: "#features" },
    { name: "Dialog BizSMS Gateway", href: "#features" },
  ],
  Teachers: [
    { name: "Solo Tutor Plan (<500)", href: "#pricing" },
    { name: "Multi-Branch Institutes", href: "#pricing" },
    { name: "Tuition Revenue Share", href: "#features" },
    { name: "Student Mobile Passcards", href: "#portal-preview" },
    { name: "Cashier Shift Reconciliation", href: "#features" },
  ],
  Compliance: [
    { name: "PDPA Sri Lanka Privacy Notice", href: "#" },
    { name: "CBSL Regulated Payments", href: "#" },
    { name: "Terms of Class Service", href: "#" },
    { name: "Data Processing Agreement", href: "#" },
    { name: "Anti-Piracy Enforcement SLA", href: "#" },
  ],
  Contact: [
    { name: "Colombo Operations Hub", href: "#" },
    { name: "WhatsApp Direct Desk", href: "https://wa.me/94771234567" },
    { name: "Email: support@nexlms.lk", href: "mailto:support@nexlms.lk" },
    { name: "Hardware Integration Desk", href: "#" },
    { name: "Status: All Gateways Operational", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer id="contact" className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      
      {/* Grounded Call to Action Strip */}
      <div className="bg-[#0D5C52] text-white py-12 border-b border-[#0a4a40]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-200 mb-1">
                Zero Setup Fees • 24-Hour Deployment
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Ready to Upgrade Your Class to NexLMS?
              </h3>
              <p className="text-sm text-emerald-100 mt-1 max-w-xl">
                Join 180+ island-top tuition masters and stop counterfeit card fraud in your physical halls this month.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <a
                href="#login-card"
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-lg text-white bg-[#FF5A26] hover:bg-[#E04818] active:scale-[0.99] shadow-sm transition-colors duration-150 text-center flex items-center justify-center gap-2"
              >
                <span>Register Class Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/94771234567?text=Hi%20NexLMS%2C%20I%20am%20interested%20in%20onboarding%20my%20tuition%20class"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium rounded-lg text-white border border-emerald-400/40 hover:bg-emerald-800/40 active:scale-[0.99] transition-all text-center flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>WhatsApp Live Desk</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#0D5C52] text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-base font-semibold text-white">
                Nex<span className="text-emerald-400">LMS</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              The unified physical and online operating system for Sri Lankan tuition classes and education institutes.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-zinc-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                PayHere Merchant Verified
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                256-bit SSL Banking Guard
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                PDPA Compliant Database
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerNavigation).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-3">
                {category}
              </h4>
              <ul className="space-y-2 text-xs">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            © 2026 NexLMS (Pvt) Ltd • Colombo 03, Sri Lanka. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Dialog BizSMS SS7</span>
            <span>•</span>
            <span>LANKAQR v2.0</span>
            <span>•</span>
            <span>PayHere IPN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
