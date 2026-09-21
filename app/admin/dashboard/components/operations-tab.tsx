"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  FileText, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Pin, 
  Copy, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  X,
  Mail,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminFeedbackReport,
  AdminNote,
  AdminTeamMember,
  AdminInvite,
} from "@/types/admin";

interface OperationsTabProps {
  reports: AdminFeedbackReport[];
  unreadCount: number;
  notes: AdminNote[];
  teamMembers: AdminTeamMember[];
  adminInvites: AdminInvite[];
  isOwner: boolean;
  onRefresh: () => Promise<void>;
}

export function OperationsTab({
  reports,
  unreadCount,
  notes,
  teamMembers,
  adminInvites,
  isOwner,
  onRefresh,
}: OperationsTabProps) {
  const [subTab, setSubTab] = useState<"reports" | "notes" | "team-access">("reports");
  const [reportFilter, setReportFilter] = useState<"all" | "unread" | "resolved">("all");

  // Note Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", isPinned: false });

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [createdInviteUrl, setCreatedInviteUrl] = useState("");

  // Report Note Editor
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [internalNoteInput, setInternalNoteInput] = useState("");

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (reportFilter === "all") return true;
    return r.status === reportFilter;
  });

  // Resolve / Unresolve report
  const handleToggleReportStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "resolved" ? "unread" : "resolved";
      const res = await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Report marked as ${newStatus}!`);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Save report internal note
  const handleSaveInternalNote = async (id: string) => {
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, internalNotes: internalNoteInput }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      toast.success("Internal note saved!");
      setActiveReportId(null);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Create Note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create note");
      toast.success("Note saved (sanitized against scripts)!");
      setNoteModalOpen(false);
      setNoteForm({ title: "", content: "", isPinned: false });
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notes?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      toast.success("Note deleted");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const res = await fetch("/api/admin/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !isPinned }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      toast.success(isPinned ? "Note unpinned" : "Note pinned to top!");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Generate 48h Invite
  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invite");
      setCreatedInviteUrl(data.inviteUrl);
      toast.success("Single-use 48h invitation link generated!");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Toggle Member Finance / Status
  const handleUpdateMember = async (userId: string, updates: { canViewFinance?: boolean; status?: string }) => {
    try {
      const res = await fetch("/api/admin/team-access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update member access");
      toast.success("Member access updated!");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-black/10 shadow-xs">
        <button
          onClick={() => setSubTab("reports")}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "reports" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
          }`}
        >
          Reports & Feedback
          {unreadCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab("notes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "notes" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
          }`}
        >
          Private Info ({notes.length})
        </button>

        {isOwner && (
          <button
            onClick={() => setSubTab("team-access")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === "team-access" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
            }`}
          >
            Team Access & Roles
          </button>
        )}
      </div>

      {/* SUBTAB: REPORTS & FEEDBACK */}
      {subTab === "reports" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">
                Feedback & Bug Reports
              </h3>
              <p className="text-xs text-[#2B2B38]">
                Stored in Postgres first • Forwarded to Formspree server-side • Filters & Internal Notes
              </p>
            </div>

            <div className="flex rounded-xl border border-black/10 p-1 bg-[#F5F6FC]">
              {(["all", "unread", "resolved"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReportFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    reportFilter === filter ? "bg-white text-[#374BFF] shadow-xs" : "text-[#2B2B38]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.length > 0 ? (
              filteredReports.map((r) => (
                <div key={r.id} className="p-5 rounded-2xl bg-[#F5F6FC] border border-black/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.type === "bug" ? "bg-red-100 text-red-700" : r.type === "feature" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-[#374BFF]"
                        }`}>
                          {r.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          r.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {r.status}
                        </span>
                        <span className="text-[11px] text-[#2B2B38]">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm font-medium text-[#14141A]">{r.message}</p>
                      {r.email && (
                        <p className="text-[11px] text-[#2B2B38] mt-1">Sender: <span className="font-bold">{r.email}</span></p>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleReportStatus(r.id, r.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        r.status === "resolved"
                          ? "border border-black/15 text-[#2B2B38] hover:bg-white"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {r.status === "resolved" ? "Mark Unresolved" : "✓ Resolve"}
                    </button>
                  </div>

                  {/* Internal Notes */}
                  <div className="pt-2 border-t border-black/5 text-xs">
                    {activeReportId === r.id ? (
                      <div className="flex gap-2 items-center mt-1">
                        <input
                          type="text"
                          value={internalNoteInput}
                          onChange={(e) => setInternalNoteInput(e.target.value)}
                          placeholder="Add internal resolution note..."
                          className="flex-1 px-3 py-1.5 rounded-xl border border-black/15 bg-white text-xs"
                        />
                        <button
                          onClick={() => handleSaveInternalNote(r.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#374BFF] text-white font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setActiveReportId(null)}
                          className="px-2 py-1.5 text-[#2B2B38]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[#2B2B38]">
                        <span>Note: <span className="italic font-medium text-[#14141A]">{r.internalNotes || "None"}</span></span>
                        <button
                          onClick={() => {
                            setActiveReportId(r.id);
                            setInternalNoteInput(r.internalNotes || "");
                          }}
                          className="text-[11px] font-bold text-[#374BFF] hover:underline cursor-pointer"
                        >
                          Edit Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#2B2B38]">
                No reports found matching this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: PRIVATE INFO (NOTES) */}
      {subTab === "notes" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Permanent Warning Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-xs font-bold">
              Do not store passwords or API keys here. This scratchpad is meant for general studio operational notes, meeting minutes, and architectural checklists.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">
              Studio Private Notes
            </h3>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Note
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  n.isPinned ? "bg-blue-50/50 border-[#374BFF]/30" : "bg-[#F5F6FC] border-black/10"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading text-sm font-bold text-[#14141A]">{n.title}</h4>
                    <button
                      onClick={() => handleTogglePin(n.id, Boolean(n.isPinned))}
                      className={`p-1 rounded-lg ${n.isPinned ? "text-[#374BFF]" : "text-[#2B2B38] hover:text-[#14141A]"}`}
                      title={n.isPinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[#2B2B38] whitespace-pre-wrap leading-relaxed">
                    {n.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 mt-4 flex items-center justify-between text-[10px] text-[#2B2B38]">
                  <span>{n.updatedAt ? new Date(n.updatedAt).toLocaleDateString("en-IN") : ""}</span>
                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB: TEAM ACCESS & ROLES (OWNER ONLY) */}
      {subTab === "team-access" && isOwner && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">
                Team Access, Privileges & 48h Invites
              </h3>
              <p className="text-xs text-[#2B2B38]">
                Owner-only controls • Single-use 48h invite links • Finance view toggles
              </p>
            </div>

            <button
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Invite Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/10 text-[#2B2B38] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Finance Access</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {teamMembers.map((m) => (
                  <tr key={m.userId || m.id} className="hover:bg-[#F5F6FC]">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#14141A]">{m.name || "Team Member"}</div>
                      <div className="text-[11px] text-[#2B2B38]">{m.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        m.role === "owner" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-[#374BFF]"
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {m.role === "owner" ? (
                        <span className="text-[11px] font-bold text-emerald-600">Full (Owner)</span>
                      ) : (
                        <button
                          onClick={() => handleUpdateMember(m.userId || m.id, { canViewFinance: !m.canViewFinance })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            m.canViewFinance ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-black/15 text-[#2B2B38]"
                          }`}
                        >
                          {m.canViewFinance ? "✓ Allowed" : "Restricted"}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        m.status === "disabled" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {m.status || "active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {m.role !== "owner" && (
                        <button
                          onClick={() => handleUpdateMember(m.userId || m.id, { status: m.status === "disabled" ? "active" : "disabled" })}
                          className="px-2.5 py-1 rounded-lg border border-black/15 text-[11px] font-bold text-[#14141A] hover:bg-white transition-all cursor-pointer"
                        >
                          {m.status === "disabled" ? "Enable" : "Disable"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NEW NOTE */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">New Private Note</h3>
              <button onClick={() => setNoteModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Title *</label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Content * (Markdown sanitized)</label>
                <textarea
                  rows={4}
                  required
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF] resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#14141A]">
                <input
                  type="checkbox"
                  checked={noteForm.isPinned}
                  onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                />
                <span>Pin to top</span>
              </label>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer mt-2"
              >
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVITE MEMBER */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Generate 48h Team Invite</h3>
              <button onClick={() => { setInviteModalOpen(false); setCreatedInviteUrl(""); }} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createdInviteUrl ? (
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold block">✓ Invitation Link Generated</span>
                  <span>Single-use link valid for 48 hours. Send this to the invited engineer:</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F5F6FC] border border-black/10 font-mono text-xs break-all select-all">
                  {createdInviteUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdInviteUrl);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Copy className="h-4 w-4" /> Copy Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateInvite} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Invitee Email *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="engineer@triocore.in"
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="member">Member</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer mt-2"
                >
                  Generate 48h Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
