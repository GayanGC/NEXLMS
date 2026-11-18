"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Award,
  ChevronLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Share2,
  Save,
  User,
  GraduationCap,
  Percent,
  Check,
} from "lucide-react";

interface TuitionClass {
  id: string;
  title: string;
  subject: string;
  grade: string;
}

interface ClassExam {
  id: string;
  tenantId: string;
  classId: string;
  title: string;
  examDate: string;
  maxMarks: number;
  class: {
    id: string;
    title: string;
    subject: string;
    grade: string;
  };
  totalStudents: number;
  marksEnteredCount: number;
  classAverage: number;
  highestMark: number;
}

interface StudentMarkRow {
  id: string;
  studentCode: string;
  fullName: string;
  parentName?: string | null;
  parentPhone: string;
  isFreeCard: boolean;
  marksObtained: number | null;
  isAbsent: boolean;
  remarks: string;
  percentage: number | null;
  grade: string;
  rank: number | null;
}

function getGradeBadgeColor(grade: string) {
  switch (grade) {
    case "A":
      return "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    case "B":
      return "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    case "C":
      return "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    case "S":
      return "bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800";
    case "W":
      return "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
    case "AB":
      return "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700";
    default:
      return "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 border-zinc-200 dark:border-zinc-700";
  }
}

function calculateLiveGrade(marks: number | null, maxMarks: number, isAbsent: boolean): { percentage: number | null; grade: string } {
  if (isAbsent) return { percentage: null, grade: "AB" };
  if (marks === null || marks === undefined || isNaN(marks)) return { percentage: null, grade: "-" };
  const pct = Math.round((marks / maxMarks) * 100);
  if (pct >= 75) return { percentage: pct, grade: "A" };
  if (pct >= 65) return { percentage: pct, grade: "B" };
  if (pct >= 50) return { percentage: pct, grade: "C" };
  if (pct >= 35) return { percentage: pct, grade: "S" };
  return { percentage: pct, grade: "W" };
}

