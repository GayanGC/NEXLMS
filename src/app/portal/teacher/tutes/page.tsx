"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  X,
  ExternalLink,
  BookOpen,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface TuitionClass {
  id: string;
  title: string;
  grade: string;
}

interface ClassTute {
  id: string;
  classId: string;
  title: string;
  month: string;
  fileUrl: string;
  createdAt: string;
}

interface TuteRequest {
  id: string;
  classId: string;
  studentId: string;
  tuteId: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student?: {
    id: string;
    fullName: string;
    studentCode: string;
    parentPhone: string;
  };
  tute?: {
    id: string;
    title: string;
    month: string;
  };
  class?: {
    id: string;
    title: string;
    grade: string;
  };
}

export default function TeacherTutesPage() {
  const [classes, setClasses] = useState<TuitionClass[]>([]);
  const [tutes, setTutes] = useState<ClassTute[]>([]);
  const [requests, setRequests] = useState<TuteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  // Publish Modal state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [newMonth, setNewMonth] = useState("November 2026");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Request Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  async function loadData() {
    setIsLoading(true);
    try {
      const [resClasses, resTutes, resRequests] = await Promise.all([
        fetch("/api/tutor/classes"),
        fetch("/api/tutor/tutes"),
        fetch("/api/tutor/tutes/requests"),
      ]);

      const dataClasses = await resClasses.json();
      const dataTutes = await resTutes.json();
      const dataRequests = await resRequests.json();

      if (dataClasses.success && dataClasses.classes) {
        setClasses(dataClasses.classes);
        if (dataClasses.classes.length > 0 && !newClassId) {
          setNewClassId(dataClasses.classes[0].id);
        }
      }
      if (dataTutes.success && dataTutes.tutes) {
        setTutes(dataTutes.tutes);
      }
      if (dataRequests.success && dataRequests.requests) {
        setRequests(dataRequests.requests);
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

  // Publish new tute
  async function handlePublishSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPublishError(null);
    setIsPublishing(true);

    try {
      const res = await fetch("/api/tutor/tutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: newClassId,
          title: newTitle,
          month: newMonth,
          fileUrl: newFileUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsPublishModalOpen(false);
        setNewTitle("");
        setNewFileUrl("");
        showToast("Tutorial worksheet published successfully!");
        loadData();
      } else {
        setPublishError(data.error || "Failed to publish tutorial");
      }
    } catch {
      setPublishError("Network error while publishing tutorial");
    } finally {
      setIsPublishing(false);
    }
  }

  // Handle Approve or Reject
  async function handleRequestAction(requestId: string, status: "APPROVED" | "REJECTED") {
    setActionLoadingId(requestId);
    try {
      const res = await fetch("/api/tutor/tutes/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Optimistic update
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
        showToast(`Request ${status === "APPROVED" ? "approved" : "rejected"} successfully!`);
      } else {
        alert(data.error || "Failed to update request");
      }
    } catch {
      alert("Network error updating request");
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredTutes = selectedClassFilter === "ALL"
    ? tutes
    : tutes.filter((t) => t.classId === selectedClassFilter);

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Class Tutes & Absentee Requests
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Publish tutorial worksheets and approve download access for students who missed live lectures.
          </p>
        </div>

        <button
          onClick={() => {
            if (classes.length > 0 && !newClassId) {
              setNewClassId(classes[0].id);
            }
            setIsPublishModalOpen(true);
          }}
          className="min-h-[44px] px-4 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>+ Publish New Tute</span>
        </button>
      </div>

      {/* SECTION 1: PARENT TUTE REQUESTS QUEUE */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF5A26]" />
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              Absentee Tute Access Requests ({pendingRequests.length} Pending)
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Real-time Parent Queue
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-6 text-center text-zinc-400 dark:text-zinc-500 text-xs font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No pending tutorial access requests from parents.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => {
              const isProcessing = actionLoadingId === req.id;
              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {req.student?.fullName || "Student"}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {req.student?.studentCode}
                      </span>
                      <span className="text-xs text-zinc-500">
                        • {req.class?.title || "Class"}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-[#0D5C52] dark:text-emerald-400">
                      Requested Tute: {req.tute?.title || "Tutorial Material"} ({req.tute?.month})
                    </div>

                    <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <strong className="text-zinc-900 dark:text-zinc-200">Parent Reason:</strong>{" "}
                      {req.reason}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleRequestAction(req.id, "REJECTED")}
                      className="min-h-[40px] px-3.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleRequestAction(req.id, "APPROVED")}
                      className="min-h-[40px] px-4 py-1.5 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>✓ Approve Access</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recently Processed Requests */}
        {processedRequests.length > 0 && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="text-xs font-semibold text-zinc-500">
              Resolved Requests
            </div>
            <div className="space-y-2">
              {processedRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {req.student?.fullName}
                    </span>{" "}
                    <span className="text-zinc-500">({req.student?.studentCode})</span>
                    <span className="text-zinc-400"> — {req.tute?.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      req.status === "APPROVED"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PUBLISHED TUTES LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
            Published Tutorials & Worksheets ({filteredTutes.length})
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.grade})
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTutes.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-8 text-center text-xs text-zinc-500">
            No tutorial materials published for this class yet. Click "+ Publish New Tute" above to add worksheets.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutes.map((tute) => {
              const cls = classes.find((c) => c.id === tute.classId);
              return (
                <div
                  key={tute.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                      <span>{tute.month}</span>
                      {cls && (
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300">
                          {cls.grade}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white mt-2">
                      {tute.title}
                    </h3>
                    <div className="text-[11px] text-zinc-500 mt-1 font-mono break-all line-clamp-1">
                      {tute.fileUrl}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <a
                      href={tute.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-[#0D5C52] dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download / View Material</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PUBLISH MODAL */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Publish Tutorial Material
              </h2>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="p-5 space-y-4">
              {publishError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
                  {publishError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tuition Class
                </label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
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
                  Tute Title / Unit Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 04: Chemical Bonding Theory & MCQs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Month / Term
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November 2026 or Term 2"
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Google Drive / Cloud PDF URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="min-h-[44px] px-5 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs font-medium rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPublishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Tute</span>
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
