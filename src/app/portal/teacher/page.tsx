"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  QrCode,
  DollarSign,
  Copy,
  ExternalLink,
  MessageCircle,
  X,
  Search,
  BookOpen,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface TuitionClass {
  id: string;
  title: string;
  subject: string;
  grade: string;
  monthlyFee: number;
  scheduleText: string;
  enableTutes: boolean;
  activeNotice?: string | null;
  students?: Student[];
  feePayments?: FeePayment[];
}

interface Student {
  id: string;
  classId: string;
  studentCode: string;
  fullName: string;
  parentName?: string | null;
  parentPhone: string;
  isFreeCard: boolean;
  createdAt: string;
}

interface FeePayment {
  id: string;
  classId: string;
  studentId: string;
  month: string;
  amount: number;
  status: "PAID" | "UNPAID";
  paidAt?: string | null;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  method: "MANUAL_TAP" | "QR_SCAN";
}

export default function TeacherPortalOverviewPage() {
  const [classes, setClasses] = useState<TuitionClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedClassForStudent, setSelectedClassForStudent] = useState<string>("");
  const [newStudentSuccess, setNewStudentSuccess] = useState<{
    code: string;
    name: string;
    parentLink: string;
  } | null>(null);

  // Attendance Drawer state
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [attendanceClassId, setAttendanceClassId] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, "PRESENT" | "ABSENT">
  >({});
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [qrScanMessage, setQrScanMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Fees Drawer state
  const [isFeesOpen, setIsFeesOpen] = useState(false);
  const [feesClassId, setFeesClassId] = useState<string>("");
  const [feesMonth, setFeesMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [classFees, setClassFees] = useState<FeePayment[]>([]);
  const [isTogglingFee, setIsTogglingFee] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load classes & students
  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [resClasses, resStudents] = await Promise.all([
        fetch("/api/tutor/classes"),
        fetch("/api/tutor/students"),
      ]);
      const dataClasses = await resClasses.json();
      const dataStudents = await resStudents.json();

      if (dataClasses.success && dataClasses.classes) {
        setClasses(dataClasses.classes);
      }
      if (dataStudents.success && dataStudents.students) {
        setStudents(dataStudents.students);
      }
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const totalClasses = classes.length;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Calculate total expected and collected fee
    let totalCollected = 0;
    classes.forEach((c) => {
      if (c.feePayments) {
        c.feePayments
          .filter((f) => f.month === currentMonth && f.status === "PAID")
          .forEach((f) => {
            totalCollected += f.amount;
          });
      }
    });

    return {
      totalStudents,
      totalClasses,
      totalCollected,
    };
  }, [classes, students]);

  // Open Attendance Drawer for a specific class
  function openAttendanceModal(classId: string) {
    setAttendanceClassId(classId);
    setQrCodeInput("");
    setQrScanMessage(null);
    // Initialize current student status to PRESENT by default
    const classStudents = students.filter((s) => s.classId === classId);
    const initialMap: Record<string, "PRESENT" | "ABSENT"> = {};
    classStudents.forEach((s) => {
      initialMap[s.id] = "PRESENT";
    });
    setAttendanceRecords(initialMap);
    setIsAttendanceOpen(true);
  }

  // Handle QR / Student Code Quick Check-in
  function handleQrScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    const code = qrCodeInput.trim().toUpperCase();
    const matched = students.find(
      (s) => s.classId === attendanceClassId && s.studentCode.toUpperCase() === code
    );

    if (matched) {
      setAttendanceRecords((prev) => ({
        ...prev,
        [matched.id]: "PRESENT",
      }));
      setQrScanMessage({
        text: `✓ ${matched.fullName} (${matched.studentCode}) marked PRESENT`,
        success: true,
      });
      setQrCodeInput("");
    } else {
      setQrScanMessage({
        text: `✕ No enrolled student matching code "${code}" in this class`,
        success: false,
      });
    }
  }

  // Save Attendance to API
  async function saveAttendance() {
    if (!attendanceClassId) return;
    setIsSavingAttendance(true);
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status,
        method: "MANUAL_TAP" as const,
      }));

      const res = await fetch("/api/tutor/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: attendanceClassId,
          date: attendanceDate,
          records,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAttendanceOpen(false);
        showToast("Attendance saved successfully!");
        loadData();
      } else {
        alert(data.error || "Failed to save attendance");
      }
    } catch {
      alert("Network error while saving attendance");
    } finally {
      setIsSavingAttendance(false);
    }
  }

  // Open Fees Drawer for a specific class
  async function openFeesModal(classId: string) {
    setFeesClassId(classId);
    setIsFeesOpen(true);
    await loadClassFees(classId, feesMonth);
  }

  async function loadClassFees(classId: string, month: string) {
    try {
      const res = await fetch(`/api/tutor/fees?classId=${classId}&month=${month}`);
      const data = await res.json();
      if (data.success && data.fees) {
        setClassFees(data.fees);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Toggle Fee Paid / Unpaid
  async function handleToggleFee(student: Student, currentStatus: "PAID" | "UNPAID", cls: TuitionClass) {
    setIsTogglingFee(student.id);
    const newStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
    const amount = student.isFreeCard ? 0 : cls.monthlyFee;

    try {
      const res = await fetch("/api/tutor/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: cls.id,
          studentId: student.id,
          month: feesMonth,
          status: newStatus,
          amount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadClassFees(cls.id, feesMonth);
        showToast(`Fee status for ${student.fullName} marked as ${newStatus}`);
        loadData();
      } else {
        alert(data.error || "Failed to update fee");
      }
    } catch {
      alert("Error updating fee");
    } finally {
      setIsTogglingFee(null);
    }
  }

  // Generate WhatsApp Reminder Link
  function getWhatsAppReminderLink(student: Student, cls: TuitionClass) {
    const rawPhone = student.parentPhone.replace(/\D/g, "");
    let cleanPhone = rawPhone;
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "94" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("94")) {
      cleanPhone = "94" + cleanPhone;
    }

    const message = `Dear Parent, this is a gentle reminder regarding tuition fees of Rs. ${cls.monthlyFee.toLocaleString()} for ${student.fullName} (${cls.title} - ${cls.grade}) for ${feesMonth}. Please settle at your earliest convenience. Thank you.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  // Filtered classes
  const filteredClasses = classes.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Solo Tutor Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage tuition classes, rapid attendance checklists, fee collection, and parent portals.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => {
              if (classes.length > 0) {
                setSelectedClassForStudent(classes[0].id);
              }
              setNewStudentSuccess(null);
              setIsAddStudentOpen(true);
            }}
            className="min-h-[44px] px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
            <span>+ Quick Add Student</span>
          </button>

          <button
            onClick={() => setIsAddClassOpen(true)}
            className="min-h-[44px] px-4 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Class</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-2 tabular-nums">
            {metrics.totalStudents}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Across {metrics.totalClasses} active tuition classes
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>Active Classes</span>
            <BookOpen className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-2 tabular-nums">
            {metrics.totalClasses}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Weekly scheduled sessions
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>Fees Collected This Month</span>
            <DollarSign className="w-4 h-4 text-[#FF5A26]" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-2 tabular-nums">
            Rs. {metrics.totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            Target month: {new Date().toISOString().slice(0, 7)}
          </div>
        </div>
      </div>

      {/* Classes Grid Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
          My Tuition Classes ({filteredClasses.length})
        </h2>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search class or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
          />
        </div>
      </div>

      {/* Classes Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#0D5C52]" />
          <span className="text-xs font-mono">Loading classes...</span>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No tuition classes found
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first tuition class to manage student attendance, notes, and fee collection.
          </p>
          <button
            onClick={() => setIsAddClassOpen(true)}
            className="mt-4 px-4 py-2 bg-[#0D5C52] text-white text-xs font-medium rounded-xl shadow-sm hover:bg-[#09433c]"
          >
            + Create First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {cls.grade}
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      Rs. {cls.monthlyFee.toLocaleString()} / mo
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-950 dark:text-white mt-3">
                    {cls.title}
                  </h3>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {cls.subject}
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{cls.scheduleText}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>
                        <strong className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {classStudents.length}
                        </strong>{" "}
                        enrolled students
                      </span>
                    </div>
                  </div>

                  {cls.activeNotice && (
                    <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{cls.activeNotice}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openAttendanceModal(cls.id)}
                    className="min-h-[44px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Attendance</span>
                  </button>

                  <button
                    onClick={() => openFeesModal(cls.id)}
                    className="min-h-[44px] px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-[#FF5A26]" />
                    <span>Fees Checklist</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD CLASS */}
      {isAddClassOpen && (
        <AddClassModal
          onClose={() => setIsAddClassOpen(false)}
          onSuccess={() => {
            setIsAddClassOpen(false);
            showToast("Tuition class created successfully!");
            loadData();
          }}
        />
      )}

      {/* MODAL 2: QUICK ADD STUDENT */}
      {isAddStudentOpen && (
        <QuickAddStudentModal
          classes={classes}
          defaultClassId={selectedClassForStudent}
          successData={newStudentSuccess}
          onClose={() => {
            setIsAddStudentOpen(false);
            setNewStudentSuccess(null);
          }}
          onSuccess={(student, portalUrl) => {
            setNewStudentSuccess({
              code: student.studentCode,
              name: student.fullName,
              parentLink: portalUrl,
            });
            showToast(`Student ${student.fullName} (${student.studentCode}) enrolled!`);
            loadData();
          }}
        />
      )}

      {/* DRAWER 3: ATTENDANCE CHECKLIST & QR */}
      {isAttendanceOpen && (
        <AttendanceDrawer
          classId={attendanceClassId}
          classes={classes}
          students={students.filter((s) => s.classId === attendanceClassId)}
          date={attendanceDate}
          onDateChange={setAttendanceDate}
          records={attendanceRecords}
          onToggleStatus={(studentId) => {
            setAttendanceRecords((prev) => ({
              ...prev,
              [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
            }));
          }}
          qrInput={qrCodeInput}
          onQrInputChange={setQrCodeInput}
          onQrSubmit={handleQrScanSubmit}
          qrMessage={qrScanMessage}
          isSaving={isSavingAttendance}
          onSave={saveAttendance}
          onClose={() => setIsAttendanceOpen(false)}
        />
      )}

      {/* DRAWER 4: FEES CHECKLIST & WHATSAPP REMINDER */}
      {isFeesOpen && (
        <FeesDrawer
          classId={feesClassId}
          classes={classes}
          students={students.filter((s) => s.classId === feesClassId)}
          month={feesMonth}
          onMonthChange={(m) => {
            setFeesMonth(m);
            loadClassFees(feesClassId, m);
          }}
          fees={classFees}
          isToggling={isTogglingFee}
          onToggleFee={handleToggleFee}
          getWhatsAppLink={getWhatsAppReminderLink}
          onClose={() => setIsFeesOpen(false)}
        />
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

// -------------------------------------------------------------
// COMPONENT: ADD CLASS MODAL
// -------------------------------------------------------------
function AddClassModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("Grade 11");
  const [monthlyFee, setMonthlyFee] = useState("3000");
  const [scheduleText, setScheduleText] = useState("Sundays 08:30 AM - 12:30 PM");
  const [enableTutes, setEnableTutes] = useState(true);
  const [activeNotice, setActiveNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tutor/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          grade,
          monthlyFee: Number(monthlyFee),
          scheduleText,
          enableTutes,
          activeNotice: activeNotice.trim() ? activeNotice : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setFormError(data.error || "Failed to create class");
      }
    } catch {
      setFormError("Network error while creating class");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-950 dark:text-white">
            Create Tuition Class
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Class Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026 Combined Maths Theory"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Target Grade
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grade 11 or 2026 A/L"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Monthly Fee (LKR)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Schedule & Hall
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Saturdays 01:30 PM - 05:30 PM"
                value={scheduleText}
                onChange={(e) => setScheduleText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Active Broadcast Notice (Visible on Parent Portal)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Mid-term exam paper will be held this Sunday. Bring calculator."
              value={activeNotice}
              onChange={(e) => setActiveNotice(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="enableTutes"
              checked={enableTutes}
              onChange={(e) => setEnableTutes(e.target.checked)}
              className="rounded text-[#0D5C52] focus:ring-[#0D5C52]"
            />
            <label
              htmlFor="enableTutes"
              className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Enable digital tute distribution and absentee request approvals
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Class</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: QUICK ADD STUDENT MODAL
// -------------------------------------------------------------
function QuickAddStudentModal({
  classes,
  defaultClassId,
  successData,
  onClose,
  onSuccess,
}: {
  classes: TuitionClass[];
  defaultClassId: string;
  successData: { code: string; name: string; parentLink: string } | null;
  onClose: () => void;
  onSuccess: (student: Student, portalUrl: string) => void;
}) {
  const [classId, setClassId] = useState(defaultClassId || (classes[0]?.id || ""));
  const [fullName, setFullName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [isFreeCard, setIsFreeCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tutor/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          fullName,
          parentName: parentName.trim() ? parentName : null,
          parentPhone,
          isFreeCard,
        }),
      });

      const data = await res.json();
      if (data.success && data.student) {
        onSuccess(data.student, data.parentPortalUrl || `/parent/${data.student.studentCode}`);
      } else {
        setFormError(data.error || "Failed to enroll student");
      }
    } catch {
      setFormError("Network error while enrolling student");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(window.location.origin + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-950 dark:text-white">
            {successData ? "Student Enrolled Successfully" : "Quick Add Student"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successData ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                {successData.name}
              </h3>
              <div className="inline-block mt-1 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Code: {successData.code}
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-left space-y-2">
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Direct Parent Portal Link:
              </div>
              <div className="font-mono text-[11px] text-[#0D5C52] dark:text-emerald-400 break-all select-all">
                {typeof window !== "undefined" ? window.location.origin : ""}{successData.parentLink}
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(successData.parentLink)}
                className="w-full mt-2 min-h-[40px] px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied to Clipboard!" : "Copy Parent Link"}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full min-h-[44px] px-4 py-2 bg-[#0D5C52] text-white text-xs font-medium rounded-xl hover:bg-[#09433c]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Assign to Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.grade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kasun Sandaruwan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Parent Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="077 123 4567"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isFreeCard"
                checked={isFreeCard}
                onChange={(e) => setIsFreeCard(e.target.checked)}
                className="rounded text-[#0D5C52] focus:ring-[#0D5C52]"
              />
              <label
                htmlFor="isFreeCard"
                className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Scholarship / Free Card Student (0 fee charged)
              </label>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[44px] px-5 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enroll Student</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: ATTENDANCE DRAWER (MANUAL & QR SCAN)
// -------------------------------------------------------------
function AttendanceDrawer({
  classId,
  classes,
  students,
  date,
  onDateChange,
  records,
  onToggleStatus,
  qrInput,
  onQrInputChange,
  onQrSubmit,
  qrMessage,
  isSaving,
  onSave,
  onClose,
}: {
  classId: string;
  classes: TuitionClass[];
  students: Student[];
  date: string;
  onDateChange: (date: string) => void;
  records: Record<string, "PRESENT" | "ABSENT">;
  onToggleStatus: (studentId: string) => void;
  qrInput: string;
  onQrInputChange: (val: string) => void;
  onQrSubmit: (e: React.FormEvent) => void;
  qrMessage: { text: string; success: boolean } | null;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const currentClass = classes.find((c) => c.id === classId);

  const [filterMode, setFilterMode] = useState<"ALL" | "ABSENT" | "PRESENT">("ALL");
  const [searchFilter, setSearchFilter] = useState("");

  const presentCount = Object.values(records).filter((r) => r === "PRESENT").length;
  const absentCount = students.length - presentCount;

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const isPresent = records[s.id] === "PRESENT";
      if (filterMode === "ABSENT" && isPresent) return false;
      if (filterMode === "PRESENT" && !isPresent) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.parentPhone.includes(q)
        );
      }
      return true;
    });
  }, [students, records, filterMode, searchFilter]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Class Attendance Checklist
              </h2>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {currentClass?.title} ({currentClass?.grade})
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector, QR Barcode Scanner & Search Filters */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-medium">Date:</span>
              <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                {presentCount} Present
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                {absentCount} Absent
              </span>
            </div>
          </div>

          {/* Quick QR Barcode Scanner Input */}
          <form onSubmit={onQrSubmit} className="relative">
            <QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Scan Barcode or Type Student Code (e.g. STU-1041) + Press Enter"
              value={qrInput}
              onChange={(e) => onQrInputChange(e.target.value)}
              className="w-full pl-9 pr-20 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#0D5C52] text-white text-[11px] font-medium rounded-lg"
            >
              Check-in
            </button>
          </form>

          {qrMessage && (
            <div
              className={`p-2 rounded-lg text-xs font-mono ${
                qrMessage.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {qrMessage.text}
            </div>
          )}

          {/* Filter Pills & Live Search */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterMode("ALL")}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterMode === "ALL"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("ABSENT")}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterMode === "ABSENT"
                    ? "bg-rose-600 text-white font-semibold"
                    : "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
                }`}
              >
                Absent Only ({absentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("PRESENT")}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterMode === "PRESENT"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                }`}
              >
                Present Only ({presentCount})
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#0D5C52]"
              />
            </div>
          </div>
        </div>

        {/* Student Roster Checklist */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {students.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No students enrolled in this class yet.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No students match the current filter or search criteria.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isPresent = records[student.id] === "PRESENT";
              return (
                <div
                  key={student.id}
                  onClick={() => onToggleStatus(student.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isPresent
                      ? "border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                        isPresent
                          ? "bg-[#0D5C52] text-white"
                          : "border border-zinc-300 dark:border-zinc-700 text-transparent"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {student.fullName}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono tabular-nums">
                        {student.studentCode} • {student.parentPhone}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold ${
                      isPresent
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    {isPresent ? "PRESENT" : "ABSENT"}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 bg-zinc-50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="min-h-[44px] px-6 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: FEES CHECKLIST DRAWER & WHATSAPP REMINDER
// -------------------------------------------------------------
function FeesDrawer({
  classId,
  classes,
  students,
  month,
  onMonthChange,
  fees,
  isToggling,
  onToggleFee,
  getWhatsAppLink,
  onClose,
}: {
  classId: string;
  classes: TuitionClass[];
  students: Student[];
  month: string;
  onMonthChange: (month: string) => void;
  fees: FeePayment[];
  isToggling: string | null;
  onToggleFee: (student: Student, currentStatus: "PAID" | "UNPAID", cls: TuitionClass) => void;
  getWhatsAppLink: (student: Student, cls: TuitionClass) => string;
  onClose: () => void;
}) {
  const currentClass = classes.find((c) => c.id === classId);

  // Map studentId -> FeePayment
  const feeMap = useMemo(() => {
    const map: Record<string, FeePayment> = {};
    fees.forEach((f) => {
      map[f.studentId] = f;
    });
    return map;
  }, [fees]);

  const [feeFilterMode, setFeeFilterMode] = useState<"ALL" | "UNPAID" | "PAID">("ALL");
  const [feeSearchQuery, setFeeSearchQuery] = useState("");

  const paidCount = students.filter((s) => {
    const payment = feeMap[s.id];
    return payment ? payment.status === "PAID" : false;
  }).length;

  const filteredFeeStudents = useMemo(() => {
    return students.filter((s) => {
      const payment = feeMap[s.id];
      const isPaid = payment ? payment.status === "PAID" : false;
      if (feeFilterMode === "UNPAID" && isPaid) return false;
      if (feeFilterMode === "PAID" && !isPaid) return false;
      if (feeSearchQuery.trim()) {
        const q = feeSearchQuery.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.parentPhone.includes(q)
        );
      }
      return true;
    });
  }, [students, feeMap, feeFilterMode, feeSearchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#FF5A26]" />
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Monthly Fee Checklist & WhatsApp Reminders
              </h2>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {currentClass?.title} • Standard Fee: Rs. {currentClass?.monthlyFee.toLocaleString()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector, Progress & Filters */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-medium">Month:</span>
              <input
                type="month"
                value={month}
                onChange={(e) => onMonthChange(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="text-xs font-mono tabular-nums">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {paidCount} Paid
              </span>{" "}
              /{" "}
              <span className="text-zinc-500">
                {students.length} Total ({students.length - paidCount} Due)
              </span>
            </div>
          </div>

          {/* Filter Pills & Live Search */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFeeFilterMode("ALL")}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  feeFilterMode === "ALL"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setFeeFilterMode("UNPAID")}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  feeFilterMode === "UNPAID"
                    ? "bg-rose-600 text-white font-semibold"
                    : "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
                }`}
              >
                Unpaid Only ({students.length - paidCount})
              </button>
              <button
                type="button"
                onClick={() => setFeeFilterMode("PAID")}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  feeFilterMode === "PAID"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                }`}
              >
                Paid Only ({paidCount})
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={feeSearchQuery}
                onChange={(e) => setFeeSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#0D5C52]"
              />
            </div>
          </div>
        </div>

        {/* Student Fees List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {students.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No students enrolled in this class.
            </div>
          ) : filteredFeeStudents.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No students match the current fee filter or search criteria.
            </div>
          ) : (
            filteredFeeStudents.map((student) => {
              const payment = feeMap[student.id];
              const isPaid = payment ? payment.status === "PAID" : false;
              const isUpdating = isToggling === student.id;

              return (
                <div
                  key={student.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {student.fullName}
                      </span>
                      {student.isFreeCard && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          Free Card
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5 tabular-nums">
                      {student.studentCode} • Parent: {student.parentPhone}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Paid / Unpaid Button */}
                    <button
                      type="button"
                      disabled={isUpdating || !currentClass}
                      onClick={() =>
                        currentClass &&
                        onToggleFee(student, isPaid ? "PAID" : "UNPAID", currentClass)
                      }
                      className={`min-h-[36px] px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                        isPaid
                          ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300"
                          : "bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>{isPaid ? "✓ PAID" : "UNPAID"}</span>
                    </button>

                    {/* WhatsApp Reminder Button (Active if Unpaid) */}
                    {!isPaid && currentClass && (
                      <a
                        href={getWhatsAppLink(student, currentClass)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[36px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Notice</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end bg-zinc-50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-xl shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
