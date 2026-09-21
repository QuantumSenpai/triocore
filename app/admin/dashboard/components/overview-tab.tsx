"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowUpRight,
  Wallet,
  Hourglass,
  Sparkles
} from "lucide-react";
import { formatPaise, paiseToRupees } from "@/lib/money";
import { toast } from "sonner";
import type { AdminProject } from "@/types/admin";

interface OverviewTabProps {
  earnedPaise: number;
  pendingPaise: number;
  goalPaise: number;
  projectsCount: number;
  inquiriesCount: number;
  projects: AdminProject[];
  categoryEarnings: Record<string, number>;
  onUpdateGoal: (newGoalPaise: number) => Promise<void>;
}

export function OverviewTab({
  earnedPaise,
  pendingPaise,
  goalPaise,
  projectsCount,
  inquiriesCount,
  projects,
  categoryEarnings,
  onUpdateGoal,
}: OverviewTabProps) {
  const [istTime, setIstTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(paiseToRupees(goalPaise || 10000000)));
  const [calendarView, setCalendarView] = useState<"month" | "agenda">("month");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setIstTime(timeStr);

      const hour = parseInt(
        now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }),
        10
      );
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 17) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = goalPaise > 0 ? Math.min(100, Math.round((earnedPaise / goalPaise) * 100)) : 0;

  const handleSaveGoal = async () => {
    const rupees = parseFloat(goalInput);
    if (isNaN(rupees) || rupees <= 0) {
      toast.error("Please enter a valid goal amount in Rupees.");
      return;
    }
    const newPaise = Math.round(rupees * 100);
    await onUpdateGoal(newPaise);
    setEditingGoal(false);
    toast.success("Monthly earnings goal updated!");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Greeting + Live IST Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
            TrioCore OS • Executive Overview
          </span>
          <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-black text-[#14141A]">
            {greeting}, Studio Lead 👋
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#2B2B38] font-medium">
            Kolkata HQ • Full operational visibility and real-time ledger metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-[#F5F6FC] border border-black/10">
          <Clock className="h-4 w-4 text-[#374BFF]" />
          <div>
            <span className="block text-[10px] font-bold text-[#2B2B38] uppercase tracking-wider">
              IST (Indian Standard Time)
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-[#14141A]">
              {istTime || "00:00:00 AM"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B2B38]">
              Total Earned
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl sm:text-3xl font-black text-emerald-600">
            {formatPaise(earnedPaise)}
          </p>
          <span className="mt-1 block text-[11px] font-medium text-[#2B2B38]">
            Cleared payments in integer paise
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B2B38]">
              Total Pending
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Hourglass className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl sm:text-3xl font-black text-amber-600">
            {formatPaise(pendingPaise)}
          </p>
          <span className="mt-1 block text-[11px] font-medium text-[#2B2B38]">
            Outstanding tranches from active projects
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B2B38]">
              Active Projects
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#374BFF]/10 text-[#374BFF] flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl sm:text-3xl font-black text-[#14141A]">
            {projectsCount}
          </p>
          <span className="mt-1 block text-[11px] font-medium text-[#2B2B38]">
            Under active engineering execution
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B2B38]">
              Total Inquiries
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl sm:text-3xl font-black text-[#14141A]">
            {inquiriesCount}
          </p>
          <span className="mt-1 block text-[11px] font-medium text-[#2B2B38]">
            Direct inquiries via website portal
          </span>
        </div>
      </div>

      {/* Monthly Goal Progress Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#14141A]">
              Monthly Earnings Goal
            </h3>
            <p className="text-xs text-[#2B2B38]">
              Target: <span className="font-bold text-[#14141A]">{formatPaise(goalPaise)}</span> • Current Earned: <span className="font-bold text-emerald-600">{formatPaise(earnedPaise)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingGoal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-32 px-3 py-1.5 text-xs font-bold rounded-xl border border-black/15 bg-[#F5F6FC] text-[#14141A] focus:outline-none focus:border-[#374BFF]"
                  placeholder="Rupees"
                />
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#374BFF] text-white hover:bg-[#14141A] transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingGoal(false)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-black/15 text-[#14141A]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingGoal(true)}
                className="text-xs font-bold text-[#374BFF] hover:underline"
              >
                Change Goal
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-[#14141A]">
            <span>Progress: {progressPercent}%</span>
            <span>{formatPaise(earnedPaise)} of {formatPaise(goalPaise)}</span>
          </div>
          <div className="w-full h-4 bg-[#F5F6FC] rounded-full overflow-hidden border border-black/10 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#374BFF] to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Category Earnings & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category-wise Earnings */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
          <h3 className="font-heading text-lg font-bold text-[#14141A] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#374BFF]" />
            <span>Category-Wise Earnings</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.keys(categoryEarnings).length > 0 ? (
              Object.entries(categoryEarnings).map(([category, paise]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F6FC] border border-black/10"
                >
                  <span className="text-xs font-bold text-[#14141A] capitalize">{category}</span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-emerald-600">
                    {formatPaise(paise)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-[#2B2B38]">
                No categorical earnings recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Project Calendar / Deadlines */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A] flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[#374BFF]" />
              <span>Project Deadlines & Agenda</span>
            </h3>

            <div className="flex rounded-xl border border-black/10 p-1 bg-[#F5F6FC]">
              <button
                onClick={() => setCalendarView("month")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  calendarView === "month" ? "bg-white text-[#374BFF] shadow-xs" : "text-[#2B2B38]"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setCalendarView("agenda")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  calendarView === "agenda" ? "bg-white text-[#374BFF] shadow-xs" : "text-[#2B2B38]"
                }`}
              >
                Agenda
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2 max-h-[340px] overflow-y-auto pr-1">
            {projects.length > 0 ? (
              projects.map((proj) => {
                const deadlineStr = proj.deadline
                  ? new Date(proj.deadline).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "No deadline specified";

                return (
                  <div
                    key={proj.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      proj.isOverdue
                        ? "bg-red-50/60 border-red-200"
                        : "bg-[#F5F6FC] border-black/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading text-sm font-bold text-[#14141A]">
                            {proj.name}
                          </h4>
                          {proj.isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                              <AlertCircle className="h-3 w-3" /> Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#2B2B38] mt-0.5">
                          Client: {proj.clientName} • Category: {proj.category}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-[#14141A]">
                          {deadlineStr}
                        </span>
                        <div className="text-[10px] font-semibold text-[#374BFF]">
                          {proj.milestoneProgressPercent}% Milestones Completed
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-[#2B2B38]">
                No project deadlines scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
