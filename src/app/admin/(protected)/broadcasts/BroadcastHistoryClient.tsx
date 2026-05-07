"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Broadcast = {
  id: string;
  subject: string;
  audience: string;
  audience_label: string;
  sender_type?: string | null;
  sent_count: number;
  failed_count: number;
  created_at: string;
};

function formatSender(senderType?: string | null) {
  if (senderType === "admin") return "OMSP Admin";
  if (senderType === "support") return "OMSP Support";
  return "OMSP Team";
}

export default function BroadcastHistoryClient({
  broadcasts,
}: {
  broadcasts: Broadcast[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this broadcast history record?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/broadcasts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete broadcast.");
        return;
      }

      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (broadcasts.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-sm text-slate-500">
        No broadcasts yet.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ocean-700/50">
            {["Subject", "Audience", "Sender", "Sent", "Failed", "Date", "Action"].map(
              (h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left font-mono text-xs uppercase tracking-wider text-slate-500"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-ocean-700/30">
          {broadcasts.map((b) => (
            <tr key={b.id} className="transition-colors hover:bg-ocean-800/30">
              <td className="px-6 py-4 text-sm font-medium text-white">
                {b.subject}
              </td>

              <td className="px-6 py-4 font-mono text-xs text-slate-400">
                {b.audience_label}
              </td>

              <td className="px-6 py-4 text-sm text-slate-400">
                {formatSender(b.sender_type)}
              </td>

              <td className="px-6 py-4 text-sm text-green-400">
                {b.sent_count}
              </td>

              <td className="px-6 py-4 text-sm text-red-400">
                {b.failed_count}
              </td>

              <td className="px-6 py-4 text-sm text-slate-500">
                {new Date(b.created_at).toLocaleString()}
              </td>

              <td className="px-6 py-4">
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deletingId === b.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}