"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Download,
  AlertTriangle,
  Clock,
  MessageSquare,
  BookOpen,
  User,
  Plus,
  X,
  Loader2,
  Lock,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface PublicStudentMeta {
  studentName: string;
  studentCode: string;
  classTitle: string;
  instituteName: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  method: string;
}

interface FeePayment {
  id: string;
  month: string;
  amount: number;
  status: "PAID" | "UNPAID";
  paidAt?: string | null;
}

interface ClassTute {
  id: string;
  title: string;
  month: string;
  fileUrl: string;
}

interface Appointment {
  id: string;
  initiatedBy: "PARENT" | "TEACHER";
  requestedDate: string;
  confirmedDate?: string | null;
  confirmedTime?: string | null;
  reason: string;
  teacherNote?: string | null;
  status: "PENDING" | "APPROVED" | "RESCHEDULED" | "COMPLETED";
}

interface TuteRequest {
  id: string;
  tuteId: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface VerifiedData {
  student: {
    id: string;
    fullName: string;
    studentCode: string;
    parentName?: string | null;
    parentPhone: string;
    isFreeCard: boolean;
  };
  class: {
    id: string;
    title: string;
    subject: string;
    grade: string;
    monthlyFee: number;
    scheduleText: string;
    activeNotice?: string | null;
    enableTutes: boolean;
  };
  attendance: AttendanceRecord[];
  fees: FeePayment[];
  tutes: ClassTute[];
  appointments: Appointment[];
  tuteRequests: TuteRequest[];
}

export default function ParentPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D5C52]" />
            <span className="text-xs font-mono">Loading student portal...</span>
          </div>
        </div>
      }
    >
      <ParentPortalContent />
    </Suspense>
  );
}

