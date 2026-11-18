"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  PieChart,
  TrendingUp,
  Wallet,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Lock,
  Loader2,
  X,
  Building,
  Target,
  PiggyBank,
  CheckCircle2,
} from "lucide-react";

interface Allocation {
  id: string;
  month: string;
  title: string;
  category: "CLASS_EXPENSE" | "PERSONAL_GOAL" | "SAVINGS";
  allocatedAmount: number;
  createdAt: string;
}

interface FinanceData {
  month: string;
  totalCollected: number;
  totalPending: number;
  totalAllocated: number;
  netCashInHand: number;
  allocations: Allocation[];
}

export default function TeacherFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [month, setMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Add Allocation Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"CLASS_EXPENSE" | "PERSONAL_GOAL" | "SAVINGS">("CLASS_EXPENSE");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadFinance(targetMonth: string) {
    setIsLoading(true);
    setIsForbidden(false);
    try {
      const res = await fetch(`/api/tutor/finance?month=${targetMonth}`);
      if (res.status === 403) {
        setIsForbidden(true);
        setIsLoading(false);
        return;
      }
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFinance(month);
  }, [month]);

  async function handleAddAllocation(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tutor/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          title,
          category,
          allocatedAmount: Number(amount),
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setIsAddModalOpen(false);
        setTitle("");
        setAmount("");
        showToast("Financial allocation saved successfully!");
        loadFinance(month);
      } else {
        setFormError(resData.error || "Failed to add allocation");
      }
    } catch {
      setFormError("Network error while adding allocation");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAllocation(id: string) {
    if (!confirm("Are you sure you want to remove this financial allocation?")) return;
    try {
      const res = await fetch(`/api/tutor/finance?id=${id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        showToast("Allocation removed successfully.");
        loadFinance(month);
      } else {
        alert(resData.error || "Failed to delete allocation");
      }
    } catch {
      alert("Error deleting allocation");
    }
  }

  // Calculate percentages
  const percentages = useMemo(() => {
    if (!data || data.totalCollected === 0) {
      return { expenses: 0, goals: 0, savings: 0, net: 0 };
    }
    const total = data.totalCollected;
    const expenses = data.allocations
      .filter((a) => a.category === "CLASS_EXPENSE")
      .reduce((s, a) => s + a.allocatedAmount, 0);
    const goals = data.allocations
      .filter((a) => a.category === "PERSONAL_GOAL")
      .reduce((s, a) => s + a.allocatedAmount, 0);
    const savings = data.allocations
      .filter((a) => a.category === "SAVINGS")
      .reduce((s, a) => s + a.allocatedAmount, 0);

    return {
      expenses: Math.min(100, Math.round((expenses / total) * 100)),
      goals: Math.min(100, Math.round((goals / total) * 100)),
      savings: Math.min(100, Math.round((savings / total) * 100)),
      net: Math.max(0, Math.round((data.netCashInHand / total) * 100)),
    };
  }, [data]);

  if (isForbidden) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-8 text-center space-y-3">
        <Lock className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">
          Strict Access Restriction: Teacher Only
        </h2>
        <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
          Class Assistants and gate staff are not authorized to view or manage financial earnings, personal budget allocations, or net cash flow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Finance & Profit Planner
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Real-time monthly revenue reconciliation, expense budgeting, and net cash-in-hand tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-[44px] px-4 py-2 bg-[#0D5C52] hover:bg-[#09433c] text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Allocation</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#0D5C52]" />
          <span className="text-xs font-mono">Calculating financial cash flow...</span>
        </div>
      ) : data ? (
        <>
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Collected */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
                <span>Class Fees Collected</span>
                <DollarSign className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-2 tabular-nums">
                Rs. {data.totalCollected.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono tabular-nums">
                Uncollected Due: Rs. {data.totalPending.toLocaleString()}
              </div>
            </div>

            {/* Total Allocated */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
                <span>Allocations & Overheads</span>
                <PieChart className="w-4 h-4 text-[#FF5A26]" />
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white mt-2 tabular-nums">
                Rs. {data.totalAllocated.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                {data.allocations.length} active allocation buckets
              </div>
            </div>

            {/* Net Cash in Hand */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-mono">
                <span>Net Cash in Hand</span>
                <Wallet className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-950 dark:text-white mt-2 tabular-nums">
                Rs. {data.netCashInHand.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-sans">
                Take-home earnings remaining
              </div>
            </div>
          </div>

          {/* Visual Distribution Progress Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0D5C52] dark:text-emerald-400" />
              Monthly Revenue Distribution Breakdown
            </h2>

            {/* Segmented Bar */}
            <div className="h-5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${percentages.expenses}%` }}
                title={`Class Expenses: ${percentages.expenses}%`}
                className="bg-amber-500 h-full transition-all duration-300"
              />
              <div
                style={{ width: `${percentages.goals}%` }}
                title={`Personal Goals: ${percentages.goals}%`}
                className="bg-blue-500 h-full transition-all duration-300"
              />
              <div
                style={{ width: `${percentages.savings}%` }}
                title={`Savings: ${percentages.savings}%`}
                className="bg-purple-500 h-full transition-all duration-300"
              />
              <div
                style={{ width: `${percentages.net}%` }}
                title={`Net Take-Home: ${percentages.net}%`}
                className="bg-emerald-500 h-full transition-all duration-300"
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-400">Class Expenses ({percentages.expenses}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-400">Personal Goals ({percentages.goals}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-400">Savings ({percentages.savings}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Net Cash ({percentages.net}%)</span>
              </div>
            </div>
          </div>

          {/* Active Allocations List */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Active Budget Allocations for {month}
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                Total: Rs. {data.totalAllocated.toLocaleString()}
              </span>
            </div>

            {data.allocations.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                No allocations set for {month}. Click "+ Add Allocation" to set up hall rent, printing, personal goals, or savings.
              </div>
            ) : (
              <div className="space-y-3">
                {data.allocations.map((alloc) => {
                  let CategoryIcon = Building;
                  let badgeClass = "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
                  let categoryLabel = "Class Expense";

                  if (alloc.category === "PERSONAL_GOAL") {
                    CategoryIcon = Target;
                    badgeClass = "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300";
                    categoryLabel = "Personal Goal";
                  } else if (alloc.category === "SAVINGS") {
                    CategoryIcon = PiggyBank;
                    badgeClass = "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300";
                    categoryLabel = "Savings";
                  }

                  return (
                    <div
                      key={alloc.id}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                            {alloc.title}
                          </div>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${badgeClass}`}>
                            {categoryLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <span className="font-mono font-bold text-sm text-zinc-950 dark:text-white">
                          Rs. {alloc.allocatedAmount.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAllocation(alloc.id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-white dark:hover:bg-zinc-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* ADD ALLOCATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                Add Financial Allocation
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAllocation} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Month
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Allocation Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hall Rent or Vehicle Lease"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                >
                  <option value="CLASS_EXPENSE">Class Expense (Hall Rent, Printing, Materials)</option>
                  <option value="PERSONAL_GOAL">Personal Goal (Vehicle, Equipment, Tech)</option>
                  <option value="SAVINGS">Savings (High-Yield, Emergency Fund)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Allocated Amount (LKR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="500"
                  required
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C52]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  <span>Save Allocation</span>
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
