"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { formatDateTime, objectsToCSV, downloadCSV } from "@/lib/utils";
import type { Form } from "@/types";
import AIReviewButton from "@/components/AIReviewButton";
import Button from "@/components/ui/Button";
import { Search, Download, X, User, CheckCircle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SubmissionValue {
  id: string;
  value: string;
  field: {
    id: string;
    label: string;
    field_type: string;
    field_order: number;
    is_active: boolean;
  } | null;
}

interface Submission {
  id: string;
  submitted_at: string;
  ip_address: string | null;
  status: "pending" | "approved" | "rejected";
  form: {
    id: string;
    title: string;
    slug: string;
    requires_review: boolean;
  } | null;
  values: SubmissionValue[];
  ai_review?: any;
}

interface SubmissionsClientProps {
  forms: Form[];
  submissions: Submission[];
  selectedFormId?: string;
}

type ReviewAction = "approved" | "rejected";

function isFileValue(val: SubmissionValue) {
  return val.field?.field_type === "file" && Boolean(val.value);
}

export default function SubmissionsClient({
  forms,
  submissions,
  selectedFormId,
}: SubmissionsClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [reviewModal, setReviewModal] = useState<{
    submission: Submission;
    action: ReviewAction;
  } | null>(null);

  const [reviewNote, setReviewNote] = useState("");

  // ─── Result Modal state (centered card) ──────────────────────
  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto‑dismiss timer (2.5 seconds)
  useEffect(() => {
    if (resultModal?.visible) {
      const timer = setTimeout(() => {
        setResultModal((prev) => (prev ? { ...prev, visible: false } : null));
        setTimeout(() => setResultModal(null), 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [resultModal]);

  // Show the centered card
  const showResultModal = (message: string, type: "success" | "error") => {
    setResultModal({ visible: true, type, message });
  };

  // Toast for file‑loading errors (kept simple – you can upgrade later)
  const showToast = (message: string, type: "success" | "error" = "success") => {
    alert(message);
  };

  function openReviewModal(submission: Submission, action: ReviewAction) {
    setReviewModal({ submission, action });
    setReviewNote("");
  }

  function closeReviewModal() {
    if (updatingId) return;
    setReviewModal(null);
    setReviewNote("");
  }

  async function submitReview() {
    if (!reviewModal) return;

    const { submission, action } = reviewModal;

    try {
      setUpdatingId(submission.id);

      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          review_note: reviewNote,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const actionText = action === "approved" ? "Approved" : "Rejected";
      const message = `Submission ${actionText} successfully!`;
      showResultModal(message, action === "approved" ? "success" : "error");

      closeReviewModal();
      router.refresh();
    } catch (err) {
      showResultModal("Failed to update submission status.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleFormFilter(formId: string) {
    const params = formId ? `?form_id=${formId}` : "";
    router.push(`/admin/submissions${params}`);
  }

  const filtered = submissions.filter((sub) => {
    const haystack = [sub.form?.title ?? "", ...sub.values.map((v) => v.value)]
      .join(" ")
      .toLowerCase();
    return (
      (search.trim() === "" || haystack.includes(search.toLowerCase())) &&
      (statusFilter === "all" || sub.status === statusFilter)
    );
  });

  function exportCSV() {
    if (filtered.length === 0) return;

    const allLabels = new Set<string>();
    filtered.forEach((sub) =>
      sub.values.forEach((v) => {
        if (v.field) allLabels.add(v.field.label);
      })
    );

    const labelList = Array.from(allLabels);

    const rows = filtered.map((sub) => {
      const row: Record<string, string> = {
        "Submission ID": sub.id,
        Form: sub.form?.title ?? "",
        Status: sub.status ?? "pending",
        "Requires Review": String(Boolean(sub.form?.requires_review)),
        "Submitted At": formatDateTime(sub.submitted_at),
      };

      for (const label of labelList) {
        const match = sub.values.find((v) => v.field?.label === label);
        row[label] = match?.value ?? "";
      }
      return row;
    });

    downloadCSV(
      objectsToCSV(rows),
      `omsp-submissions-${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  const getSubmitterName = (sub: Submission) => {
    const nameField = sub.values.find((v) =>
      v.field?.label.toLowerCase().includes("name") ||
      v.field?.label.toLowerCase().includes("full")
    );
    return nameField?.value || "Anonymous Applicant";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <select
          value={selectedFormId ?? ""}
          onChange={(e) => handleFormFilter(e.target.value)}
          className="form-input w-full sm:w-72"
        >
          <option value="">All Forms</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search submitters or content..."
            className="form-input pl-11 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="form-input w-full sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <Button onClick={exportCSV} disabled={filtered.length === 0} className="flex items-center gap-2 whitespace-nowrap">
          <Download size={18} />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-700 bg-ocean-950/80">
              <th className="px-6 py-4 text-left font-medium">Submitter</th>
              <th className="px-6 py-4 text-left font-medium">Submitted</th>
              <th className="px-6 py-4 text-left font-medium">Status</th>
              <th className="px-6 py-4 text-left font-medium">AI Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-800">
            {filtered.map((sub) => (
              <tr
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className="hover:bg-ocean-900/70 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-5 font-medium flex items-center gap-3">
                  <User size={18} className="text-slate-400" />
                  {getSubmitterName(sub)}
                </td>
                <td className="px-6 py-5 text-slate-400 text-sm">
                  {formatDateTime(sub.submitted_at)}
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex px-4 py-1 text-xs rounded-full font-medium
                    ${sub.status === "approved" ? "bg-green-500/20 text-green-400" : 
                      sub.status === "rejected" ? "bg-red-500/20 text-red-400" : 
                      "bg-yellow-500/20 text-yellow-400"}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  {sub.ai_review ? (
                    <span className="font-mono text-emerald-400 font-medium">{sub.ai_review.score}/10</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Side Drawer */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={(e) => e.target === e.currentTarget && setSelectedSubmission(null)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl h-full bg-ocean-950 border-l border-ocean-700 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-ocean-950 border-b border-ocean-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-semibold">Submission Details</h2>
                <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>

              <div className="p-6 space-y-10">
                <AIReviewButton
                  submissionId={selectedSubmission.id}
                  submissionData={selectedSubmission}
                  onReviewComplete={() => router.refresh()}
                />

                <div>
                  <h4 className="font-semibold mb-5 text-lg">Submission Information</h4>
                  <div className="space-y-6">
                    {selectedSubmission.values.map((val) => {
                      const isArchived = val.field?.is_active === false;
                      return (
                        <div key={val.id}>
                          <p className="text-xs text-slate-500 mb-1 font-mono tracking-wider">
                            {val.field?.label} {isArchived && "(Archived)"}
                          </p>
                          <p className="text-slate-200 break-words">
                            {isFileValue(val) ? <FilePreview path={val.value} /> : val.value || "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {Boolean(selectedSubmission.form?.requires_review) && (
                  <div className="flex gap-4 pt-6 border-t border-ocean-700">
                    {selectedSubmission.status !== "approved" && (
                      <Button
                        onClick={() => openReviewModal(selectedSubmission, "approved")}
                        disabled={updatingId === selectedSubmission.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    )}
                    {selectedSubmission.status !== "rejected" && (
                      <Button
                        onClick={() => openReviewModal(selectedSubmission, "rejected")}
                        disabled={updatingId === selectedSubmission.id}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          action={reviewModal.action}
          submission={reviewModal.submission}
          note={reviewNote}
          saving={updatingId === reviewModal.submission.id}
          onNoteChange={setReviewNote}
          onClose={closeReviewModal}
          onSubmit={submitReview}
        />
      )}

      {/* ─── Centered Result Modal ─────────────────────────────── */}
      <AnimatePresence>
        {resultModal?.visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setResultModal((prev) => (prev ? { ...prev, visible: false } : null))}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-md rounded-3xl border border-ocean-700 bg-ocean-950 p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="mx-auto mb-4 flex h-24 w-24 items-center justify-center"
              >
                {resultModal.type === "success" ? (
                  <CheckCircle className="h-20 w-20 text-green-400" strokeWidth={1.5} />
                ) : (
                  <XCircle className="h-20 w-20 text-red-400" strokeWidth={1.5} />
                )}
              </motion.div>

              <h3 className="text-2xl font-bold text-white">
                {resultModal.type === "success" ? "Success!" : "Error"}
              </h3>
              <p className="mt-2 text-slate-300">{resultModal.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==================== REVIEW MODAL ==================== */
function ReviewModal({
  action,
  submission,
  note,
  saving,
  onNoteChange,
  onClose,
  onSubmit,
}: {
  action: ReviewAction;
  submission: Submission;
  note: string;
  saving: boolean;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isApproval = action === "approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-ocean-700 bg-ocean-950 shadow-2xl">
        <div className="border-b border-ocean-700/50 px-6 py-5">
          <h2 className="font-display text-xl font-bold text-white">
            {isApproval ? "Approve Submission" : "Reject Submission"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {submission.form?.title ?? "Form submission"}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border border-ocean-700/50 bg-ocean-900/50 p-4">
            <p className="text-xs font-mono text-slate-500 mb-1">Email placeholder</p>
            <p className="text-sm text-slate-300">
              Whatever you type here can appear in the email as{" "}
              <span className="font-mono text-teal-300">{"{{review_note}}"}</span>.
            </p>
          </div>

          <div>
            <label className="form-label">
              {isApproval ? "Approval note" : "Rejection reason"}
            </label>
            <textarea
              rows={6}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="form-input resize-y"
              placeholder={
                isApproval
                  ? "Example: Welcome to OMSP. Please check your email for the next step."
                  : "Example: Your uploaded document was incomplete. Please submit again with the correct file."
              }
            />
          </div>

          <div className="rounded-xl border border-ocean-700/50 bg-ocean-900/40 p-4">
            <p className="text-xs font-mono text-slate-500 mb-2">Email preview value</p>
            <p className="text-sm text-slate-300 whitespace-pre-line">
              {note || "No review note added."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-ocean-700/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-ghost text-sm px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className={`text-sm px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 ${
              isApproval
                ? "bg-green-500/15 text-green-300 border border-green-500/30 hover:bg-green-500/20"
                : "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/20"
            }`}
          >
            {saving
              ? isApproval
                ? "Approving..."
                : "Rejecting..."
              : isApproval
              ? "Confirm Approval"
              : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== FILE PREVIEW ==================== */
function FilePreview({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileName = path.split("/").pop();

  async function loadFile() {
    try {
      setLoading(true);
      const supabase = createBrowserClient();
      const { data, error } = await supabase.storage
        .from("form-uploads")
        .createSignedUrl(path, 60 * 5);

      if (error || !data?.signedUrl) throw new Error("Failed to load file");
      setUrl(data.signedUrl);
    } catch {
      alert("Could not load file.");
    } finally {
      setLoading(false);
    }
  }

  const isImage = path.toLowerCase().match(/\.(jpg|jpeg|png)$/);

  return (
    <div className="space-y-2">
      {!url ? (
        <button
          type="button"
          onClick={loadFile}
          className="text-teal-400 hover:text-teal-300 underline text-sm"
        >
          {loading ? "Loading..." : fileName ?? "View file"}
        </button>
      ) : isImage ? (
        <div className="space-y-2">
          <img src={url} alt="Uploaded file" className="max-h-48 rounded border border-ocean-700" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 underline">
            Open full image
          </a>
        </div>
      ) : (
        <div className="flex gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline text-sm">
            Open document
          </a>
          <a href={url} target="_blank" rel="noopener noreferrer" download className="text-teal-400 hover:text-teal-300 underline text-sm">
            Download
          </a>
        </div>
      )}
    </div>
  );
}