function ParentPortalContent() {
  const params = useParams();
  const studentCode = ((params?.studentCode as string) || "").toUpperCase();

  const [meta, setMeta] = useState<PublicStudentMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Verification state
  const [last4Phone, setLast4Phone] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appDate, setAppDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [appReason, setAppReason] = useState("");
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const [isTuteModalOpen, setIsTuteModalOpen] = useState(false);
  const [selectedTuteId, setSelectedTuteId] = useState("");
  const [tuteReason, setTuteReason] = useState("");
  const [isSubmittingTute, setIsSubmittingTute] = useState(false);

  // Load public student meta
  useEffect(() => {
    async function loadMeta() {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const res = await fetch(`/api/parent/${studentCode}`);
        const data = await res.json();
        if (data.success) {
          setMeta(data);
        } else {
          setMetaError(data.error || "Student code not found");
        }
      } catch {
        setMetaError("Network error loading student details");
      } finally {
        setMetaLoading(false);
      }
    }
    loadMeta();
  }, [studentCode]);

  // Handle Parent 4-Digit Verification
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (last4Phone.length !== 4) {
      setVerifyError("Please enter exactly 4 digits");
      return;
    }
    setVerifyError(null);
    setIsVerifying(true);

    try {
      const res = await fetch(`/api/parent/${studentCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY",
          last4Phone,
        }),
      });

      const data = await res.json();
      if (data.success && data.verified) {
        setVerifiedData(data);
      } else {
        setVerifyError(data.error || "Verification failed. The 4 digits do not match.");
      }
    } catch {
      setVerifyError("Error connecting to server. Please retry.");
    } finally {
      setIsVerifying(false);
    }
  }

  // Submit Parent Appointment Request
  async function handleAppointmentRequest(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingApp(true);
    try {
      const res = await fetch(`/api/parent/${studentCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPOINTMENT_REQUEST",
          last4Phone,
          requestedDate: appDate,
          reason: appReason,
        }),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setVerifiedData((prev) =>
          prev
            ? { ...prev, appointments: [data.appointment, ...prev.appointments] }
            : prev
        );
        setIsAppointmentModalOpen(false);
        setAppReason("");
        alert("Consultation request submitted to teacher successfully.");
      } else {
        alert(data.error || "Failed to submit request");
      }
    } catch {
      alert("Error submitting request");
    } finally {
      setIsSubmittingApp(false);
    }
  }

  // Submit Absentee Tute Request
  async function handleTuteRequest(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingTute(true);
    try {
      const res = await fetch(`/api/parent/${studentCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TUTE_REQUEST",
          last4Phone,
          tuteId: selectedTuteId,
          reason: tuteReason,
        }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setVerifiedData((prev) =>
          prev
            ? { ...prev, tuteRequests: [data.request, ...prev.tuteRequests] }
            : prev
        );
        setIsTuteModalOpen(false);
        setTuteReason("");
        alert("Tutorial access request submitted for teacher approval.");
      } else {
        alert(data.error || "Failed to submit tutorial request");
      }
    } catch {
      alert("Error submitting tutorial request");
    } finally {
      setIsSubmittingTute(false);
    }
  }

  if (metaLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D5C52]" />
          <span className="text-xs font-mono">Loading student portal...</span>
        </div>
      </div>
    );
  }

  if (metaError || !meta) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-lg font-bold text-zinc-950 dark:text-white">
            Student Record Not Found
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {metaError || "The student code does not match any registered student."}
          </p>
        </div>
      </div>
    );
  }

  // STEP 1: VERIFICATION SCREEN (If unverified)
  if (!verifiedData) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-6">
          {/* Logo / Brand Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{meta.instituteName || "NexLMS"} Secured Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Parent & Student Access
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {meta.studentName} ({meta.studentCode}) • {meta.classTitle}
            </p>
          </div>

          {/* Verification Form Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
                Security Verification
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                For student privacy and academic security, please enter the <strong>last 4 digits</strong> of your registered parent mobile phone number.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {verifyError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300">
                  {verifyError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Last 4 Digits of Mobile Number:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    placeholder="••••"
                    value={last4Phone}
                    onChange={(e) => setLast4Phone(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-[1em] text-lg font-mono px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                  />
                </div>
                <div className="text-[11px] text-zinc-400 text-center mt-1.5">
                  Example: If phone is 077 123 4567, enter 4567
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || last4Phone.length !== 4}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Unlock Child Portal</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: VERIFIED FULL DASHBOARD
  const urgentSummons = verifiedData.appointments.filter(
    (a) => a.initiatedBy === "TEACHER" && a.status !== "COMPLETED"
  );

  const presentAttendance = verifiedData.attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate =
    verifiedData.attendance.length > 0
      ? Math.round((presentAttendance / verifiedData.attendance.length) * 100)
      : 100;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white">
              NexLMS Parent Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
              {verifiedData.student.studentCode}
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Student & Class Banner */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {verifiedData.student.fullName}
              </h1>
              {verifiedData.student.isFreeCard && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Scholarship Free Card
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {verifiedData.class.title} • {verifiedData.class.grade} ({verifiedData.class.subject})
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-2 mt-2">
              <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{verifiedData.class.scheduleText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="min-h-[44px] px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0D5C52] dark:text-emerald-400" />
              <span>Request Meeting</span>
            </button>
          </div>
        </div>

        {/* URGENT TEACHER SUMMONS ALERT BANNER */}
        {urgentSummons.length > 0 && (
          <div className="space-y-3">
            {urgentSummons.map((summon) => (
              <div
                key={summon.id}
                className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>URGENT TEACHER SUMMONS NOTICE</span>
                </div>
                <div className="text-rose-950 dark:text-rose-200 font-medium">
                  {summon.reason}
                </div>
                <div className="text-rose-800 dark:text-rose-300 font-mono text-[11px]">
                  Scheduled Date: <strong>{summon.confirmedDate || summon.requestedDate}</strong> @ <strong>{summon.confirmedTime || "Class Hall"}</strong>
                </div>
                {summon.teacherNote && (
                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-zinc-900/60 border border-rose-200 dark:border-rose-900/40 text-zinc-800 dark:text-zinc-200">
                    <strong>Teacher Instructions:</strong> {summon.teacherNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ACTIVE CLASS BROADCAST NOTICE */}
        {verifiedData.class.activeNotice && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-amber-900 dark:text-amber-200">Class Announcement:</strong>
              <div className="text-amber-800 dark:text-amber-300 leading-relaxed">
                {verifiedData.class.activeNotice}
              </div>
            </div>
          </div>
        )}

        {/* 2-COLUMN SECTION: ATTENDANCE & FEES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECTION 1: ATTENDANCE */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Gate Attendance History
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 tabular-nums">
                {attendanceRate}% Present
              </span>
            </div>

            {verifiedData.attendance.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs font-mono">
                No attendance recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {verifiedData.attendance.map((rec) => {
                  const isPresent = rec.status === "PRESENT";
                  return (
                    <div
                      key={rec.id}
                      className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {rec.date}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isPresent
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: MONTHLY FEE CARDS */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#FF5A26]" />
                <h2 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Monthly Fee Status
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                Rs. {verifiedData.class.monthlyFee.toLocaleString()} / mo
              </span>
            </div>

            {verifiedData.fees.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs font-mono">
                No fee billing records available.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {verifiedData.fees.map((fee) => {
                  const isPaid = fee.status === "PAID";
                  return (
                    <div
                      key={fee.id}
                      className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                          {fee.month}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                          Rs. {fee.amount.toLocaleString()}
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                          isPaid
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {isPaid ? "✓ PAID" : "PAYMENT DUE"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: CLASS TUTES & WORKSHEETS */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
                Lesson Tutorials & Worksheets ({verifiedData.tutes.length})
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Download tutorial PDFs or request access if your child was absent.
              </p>
            </div>

            <button
              onClick={() => {
                if (verifiedData.tutes.length > 0) {
                  setSelectedTuteId(verifiedData.tutes[0].id);
                }
                setIsTuteModalOpen(true);
              }}
              className="min-h-[40px] px-3.5 py-1.5 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Missed Lesson Tute</span>
            </button>
          </div>

          {verifiedData.tutes.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No digital worksheets published for this class yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {verifiedData.tutes.map((tute) => {
                const request = verifiedData.tuteRequests.find((r) => r.tuteId === tute.id);
                return (
                  <div
                    key={tute.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-medium text-zinc-500">
                        {tute.month}
                      </span>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {tute.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <a
                        href={tute.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[36px] px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#0D5C52] dark:text-emerald-400" />
                        <span>Download PDF</span>
                      </a>

                      {request && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            request.status === "APPROVED"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          Request: {request.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: CONSULTATION REQUESTS */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
              My Consultation Requests ({verifiedData.appointments.length})
            </h2>
          </div>

          {verifiedData.appointments.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No meetings scheduled. Click "Request Meeting" above to arrange a consultation with the teacher.
            </div>
          ) : (
            <div className="space-y-3">
              {verifiedData.appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {app.initiatedBy === "TEACHER" ? "Teacher Summon" : "Parent Request"}
                      </span>
                      <span className="text-zinc-500 font-mono">
                        • {app.confirmedDate || app.requestedDate}
                      </span>
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400">
                      Reason: {app.reason}
                    </div>
                    {app.confirmedTime && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Time: {app.confirmedTime}
                      </div>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold self-start sm:self-auto ${
                      app.status === "APPROVED"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: REQUEST MEETING */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Request Meeting with Tutor
              </h2>
              <button
                onClick={() => setIsAppointmentModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAppointmentRequest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={appDate}
                  onChange={(e) => setAppDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Topic / Reason for Discussion
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Discuss second-term exam marks and homework progress."
                  value={appReason}
                  onChange={(e) => setAppReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="min-h-[44px] px-5 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingApp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST MISSED TUTE */}
      {isTuteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Request Missed Lesson Tutorial
              </h2>
              <button
                onClick={() => setIsTuteModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTuteRequest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Select Tutorial Worksheet
                </label>
                <select
                  value={selectedTuteId}
                  onChange={(e) => setSelectedTuteId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                >
                  {verifiedData.tutes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.month})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Reason for Absence
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Absent on Sunday due to viral fever; requesting worksheet for self-study."
                  value={tuteReason}
                  onChange={(e) => setTuteReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsTuteModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTute}
                  className="min-h-[44px] px-5 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingTute && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Request Tute</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
