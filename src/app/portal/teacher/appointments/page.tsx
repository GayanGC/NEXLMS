"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
  MessageCircle,
  ExternalLink,
  User,
  BookOpen,
  Loader2,
} from "lucide-react";

interface TuitionClass {
  id: string;
  title: string;
  grade: string;
}

interface Student {
  id: string;
  classId: string;
  studentCode: string;
  fullName: string;
  parentPhone: string;
}

interface Appointment {
  id: string;
  classId: string;
  studentId: string;
  initiatedBy: "PARENT" | "TEACHER";
  requestedDate: string;
  confirmedDate?: string | null;
  confirmedTime?: string | null;
  reason: string;
  teacherNote?: string | null;
  status: "PENDING" | "APPROVED" | "RESCHEDULED" | "COMPLETED";
  createdAt: string;
  student?: {
    id: string;
    fullName: string;
    studentCode: string;
    parentPhone: string;
  };
  class?: {
    id: string;
    title: string;
    grade: string;
  };
}

export default function TeacherAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [classes, setClasses] = useState<TuitionClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Issue Summon Modal
  const [isSummonModalOpen, setIsSummonModalOpen] = useState(false);
  const [summonStudentId, setSummonStudentId] = useState("");
  const [summonDate, setSummonDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [summonTime, setSummonTime] = useState("11:30 AM (After Class)");
  const [summonReason, setSummonReason] = useState("");
  const [summonNote, setSummonNote] = useState("");
  const [isSubmittingSummon, setIsSubmittingSummon] = useState(false);
  const [summonError, setSummonError] = useState<string | null>(null);

  // Confirm / Reschedule Modal for parent requests
  const [selectedForConfirm, setSelectedForConfirm] = useState<Appointment | null>(null);
  const [confirmTime, setConfirmTime] = useState("11:45 AM (Post-Class)");
  const [confirmDate, setConfirmDate] = useState("");
  const [confirmNote, setConfirmNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  async function loadData() {
    setIsLoading(true);
    try {
      const [resApp, resCls, resStu] = await Promise.all([
        fetch("/api/tutor/appointments"),
        fetch("/api/tutor/classes"),
        fetch("/api/tutor/students"),
      ]);

      const dataApp = await resApp.json();
      const dataCls = await resCls.json();
      const dataStu = await resStu.json();

      if (dataApp.success && dataApp.appointments) {
        setAppointments(dataApp.appointments);
      }
      if (dataCls.success && dataCls.classes) {
        setClasses(dataCls.classes);
      }
      if (dataStu.success && dataStu.students) {
        setStudents(dataStu.students);
        if (dataStu.students.length > 0 && !summonStudentId) {
          setSummonStudentId(dataStu.students[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Issue Urgent Teacher Summon
  async function handleCreateSummon(e: React.FormEvent) {
    e.preventDefault();
    setSummonError(null);
    setIsSubmittingSummon(true);

    const student = students.find((s) => s.id === summonStudentId);
    if (!student) {
      setSummonError("Please select a student");
      setIsSubmittingSummon(false);
      return;
    }

    try {
      const res = await fetch("/api/tutor/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: student.classId,
          studentId: student.id,
          initiatedBy: "TEACHER",
          requestedDate: summonDate,
          confirmedDate: summonDate,
          confirmedTime: summonTime,
          reason: summonReason,
          teacherNote: summonNote.trim() ? summonNote : null,
          status: "APPROVED",
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setIsSummonModalOpen(false);
        setSummonReason("");
        setSummonNote("");
        showToast("Teacher summons notice issued to parent!");
        loadData();
      } else {
        setSummonError(resData.error || "Failed to issue summons");
      }
    } catch {
      setSummonError("Network error while issuing summons");
    } finally {
      setIsSubmittingSummon(false);
    }
  }

  // Confirm Parent Meeting
  async function handleConfirmMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedForConfirm) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch("/api/tutor/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedForConfirm.id,
          status: "APPROVED",
          confirmedDate: confirmDate || selectedForConfirm.requestedDate,
          confirmedTime: confirmTime,
          teacherNote: confirmNote.trim() ? confirmNote : null,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setSelectedForConfirm(null);
        showToast("Appointment confirmed with parent!");
        loadData();
      } else {
        alert(resData.error || "Failed to confirm meeting");
      }
    } catch {
      alert("Error confirming meeting");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function getSummonWhatsAppLink(app: Appointment) {
    const rawPhone = (app.student?.parentPhone || "").replace(/\D/g, "");
    let cleanPhone = rawPhone;
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "94" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("94")) {
      cleanPhone = "94" + cleanPhone;
    }

    const message = `Official Notice from Tuition Master: You have been summoned for a parent meeting regarding ${app.student?.fullName} (${app.student?.studentCode}) scheduled on ${app.confirmedDate || app.requestedDate} at ${app.confirmedTime || "Class Hall"}. Reason: ${app.reason}. Please confirm attendance.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  // Filter
  const parentRequests = appointments.filter((a) => a.initiatedBy === "PARENT");
  const teacherSummons = appointments.filter((a) => a.initiatedBy === "TEACHER");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Appointments & Parent Summons
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Review parent meeting requests and dispatch official urgent summons with one-click WhatsApp notices.
          </p>
        </div>

        <button
          onClick={() => {
            if (students.length > 0 && !summonStudentId) {
              setSummonStudentId(students[0].id);
            }
            setIsSummonModalOpen(true);
          }}
          className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>+ Issue Parent Summon</span>
        </button>
      </div>

      {/* SECTION 1: INCOMING PARENT REQUESTS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              Parent-Requested Consultations ({parentRequests.filter((r) => r.status === "PENDING").length} Pending)
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Inbox
          </span>
        </div>

        {parentRequests.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No parent consultation requests at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {parentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {req.student?.fullName}
                    </span>
                    <span className="font-mono text-zinc-500">
                      ({req.student?.studentCode})
                    </span>
                    <span className="text-zinc-500 font-mono">
                      • Requested Date: {req.requestedDate}
                    </span>
                  </div>

                  <div className="text-zinc-700 dark:text-zinc-300">
                    <strong className="text-zinc-900 dark:text-zinc-100">Topic / Concern:</strong>{" "}
                    {req.reason}
                  </div>

                  {req.confirmedTime && (
                    <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                      ✓ Confirmed: {req.confirmedDate} at {req.confirmedTime}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedForConfirm(req);
                        setConfirmDate(req.requestedDate);
                        setConfirmTime("11:45 AM (Post-Class)");
                      }}
                      className="min-h-[40px] px-4 py-1.5 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm"
                    >
                      Confirm Date & Time
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: TEACHER-INITIATED SUMMONS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              Teacher-Initiated Urgent Summons ({teacherSummons.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Disciplinary & Academic Alerts
          </span>
        </div>

        {teacherSummons.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No parent summons issued yet.
          </div>
        ) : (
          <div className="space-y-3">
            {teacherSummons.map((summon) => (
              <div
                key={summon.id}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white">
                      OFFICIAL SUMMONS
                    </span>
                    <span className="font-bold text-zinc-950 dark:text-white">
                      {summon.student?.fullName}
                    </span>
                    <span className="font-mono text-zinc-500">
                      ({summon.student?.studentCode})
                    </span>
                  </div>

                  <div className="text-zinc-800 dark:text-zinc-200">
                    <strong>Summons Grounds:</strong> {summon.reason}
                  </div>

                  <div className="text-zinc-500 font-mono">
                    Scheduled: {summon.confirmedDate} @ {summon.confirmedTime}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getSummonWhatsAppLink(summon)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Notice</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: ISSUE TEACHER SUMMON */}
      {isSummonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                  Issue Parent Summons
                </h2>
              </div>
              <button
                onClick={() => setIsSummonModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSummon} className="p-5 space-y-4">
              {summonError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
                  {summonError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Select Student
                </label>
                <select
                  value={summonStudentId}
                  onChange={(e) => setSummonStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Summon Date
                  </label>
                  <input
                    type="date"
                    required
                    value={summonDate}
                    onChange={(e) => setSummonDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Time / Hall
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM (After Class)"
                    value={summonTime}
                    onChange={(e) => setSummonTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Reason for Urgent Summons
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Consecutive absences and incomplete tutorial assignments; urgent performance discussion."
                  value={summonReason}
                  onChange={(e) => setSummonReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Teacher Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please bring recent term test papers."
                  value={summonNote}
                  onChange={(e) => setSummonNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSummonModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSummon}
                  className="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingSummon && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Dispatch Summons</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM PARENT REQUEST */}
      {selectedForConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Confirm Parent Consultation
              </h2>
              <button
                onClick={() => setSelectedForConfirm(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMeeting} className="p-5 space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-1">
                <div>
                  <strong>Student:</strong> {selectedForConfirm.student?.fullName} ({selectedForConfirm.student?.studentCode})
                </div>
                <div>
                  <strong>Parent Topic:</strong> {selectedForConfirm.reason}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Confirmed Date
                  </label>
                  <input
                    type="date"
                    required
                    value={confirmDate}
                    onChange={(e) => setConfirmDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Confirmed Time
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmTime}
                    onChange={(e) => setConfirmTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Note to Parent (Visible on Portal)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please bring recent test papers."
                  value={confirmNote}
                  onChange={(e) => setConfirmNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedForConfirm(null)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="min-h-[44px] px-5 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-zinc-800 dark:border-zinc-200 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
