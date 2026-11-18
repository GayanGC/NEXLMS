"use client";

import { useState } from "react";
import {
  Users,
  CreditCard,
  QrCode,
  ShieldCheck,
  Archive,
  RotateCcw,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Loader2,
} from "lucide-react";

interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  phone: string;
  status: "ACTIVE" | "ARCHIVED";
  archiveReason?: string;
  daysRemaining?: number;
}

const initialStaff: StaffMember[] = [
  {
    id: "staff-101",
    fullName: "Priyantha Kumara",
    role: "CASHIER",
    phone: "077 448 1902",
    status: "ACTIVE",
  },
  {
    id: "staff-102",
    fullName: "Nalin Wickramasinghe",
    role: "ATTENDANCE_CHECKER",
    phone: "071 883 2201",
    status: "ACTIVE",
  },
  {
    id: "staff-103",
    fullName: "Sunil Jayawardena",
    role: "CASHIER",
    phone: "075 991 4050",
    status: "ARCHIVED",
    archiveReason: "Shift Handover - Rotary Counter 03",
    daysRemaining: 24,
  },
];

export default function AdminPortalPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleArchiveStaff = (staffId: string) => {
    if (!archiveReason.trim()) {
      alert("Please specify a reason for archiving (e.g. shift transition or leave).");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === staffId
            ? {
                ...s,
                status: "ARCHIVED",
                archiveReason: archiveReason.trim(),
                daysRemaining: 30,
              }
            : s
        )
      );
      setArchivingId(null);
      setArchiveReason("");
      setIsProcessing(false);
      setActionMessage("Staff member safely archived. Full transaction history preserved with 30-day restore guarantee.");
      setTimeout(() => setActionMessage(null), 5000);
    }, 300);
  };

  const handleRestoreStaff = (staffId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === staffId
            ? {
                ...s,
                status: "ACTIVE",
                archiveReason: undefined,
                daysRemaining: undefined,
              }
            : s
        )
      );
      setIsProcessing(false);
      setActionMessage("Staff member successfully restored to ACTIVE status with zero data loss.");
      setTimeout(() => setActionMessage(null), 5000);
    }, 300);
  };

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Institute Operating Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Real-time hall turnstile gate scans, cashier reconciliation, and multi-tenant staff management.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dialog BizSMS: Operational (99.9%)
          </span>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-mono">Enrolled Students</span>
            <Users className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 dark:text-white">
            3,480
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Across 12 A/L subject batches</div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-mono">Today's Hall Gate Scans</span>
            <QrCode className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 dark:text-white">
            1,842
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            1,842 SMS Dispatched
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-mono">Fee Revenue (This Month)</span>
            <CreditCard className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 dark:text-white">
            LKR 4.28M
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">PayHere + Door Cash receipts</div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-mono">Video Piracy Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            Zero Leaks
          </div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">3s Hopping DRM Active</div>
        </div>
      </div>

      {/* Staff Management Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
              Staff Directory & 30-Day Safe Handover
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Instead of destructive instant deletion, staff accounts enter a 30-day quarantine with full receipt audits intact.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-zinc-400">
              Total Staff: {staffList.length}
            </span>
          </div>
        </div>

        {/* Desktop View: Clean Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
                <th className="pb-3 font-medium">Staff Member</th>
                <th className="pb-3 font-medium">Assigned Role</th>
                <th className="pb-3 font-medium">Status & Handover</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-zinc-950 dark:text-white">
                      {staff.fullName}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">{staff.phone}</div>
                  </td>

                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] border border-zinc-200 dark:border-zinc-700">
                      {staff.role}
                    </span>
                  </td>

                  <td className="py-3.5 pr-4">
                    {staff.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active on Duty
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-mono font-medium">
                          <Clock className="w-3 h-3" />
                          Archived ({staff.daysRemaining}d grace window)
                        </span>
                        {staff.archiveReason && (
                          <div className="text-[10px] text-zinc-400 italic">
                            Reason: {staff.archiveReason}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 text-right">
                    {staff.status === "ACTIVE" ? (
                      archivingId === staff.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            placeholder="Handover reason..."
                            disabled={isProcessing}
                            value={archiveReason}
                            onChange={(e) => setArchiveReason(e.target.value)}
                            className="px-2.5 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 w-48 text-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleArchiveStaff(staff.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 transition-colors"
                          >
                            {isProcessing ? "Confirming..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setArchivingId(null);
                              setArchiveReason("");
                            }}
                            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setArchivingId(staff.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                          Archive Staff
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRestoreStaff(staff.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 ml-auto transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        One-Click Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Stacked Cards (Visible on screens < md, zero horizontal overflow) */}
        <div className="md:hidden space-y-3">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm text-zinc-950 dark:text-white">
                    {staff.fullName}
                  </div>
                  <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {staff.phone}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] border border-zinc-300 dark:border-zinc-700 uppercase shrink-0">
                  {staff.role}
                </span>
              </div>

              <div>
                {staff.status === "ACTIVE" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active on Duty
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-mono font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Archived ({staff.daysRemaining}d grace window)
                    </span>
                    {staff.archiveReason && (
                      <div className="text-xs text-zinc-400 italic">
                        Reason: {staff.archiveReason}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                {staff.status === "ACTIVE" ? (
                  archivingId === staff.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Handover reason..."
                        disabled={isProcessing}
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleArchiveStaff(staff.id)}
                          className="min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center disabled:opacity-50"
                        >
                          {isProcessing ? "Confirming..." : "Confirm Archive"}
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => {
                            setArchivingId(null);
                            setArchiveReason("");
                          }}
                          className="min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setArchivingId(staff.id)}
                      className="w-full min-h-[44px] text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      Archive Staff Member
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleRestoreStaff(staff.id)}
                    className="w-full min-h-[44px] text-xs font-medium rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    One-Click Restore to Active
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
