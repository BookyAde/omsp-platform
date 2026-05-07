"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AudienceType =
  | "users"
  | "form_applicants"
  | "selected_users"
  | "manual_emails";

type UserAudience = "all" | "promotional" | "admins";
type SubmissionStatus = "all" | "pending" | "approved" | "rejected";
type SenderType = "admin" | "team" | "support";

type FormOption = {
  id: string;
  title: string;
};

type UserOption = {
  id: string;
  full_name?: string | null;
  email: string | null;
  role?: string | null;
  email_promotions?: boolean | null;
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
  users?: UserOption[];
};

export default function BroadcastEmailClient({
  forms,
  users = [],
}: Props) {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [senderType, setSenderType] =
    useState<SenderType>("team");

  const [audienceType, setAudienceType] =
    useState<AudienceType>("users");

  const [userAudience, setUserAudience] =
    useState<UserAudience>("all");

  const [formId, setFormId] = useState("");

  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const name = String(user.full_name ?? "").toLowerCase();
      const email = String(user.email ?? "").toLowerCase();
      const role = String(user.role ?? "").toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        role.includes(query)
      );
    });
  }, [searchTerm, users]);

  function toggleUser(userId: string) {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  function parseManualEmails() {
    return manualEmails
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter(Boolean);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        subject,
        message,
        sender_type: senderType,
        audience_type: audienceType,

        ...(audienceType === "users"
          ? {
              user_audience: userAudience,
            }
          : {}),

        ...(audienceType === "form_applicants"
          ? {
              form_id: formId,
              submission_status: submissionStatus,
            }
          : {}),

        ...(audienceType === "selected_users"
          ? {
              selected_user_ids: selectedUserIds,
            }
          : {}),

        ...(audienceType === "manual_emails"
          ? {
              manual_emails: parseManualEmails(),
            }
          : {}),
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
      setManualEmails("");
      setSelectedUserIds([]);
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
    (
      audienceType === "users" ||
      (audienceType === "form_applicants" && Boolean(formId)) ||
      (audienceType === "selected_users" &&
        selectedUserIds.length > 0) ||
      (audienceType === "manual_emails" &&
        parseManualEmails().length > 0)
    );

  return (
    <div className="glass-card mt-6 max-w-4xl p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
            Subject
          </label>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="form-input w-full py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
            Message
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your broadcast message..."
            className="form-input min-h-[220px] w-full py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
            Send From
          </label>

          <select
            value={senderType}
            onChange={(e) =>
              setSenderType(
                e.target.value as SenderType
              )
            }
            className="form-input w-full py-2.5 text-sm"
          >
            <option value="team">
              OMSP Team • team@omspglobal.org
            </option>

            <option value="admin">
              OMSP Admin • admin@omspglobal.org
            </option>

            <option value="support">
              OMSP Support • support@omspglobal.org
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
            Audience Type
          </label>

          <select
            value={audienceType}
            onChange={(e) =>
              setAudienceType(
                e.target.value as AudienceType
              )
            }
            className="form-input w-full py-2.5 text-sm"
          >
            <option value="users">
              Registered users
            </option>

            <option value="form_applicants">
              Form applicants
            </option>

            <option value="selected_users">
              Selected registered users
            </option>

            <option value="manual_emails">
              Manual email addresses
            </option>
          </select>
        </div>

        {audienceType === "users" && (
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
              User Audience
            </label>

            <select
              value={userAudience}
              onChange={(e) =>
                setUserAudience(
                  e.target.value as UserAudience
                )
              }
              className="form-input w-full py-2.5 text-sm"
            >
              <option value="all">
                All users
              </option>

              <option value="promotional">
                Promotional users only
              </option>

              <option value="admins">
                Admins only
              </option>
            </select>
          </div>
        )}

        {audienceType === "form_applicants" && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
                Select Form
              </label>

              <select
                value={formId}
                onChange={(e) =>
                  setFormId(e.target.value)
                }
                className="form-input w-full py-2.5 text-sm"
                required
              >
                <option value="">
                  Choose a form
                </option>

                {forms.map((form) => (
                  <option
                    key={form.id}
                    value={form.id}
                  >
                    {form.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
                Submission Status
              </label>

              <select
                value={submissionStatus}
                onChange={(e) =>
                  setSubmissionStatus(
                    e.target.value as SubmissionStatus
                  )
                }
                className="form-input w-full py-2.5 text-sm"
              >
                <option value="all">
                  All applicants
                </option>

                <option value="pending">
                  Pending applicants
                </option>

                <option value="approved">
                  Approved applicants
                </option>

                <option value="rejected">
                  Rejected applicants
                </option>
              </select>
            </div>
          </div>
        )}

        {audienceType === "selected_users" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
                Search Users
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search by name, email, or role"
                className="form-input w-full py-2.5 text-sm"
              />
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border border-ocean-700/50">
              {filteredUsers.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  No users found.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-ocean-700/30 px-4 py-3 transition-colors hover:bg-ocean-800/40"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(
                        user.id
                      )}
                      onChange={() =>
                        toggleUser(user.id)
                      }
                      className="h-4 w-4"
                    />

                    <div>
                      <p className="text-sm font-medium text-white">
                        {user.full_name ||
                          "Unnamed user"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    {user.role && (
                      <span className="ml-auto rounded-full bg-ocean-700/60 px-2.5 py-1 text-xs text-slate-400">
                        {user.role}
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>

            <p className="text-xs text-slate-500">
              Selected users:{" "}
              {selectedUserIds.length}
            </p>
          </div>
        )}

        {audienceType === "manual_emails" && (
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-500">
              Manual Email Addresses
            </label>

            <textarea
              value={manualEmails}
              onChange={(e) =>
                setManualEmails(e.target.value)
              }
              placeholder="Enter emails separated by commas or new lines"
              className="form-input min-h-[140px] w-full py-2.5 text-sm"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              You can send themed OMSP emails
              to people who are not registered
              on the platform.
            </p>
          </div>
        )}

        {audienceType === "form_applicants" && (
          <div className="rounded-xl border border-teal-400/20 bg-teal-400/10 px-4 py-3 text-sm text-teal-300">
            This will send emails to
            applicants from the selected
            form. The form must contain an
            email field.
          </div>
        )}

        {result && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              result.success
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {result.success ? (
              <p>
                Broadcast sent successfully.
                Recipients:{" "}
                <strong>
                  {result.total_recipients}
                </strong>
                , Sent:{" "}
                <strong>
                  {result.sent_count}
                </strong>
                , Failed:{" "}
                <strong>
                  {result.failed_count}
                </strong>
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
            className="btn-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "Sending..."
              : "Send Broadcast"}
          </button>
        </div>
      </form>
    </div>
  );
}