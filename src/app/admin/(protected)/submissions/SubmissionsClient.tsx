"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { formatDateTime, objectsToCSV, downloadCSV } from "@/lib/utils";
import type { Form } from "@/types";

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

  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [reviewModal, setReviewModal] = useState<{
    submission: Submission;
    action: ReviewAction;
  } | null>(null);

  const [reviewNote, setReviewNote] = useState("");

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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      closeReviewModal();
      router.refresh();
    } catch (err) {
      console.error("Failed to update submission status:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update submission status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handleFormFilter(formId: string) {
    const params = formId ? `?form_id=${formId}` : "";
    router.push(`/admin/submissions${params}`);
  }

  const filtered = search.trim()
    ? submissions.filter((sub) => {
        const haystack = [
          sub.form?.title ?? "",
          ...sub.values.map((v) => v.value),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search.toLowerCase());
      })
    : submissions;

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedFormId ?? ""}
          onChange={(e) => handleFormFilter(e.target.value)}
          className="form-input w-auto text-sm py-2.5"
        >
          <option value="">All forms</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search responses..."
          className="form-input pl-4 text-sm py-2.5 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="btn-ghost text-sm px-5 py-2.5 disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-slate-500 text-sm">
            {search ? "No submissions match your search." : "No submissions yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div key={sub.id} className="glass-card overflow-hidden">
              <button
                onClick={() =>
                  setExpanded((e) => (e === sub.id ? null : sub.id))
                }
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-ocean-800/30 transition-colors"
              >
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="text-white text-sm font-medium truncate">
                    {sub.form?.title ?? "Unknown form"}
                  </span>

                  <span className="text-slate-400 text-sm">
                    {formatDateTime(sub.submitted_at)}
                  </span>

                  <span
                    className={`text-xs font-mono px-2 py-1 rounded w-fit ${
                      sub.status === "approved"
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : sub.status === "rejected"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {sub.status ?? "pending"}
                  </span>

                  <span className="text-slate-600 text-xs font-mono truncate hidden sm:block">
                    {sub.id}
                  </span>
                </div>
              </button>

              {expanded === sub.id && (
                <div className="border-t border-ocean-700/40 px-6 py-5 bg-ocean-900/30">
                  {sub.values.length === 0 ? (
                    <p className="text-slate-600 text-sm">
                      No field values recorded.
                    </p>
                  ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {sub.values.map((val) => {
                        const isArchived = val.field?.is_active === false;

                        return (
                          <div key={val.id}>
                            <dt className="flex items-center gap-2 mb-1">
                              <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">
                                {val.field?.label ?? "Deleted field"}
                              </span>

                              {isArchived && (
                                <span className="text-[10px] font-mono text-orange-400/70 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded">
                                  archived
                                </span>
                              )}
                            </dt>

                            <dd
                              className={`text-sm break-words ${
                                isArchived ? "text-slate-400" : "text-white"
                              }`}
                            >
                              {isFileValue(val) ? (
                                <FilePreview path={val.value} />
                              ) : val.value ? (
                                val.value
                              ) : (
                                <span className="text-slate-600 italic">
                                  empty
                                </span>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}

                  <div className="mt-5 pt-4 border-t border-ocean-700/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs font-mono">
                        ID: {sub.id}
                      </span>

                      {sub.ip_address && (
                        <span className="text-slate-600 text-xs font-mono">
                          IP: {sub.ip_address}
                        </span>
                      )}
                    </div>

                    {Boolean(sub.form?.requires_review) && (
                      <div className="flex gap-2">
                        {sub.status !== "approved" && (
                          <button
                            onClick={() => openReviewModal(sub, "approved")}
                            disabled={updatingId === sub.id}
                            className="text-xs px-3 py-1.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}

                        {sub.status !== "rejected" && (
                          <button
                            onClick={() => openReviewModal(sub, "rejected")}
                            disabled={updatingId === sub.id}
                            className="text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}

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
            <p className="text-xs font-mono text-slate-500 mb-1">
              Email placeholder
            </p>

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
            <p className="text-xs font-mono text-slate-500 mb-2">
              Email preview value
            </p>

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

      if (error || !data?.signedUrl) {
        throw new Error("Failed to load file");
      }

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
          <img
            src={url}
            alt="Uploaded file"
            className="max-h-48 rounded border border-ocean-700"
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 underline"
          >
            Open full image
          </a>
        </div>
      ) : (
        <div className="flex gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:text-teal-300 underline text-sm"
          >
            Open document
          </a>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-teal-400 hover:text-teal-300 underline text-sm"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}