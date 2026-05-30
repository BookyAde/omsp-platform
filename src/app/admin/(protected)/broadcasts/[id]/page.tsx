// src/app/admin/(protected)/broadcasts/[id]/page.tsx
"use client";

import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type Broadcast = {
  id: string;
  subject: string;
  message: string;
  sender_type: string | null;
  audience: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
};

type Recipient = {
  email: string;
  user_id: string | null;
  status: string;
  created_at: string;
};

function formatSender(senderType?: string | null) {
  if (senderType === "admin") return "OMSP Admin (admin@omspglobal.org)";
  if (senderType === "support") return "OMSP Support (support@omspglobal.org)";
  return "OMSP Team (team@omspglobal.org)";
}

function formatAudienceLabel(audience: string) {
  if (audience === "all") return "All registered users";
  if (audience === "promotional") return "Promotional users";
  if (audience === "admins") return "Admins only";
  if (audience.startsWith("form:")) {
    const parts = audience.split(":");
    const status = parts[2] || "all";
    const statusLabel =
      status === "approved"
        ? "Approved applicants"
        : status === "rejected"
        ? "Rejected applicants"
        : status === "pending"
        ? "Pending applicants"
        : "All applicants";
    return `Form applicants (${statusLabel}) – Form ID: ${parts[1]}`;
  }
  if (audience.startsWith("selected_users:")) {
    const count = audience.split(":")[1] ?? "0";
    return `${count} selected user(s)`;
  }
  if (audience.startsWith("manual_emails:")) {
    const count = audience.split(":")[1] ?? "0";
    return `${count} manual email address(es)`;
  }
  return audience;
}

export default function BroadcastViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecipients, setShowRecipients] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // Fetch broadcast details
  useEffect(() => {
    async function fetchBroadcast() {
      try {
        const res = await fetch(`/api/broadcasts/${params.id}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBroadcast(data);
      } catch (error) {
        console.error("Failed to fetch broadcast", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBroadcast();
  }, [params.id]);

  async function handleShowRecipients() {
    setLoadingRecipients(true);
    try {
      const res = await fetch(`/api/broadcasts/${params.id}/recipients`);
      const data = await res.json();
      setRecipients(data.recipients || []);
      setShowRecipients(true);
    } catch (error) {
      console.error("Failed to load recipients", error);
    } finally {
      setLoadingRecipients(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-slate-400">Loading broadcast details...</div>
      </div>
    );
  }

  if (!broadcast) {
    notFound();
  }

  return (
    <div>
      <div className="admin-page-header mb-6">
        <h1 className="admin-page-title">Broadcast Details</h1>
        <p className="admin-page-subtitle">
          View complete information about this sent broadcast.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate-500">
            Subject
          </label>
          <p className="text-white mt-1 text-lg font-medium">
            {broadcast.subject}
          </p>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate-500">
            Sent From
          </label>
          <p className="text-slate-300 mt-1">
            {formatSender(broadcast.sender_type)}
          </p>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate-500">
            Audience
          </label>
          <p className="text-slate-300 mt-1">
            {formatAudienceLabel(broadcast.audience)}
          </p>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate-500">
            Sent At
          </label>
          <p className="text-slate-300 mt-1">
            {new Date(broadcast.created_at).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate-500">
            Delivery Stats
          </label>
          <div className="flex gap-6 mt-2">
            <div className="rounded-lg bg-green-500/10 px-4 py-2 text-green-400">
              <span className="text-2xl font-bold">{broadcast.sent_count}</span>
              <span className="ml-2 text-sm">Sent</span>
            </div>
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-red-400">
              <span className="text-2xl font-bold">{broadcast.failed_count}</span>
              <span className="ml-2 text-sm">Failed</span>
            </div>
          </div>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-slate-500">
            Message
          </label>
          <div className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-900/50 p-4 text-slate-300 border border-ocean-700/30">
            {broadcast.message}
          </div>
        </div>

        {/* Button to show recipients */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={handleShowRecipients}
            className="inline-flex items-center gap-2 rounded-lg bg-ocean-600/20 px-4 py-2 text-sm text-ocean-300 hover:bg-ocean-600/40 transition"
          >
            👥 Show Recipients ({broadcast.sent_count + broadcast.failed_count} total)
          </button>

          <Link
            href="/admin/broadcasts"
            className="inline-flex items-center gap-2 rounded-lg border border-ocean-400/30 px-4 py-2 text-sm text-ocean-400 transition hover:bg-ocean-400/10"
          >
            ← Back to broadcasts
          </Link>
        </div>
      </div>

      {/* Recipients Modal */}
      {showRecipients && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-ocean-700/50">
              <h3 className="text-lg font-semibold text-white">Recipients List</h3>
              <button
                onClick={() => setShowRecipients(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingRecipients ? (
                <div className="text-center py-8 text-slate-400">Loading recipients...</div>
              ) : recipients.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No recipients recorded yet. (Only new broadcasts after the migration will have recipients.)</div>
              ) : (
                <ul className="space-y-2">
                  {recipients.map((r, idx) => (
                    <li key={idx} className="border-b border-ocean-700/30 py-2">
                      <div className="font-mono text-sm text-white">{r.email}</div>
                      <div className="text-xs text-slate-500">
                        Status: {r.status} • Sent at: {new Date(r.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-ocean-700/50 flex justify-end">
              <button
                onClick={() => setShowRecipients(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}