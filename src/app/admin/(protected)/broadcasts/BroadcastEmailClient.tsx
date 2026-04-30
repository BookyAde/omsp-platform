"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AudienceType = "users" | "form_applicants";
type UserAudience = "all" | "promotional" | "admins";
type SubmissionStatus = "all" | "pending" | "approved" | "rejected";

type FormOption = {
  id: string;
  title: string;
};

type Result = {
  success?: boolean;
  total_recipients?: number;
  sent_count?: number;
  failed_count?: number;
  error?: string;
};

type Props = {
  forms: FormOption[];
};

export default function BroadcastEmailClient({ forms }: Props) {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [audienceType, setAudienceType] = useState<AudienceType>("users");
  const [userAudience, setUserAudience] = useState<UserAudience>("all");
  const [formId, setFormId] = useState("");
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("all");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setResult(null);

    try {
      const payload =
        audienceType === "users"
          ? {
              subject,
              message,
              audience_type: "users",
              user_audience: userAudience,
            }
          : {
              subject,
              message,
              audience_type: "form_applicants",
              form_id: formId,
              submission_status: submissionStatus,
            };

      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          success: false,
          error: data.error || "Failed to send broadcast",
        });
        return;
      }

      setResult({
        success: true,
        total_recipients: data.total_recipients ?? 0,
        sent_count: data.sent_count ?? 0,
        failed_count: data.failed_count ?? 0,
      });

      router.refresh();

      setSubject("");
      setMessage("");
    } catch {
      setResult({
        success: false,
        error: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  const canSend =
    subject.trim().length > 0 &&
    message.trim().length > 0 &&
    !loading &&
    (audienceType === "users" || Boolean(formId));

  return (
    <div className="glass-card p-6 max-w-3xl mt-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Subject
          </label>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="form-input w-full text-sm py-2.5"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Message
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your broadcast message..."
            className="form-input w-full text-sm py-2.5 min-h-[220px]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Audience Type
          </label>

          <select
            value={audienceType}
            onChange={(e) => setAudienceType(e.target.value as AudienceType)}
            className="form-input w-full text-sm py-2.5"
          >
            <option value="users">Registered users</option>
            <option value="form_applicants">Form applicants</option>
          </select>
        </div>

        {audienceType === "users" && (
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
              User Audience
            </label>

            <select
              value={userAudience}
              onChange={(e) => setUserAudience(e.target.value as UserAudience)}
              className="form-input w-full text-sm py-2.5"
            >
              <option value="all">All users</option>
              <option value="promotional">Promotional users only</option>
              <option value="admins">Admins only</option>
            </select>
          </div>
        )}

        {audienceType === "form_applicants" && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                Select Form
              </label>

              <select
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                className="form-input w-full text-sm py-2.5"
                required
              >
                <option value="">Choose a form</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                Submission Status
              </label>

              <select
                value={submissionStatus}
                onChange={(e) =>
                  setSubmissionStatus(e.target.value as SubmissionStatus)
                }
                className="form-input w-full text-sm py-2.5"
              >
                <option value="all">All applicants</option>
                <option value="pending">Pending applicants</option>
                <option value="approved">Approved applicants</option>
                <option value="rejected">Rejected applicants</option>
              </select>
            </div>
          </div>
        )}

        {audienceType === "form_applicants" && (
          <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-sm text-teal-300">
            This will send emails to applicants from the selected form. The form
            must contain an email field.
          </div>
        )}

        {result && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              result.success
                ? "bg-green-500/10 text-green-400 border-green-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {result.success ? (
              <p>
                Broadcast sent successfully. Recipients:{" "}
                <strong>{result.total_recipients}</strong>, Sent:{" "}
                <strong>{result.sent_count}</strong>, Failed:{" "}
                <strong>{result.failed_count}</strong>
              </p>
            ) : (
              <p>{result.error}</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSend}
            className="btn-primary text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Broadcast"}
          </button>
        </div>
      </form>
    </div>
  );
}