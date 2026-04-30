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

  async function updateStatus(id: string, status: "approved" | "rejected") {
    try {
      setUpdatingId(id);

      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      router.refresh();
    } catch (err) {
      console.error("Failed to update submission status:", err);
      alert("Failed to update submission status. Please try again.");
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

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search responses..."
            className="form-input pl-4 text-sm py-2.5 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="btn-ghost text-sm px-5 py-2.5 flex items-center gap-2 flex-shrink-0 disabled:opacity-40"
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
                                <span className="text-[10px] font-mono text-orange-400/70 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded leading-none">
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
                            onClick={() => updateStatus(sub.id, "approved")}
                            disabled={updatingId === sub.id}
                            className="text-xs px-3 py-1.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 disabled:opacity-50"
                          >
                            {updatingId === sub.id ? "Approving..." : "Approve"}
                          </button>
                        )}

                        {sub.status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(sub.id, "rejected")}
                            disabled={updatingId === sub.id}
                            className="text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 disabled:opacity-50"
                          >
                            {updatingId === sub.id ? "Rejecting..." : "Reject"}
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
            className="text-teal-400 hover:text-teal-300 underline text-sm"
          >
            Open document
          </a>

          <a
            href={url}
            target="_blank"
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