export default function TeacherExamsPage() {
  const [classes, setClasses] = useState<TuitionClass[]>([]);
  const [exams, setExams] = useState<ClassExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  // Create Exam Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [newExamDate, setNewExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMaxMarks, setNewMaxMarks] = useState("100");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Active Exam Bulk Entry View
  const [activeExam, setActiveExam] = useState<ClassExam | null>(null);
  const [examStudents, setExamStudents] = useState<StudentMarkRow[]>([]);
  const [isLoadingMarks, setIsLoadingMarks] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Bulk Entry Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  // Load Classes and Exams
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [classesRes, examsRes] = await Promise.all([
          fetch("/api/tutor/classes"),
          fetch("/api/tutor/exams"),
        ]);
        const classesData = await classesRes.json();
        const examsData = await examsRes.json();

        if (classesData.success) {
          setClasses(classesData.classes || []);
          if (classesData.classes?.length > 0) {
            setNewClassId(classesData.classes[0].id);
          }
        }
        if (examsData.success) {
          setExams(examsData.exams || []);
        }
      } catch (err) {
        console.error("Error loading exams data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Open Bulk Entry Mode for an Exam
  async function openBulkEntry(exam: ClassExam) {
    setActiveExam(exam);
    setIsLoadingMarks(true);
    setSaveSuccessMsg(null);
    setSearchQuery("");
    setPendingOnly(false);

    try {
      const res = await fetch(`/api/tutor/exams/${exam.id}/marks`);
      const data = await res.json();
      if (data.success) {
        setExamStudents(data.students || []);
      }
    } catch (err) {
      console.error("Error fetching exam marks:", err);
    } finally {
      setIsLoadingMarks(false);
    }
  }

  // Handle Create Exam Submit
  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newClassId || !newExamDate) {
      setCreateError("Please fill in all required fields.");
      return;
    }

    const max = parseFloat(newMaxMarks);
    if (isNaN(max) || max <= 0) {
      setCreateError("Maximum marks must be greater than 0.");
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const res = await fetch("/api/tutor/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: newClassId,
          title: newTitle.trim(),
          examDate: newExamDate,
          maxMarks: max,
        }),
      });

      const data = await res.json();
      if (data.success && data.exam) {
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewMaxMarks("100");
        // Reload exams list
        const refreshRes = await fetch("/api/tutor/exams");
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setExams(refreshData.exams || []);
        }
        // Immediately open bulk entry for the newly created exam
        openBulkEntry(data.exam);
      } else {
        setCreateError(data.error || "Failed to create exam.");
      }
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  // Update mark for a student in local state
  function handleMarkChange(studentId: string, val: string) {
    setSaveSuccessMsg(null);
    setExamStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        if (val === "") {
          return {
            ...s,
            marksObtained: null,
            percentage: null,
            grade: s.isAbsent ? "AB" : "-",
          };
        }
        const num = parseFloat(val);
        const { percentage, grade } = calculateLiveGrade(
          isNaN(num) ? null : num,
          activeExam?.maxMarks || 100,
          s.isAbsent
        );
        return {
          ...s,
          marksObtained: isNaN(num) ? null : num,
          percentage,
          grade,
        };
      })
    );
  }

  // Toggle absent status
  function handleAbsentToggle(studentId: string, isAbsent: boolean) {
    setSaveSuccessMsg(null);
    setExamStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const { percentage, grade } = calculateLiveGrade(
          isAbsent ? null : s.marksObtained,
          activeExam?.maxMarks || 100,
          isAbsent
        );
        return {
          ...s,
          isAbsent,
          percentage,
          grade,
        };
      })
    );
  }

  // Update remarks
  function handleRemarksChange(studentId: string, remarks: string) {
    setSaveSuccessMsg(null);
    setExamStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remarks } : s))
    );
  }

  // Save All Marks in Bulk
  async function handleSaveAllMarks() {
    if (!activeExam) return;
    setIsSavingMarks(true);
    setSaveSuccessMsg(null);

    try {
      const payload = {
        examId: activeExam.id,
        marks: examStudents.map((s) => ({
          studentId: s.id,
          marksObtained: s.isAbsent ? null : s.marksObtained,
          isAbsent: s.isAbsent,
          remarks: s.remarks,
        })),
      };

      const res = await fetch(`/api/tutor/exams/${activeExam.id}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg(`Marks successfully saved for ${data.count} students!`);
        // Refresh marks to update ranks
        const refreshRes = await fetch(`/api/tutor/exams/${activeExam.id}/marks`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setExamStudents(refreshData.students || []);
        }
        // Also refresh list in background
        const listRes = await fetch("/api/tutor/exams");
        const listData = await listRes.json();
        if (listData.success) {
          setExams(listData.exams || []);
        }
      } else {
        alert(data.error || "Failed to save marks.");
      }
    } catch {
      alert("Error saving marks. Please check your connection.");
    } finally {
      setIsSavingMarks(false);
    }
  }

  // Generate WhatsApp Share Link
  function generateWhatsAppLink(student: StudentMarkRow) {
    if (!activeExam) return "#";
    const phone = (student.parentPhone || "").replace(/\D/g, "");
    const cleanPhone = phone.startsWith("0") ? "94" + phone.slice(1) : phone.startsWith("94") ? phone : "94" + phone;

    const markText = student.isAbsent
      ? "Absent (AB)"
      : `${student.marksObtained ?? 0} / ${activeExam.maxMarks} (${student.percentage ?? 0}%)`;
    const rankText = student.rank ? `Rank #${student.rank}` : "Rank Pending";

    const message = `*NexLMS Academic Progress Report*
Student: *${student.fullName}* (${student.studentCode})
Class: *${activeExam.class.title}*
Exam: *${activeExam.title}* (${activeExam.examDate})

Score: *${markText}*
Grade: *${student.grade}*
Class Position: *${rankText}*
${student.remarks ? `Teacher Note: _${student.remarks}_\n` : ""}
Parents can view full attendance and report card directly at:
${window.location.origin}/parent/${student.studentCode}`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  // Filtered exams list
  const filteredExams = exams.filter((e) =>
    selectedClassFilter === "ALL" ? true : e.classId === selectedClassFilter
  );

  // Filtered students for bulk entry
  const filteredStudents = examStudents.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPending = pendingOnly
      ? s.marksObtained === null && !s.isAbsent
      : true;
    return matchesSearch && matchesPending;
  });

  return (
    <div className="space-y-6">
      {/* VIEW 1: EXAM LIST & STATS */}
      {!activeExam ? (
        <>
          {/* Top Banner / Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-[#0D5C52] dark:text-emerald-400" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Exams & Report Cards
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Enter term evaluation marks, generate Sri Lankan grades (A/B/C/S/W), and publish instant report cards to parents.
              </p>
            </div>

            <button
              onClick={() => {
                setCreateError(null);
                setIsCreateModalOpen(true);
              }}
              className="min-h-[44px] px-4 py-2.5 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exam</span>
            </button>
          </div>

          {/* Class Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedClassFilter("ALL")}
              className={`min-h-[38px] px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
                selectedClassFilter === "ALL"
                  ? "bg-[#0D5C52] text-white border-[#0D5C52] shadow-sm"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              All Classes ({exams.length})
            </button>
            {classes.map((c) => {
              const count = exams.filter((e) => e.classId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassFilter(c.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
                    selectedClassFilter === c.id
                      ? "bg-[#0D5C52] text-white border-[#0D5C52] shadow-sm"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {c.title} ({count})
                </button>
              );
            })}
          </div>

          {/* Exam Cards Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0D5C52]" />
              <span className="text-xs font-mono">Loading exam records...</span>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <Award className="w-10 h-10 text-zinc-400 mx-auto" />
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No exams recorded yet
              </h2>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Create your first term test or unit quiz to start recording student marks and generating report cards.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="min-h-[44px] px-4 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Exam</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExams.map((exam) => {
                const completionPct =
                  exam.totalStudents > 0
                    ? Math.round((exam.marksEnteredCount / exam.totalStudents) * 100)
                    : 0;

                return (
                  <div
                    key={exam.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                          {exam.class?.title || "Class"}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {exam.examDate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-950 dark:text-white leading-snug">
                        {exam.title}
                      </h3>

                      <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800/80 text-center">
                        <div>
                          <div className="text-[10px] uppercase font-mono text-zinc-500">Max</div>
                          <div className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                            {exam.maxMarks}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-mono text-zinc-500">Average</div>
                          <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                            {exam.classAverage > 0 ? `${exam.classAverage}` : "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-mono text-zinc-500">Highest</div>
                          <div className="text-xs font-bold font-mono text-[#FF5A26]">
                            {exam.highestMark > 0 ? `${exam.highestMark}` : "-"}
                          </div>
                        </div>
                      </div>

                      {/* Entry Progress bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                          <span>Progress: {exam.marksEnteredCount} of {exam.totalStudents}</span>
                          <span>{completionPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D5C52] dark:bg-emerald-500 transition-all duration-300"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openBulkEntry(exam)}
                      className="w-full min-h-[44px] px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                    >
                      <ClipboardCheck className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
                      <span>Enter / Edit Marks</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 ml-auto" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* VIEW 2: FAST BULK MARKS ENTRY */
        <div className="space-y-5">
          {/* Exam Header Banner */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => setActiveExam(null)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-2 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to All Exams</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  {activeExam.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  {activeExam.class.title}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500 mt-2">
                <span>Date: <strong>{activeExam.examDate}</strong></span>
                <span>•</span>
                <span>Max Marks: <strong>{activeExam.maxMarks}</strong></span>
                <span>•</span>
                <span>Enrolled: <strong>{examStudents.length} Students</strong></span>
              </div>
            </div>

            {/* Sticky Save Button */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={handleSaveAllMarks}
                disabled={isSavingMarks}
                className="min-h-[44px] px-5 py-2.5 bg-[#FF5A26] hover:bg-[#E04818] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {isSavingMarks ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving All...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Marks</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success toast alert */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search student or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[40px] pl-9 pr-3.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPendingOnly(!pendingOnly)}
                className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-colors ${
                  pendingOnly
                    ? "bg-[#0D5C52] text-white border-[#0D5C52]"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Pending Entry Only</span>
              </button>
            </div>
          </div>

          {/* Fast Bulk Marks Entry Table / Cards */}
          {isLoadingMarks ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0D5C52]" />
              <span className="text-xs font-mono">Loading students...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-400">
              No students match the active filter.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4 w-32">Marks (/{activeExam.maxMarks})</th>
                      <th className="py-3 px-3 w-24 text-center">Score %</th>
                      <th className="py-3 px-3 w-20 text-center">Grade</th>
                      <th className="py-3 px-3 w-20 text-center">Rank</th>
                      <th className="py-3 px-4 w-28 text-center">Absent?</th>
                      <th className="py-3 px-4">Teacher Remark</th>
                      <th className="py-3 px-3 text-right">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredStudents.map((student) => {
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {student.fullName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-zinc-400">
                              <span>{student.studentCode}</span>
                              {student.isFreeCard && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-sans">
                                  Free Card
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Marks Input */}
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min={0}
                              max={activeExam.maxMarks}
                              step="0.5"
                              disabled={student.isAbsent}
                              value={
                                student.isAbsent
                                  ? ""
                                  : student.marksObtained !== null
                                  ? student.marksObtained
                                  : ""
                              }
                              onChange={(e) => handleMarkChange(student.id, e.target.value)}
                              placeholder="0 - 100"
                              className="w-28 min-h-[38px] px-3 py-1.5 text-sm font-mono font-bold text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52] disabled:opacity-30 disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
                            />
                          </td>

                          {/* Score Percentage */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">
                            {student.percentage !== null ? `${student.percentage}%` : "-"}
                          </td>

                          {/* Sri Lankan Grade Badge */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${getGradeBadgeColor(
                                student.grade
                              )}`}
                            >
                              {student.grade}
                            </span>
                          </td>

                          {/* Rank */}
                          <td className="py-3 px-3 text-center font-mono text-xs text-zinc-600 dark:text-zinc-400">
                            {student.rank ? `#${student.rank}` : "-"}
                          </td>

                          {/* Absent Toggle Switch */}
                          <td className="py-3 px-4 text-center">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              <input
                                type="checkbox"
                                checked={student.isAbsent}
                                onChange={(e) => handleAbsentToggle(student.id, e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                              />
                              <span className={student.isAbsent ? "text-rose-600 font-bold" : ""}>
                                Absent
                              </span>
                            </label>
                          </td>

                          {/* Optional Remark */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={student.remarks}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              placeholder="e.g. Good essay structure..."
                              className="w-full min-h-[38px] px-3 py-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                            />
                          </td>

                          {/* 1-Click WhatsApp Share */}
                          <td className="py-3 px-3 text-right">
                            <a
                              href={generateWhatsAppLink(student)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Share results with parent (${student.parentPhone})`}
                              className="inline-flex items-center justify-center w-9 h-9 min-h-[36px] min-w-[36px] rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500">
                  Showing {filteredStudents.length} of {examStudents.length} students
                </span>
                <button
                  onClick={handleSaveAllMarks}
                  disabled={isSavingMarks}
                  className="min-h-[44px] px-6 py-2.5 bg-[#FF5A26] hover:bg-[#E04818] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {isSavingMarks ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving All...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Marks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE NEW EXAM */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400" />
                <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                  Create Class Exam
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-5 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Tuition Class <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} • {c.grade} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Title */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Exam Title / Paper Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 1st Term Mid Evaluation, Unit 04 Spot Test"
                  className="w-full min-h-[44px] px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Exam Date */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                  />
                </div>

                {/* Maximum Marks */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Maximum Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(e.target.value)}
                    placeholder="100"
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="min-h-[44px] px-5 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create & Enter Marks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
