"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  ShieldAlert,
  Plus,
  X,
  Phone,
  CheckCircle2,
  Lock,
  Loader2,
  Users,
} from "lucide-react";

interface Assistant {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  permissions: ("ATTENDANCE" | "FEES" | "TUTES")[];
  status: string;
  createdAt: string;
}

export default function TeacherAssistantPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Assistant Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<("ATTENDANCE" | "FEES" | "TUTES")[]>([
    "ATTENDANCE",
    "FEES",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  async function loadAssistants() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tutor/assistants");
      const data = await res.json();
      if (data.success && data.assistants) {
        setAssistants(data.assistants);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAssistants();
  }, []);

  function togglePermission(perm: "ATTENDANCE" | "FEES" | "TUTES") {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  async function handleAddAssistant(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (permissions.length === 0) {
      setFormError("Please select at least one permission");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tutor/assistants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          password,
          permissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFullName("");
        setPhone("");
        setPassword("");
        setPermissions(["ATTENDANCE", "FEES"]);
        showToast("Class assistant provisioned successfully!");
        loadAssistants();
      } else {
        setFormError(data.error || "Failed to add assistant");
      }
    } catch {
      setFormError("Network error while adding assistant");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Class Assistants & Gate Staff
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Provision assistant accounts with granular operational permissions (Attendance, Fees, Tutes).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-4 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Class Assistant</span>
        </button>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3 text-xs">
        <Lock className="w-5 h-5 text-[#0D5C52] dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            Strict Multi-Tenant Security & Zero-Trust Finance Boundaries
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Class Assistants can only perform designated operational duties (gate attendance check-in, fee markings, or tutorial request approvals). They are <strong>strictly blocked</strong> from accessing the Finance & Profit Planner, bank allocations, or personal take-home profit metrics at both edge middleware and API route levels.
          </p>
        </div>
      </div>

      {/* Assistant Roster */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#0D5C52]" />
          <span className="text-xs font-mono">Loading staff roster...</span>
        </div>
      ) : assistants.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-8 text-center text-xs text-zinc-500">
          No class assistants provisioned yet. Add your first assistant to delegate attendance and fee collection.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((asst) => (
            <div
              key={asst.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                    {asst.fullName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mt-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{asst.phone}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {asst.status || "ACTIVE"}
                </span>
              </div>

              {/* Permissions */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-[11px] font-semibold text-zinc-500">
                  Active Permissions:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(asst.permissions || []).map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-1 rounded-md text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                    >
                      ✓ {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD ASSISTANT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Add Class Assistant
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAssistant} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malith Bandara"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Sri Lankan Mobile Phone (Login Username)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="077 443 3221"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Initial Password (Minimum 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Granular Permissions:
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.includes("ATTENDANCE")}
                    onChange={() => togglePermission("ATTENDANCE")}
                    className="rounded text-[#0D5C52] focus:ring-[#0D5C52]"
                  />
                  <span>Attendance Checklist & QR Gate Scanning</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.includes("FEES")}
                    onChange={() => togglePermission("FEES")}
                    className="rounded text-[#0D5C52] focus:ring-[#0D5C52]"
                  />
                  <span>Fee Collection (1-Tap Mark Paid / Unpaid)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.includes("TUTES")}
                    onChange={() => togglePermission("TUTES")}
                    className="rounded text-[#0D5C52] focus:ring-[#0D5C52]"
                  />
                  <span>Tutorial Distribution & Absentee Approvals</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>Provision Assistant</span>
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
