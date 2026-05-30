"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    setDeletingId(pendingDeleteId);
    setShowConfirmModal(false);

    try {
      const res = await fetch(`/api/broadcasts/${pendingDeleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // You can replace this with a toast notification later
        alert("Failed to delete broadcast.");
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setPendingDeleteId(null);
  };

  if (broadcasts.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-sm text-slate-500">
        No broadcasts yet.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table (hidden on mobile, visible from md up) */}
      <div className="hidden md:block glass-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-ocean-700/50">
              {["Subject", "Audience", "Sender", "Sent", "Failed", "Date", "Actions"].map(
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/broadcasts/${b.id}`}
                      className="rounded-lg border border-ocean-400/30 px-3 py-1.5 text-xs text-ocean-400 transition hover:bg-ocean-400/10"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(b.id)}
                      disabled={deletingId === b.id}
                      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingId === b.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout (visible only on small screens) */}
      <div className="md:hidden space-y-4">
        {broadcasts.map((b) => (
          <div
            key={b.id}
            className="glass-card p-4 space-y-3 transition-colors hover:bg-ocean-800/30"
          >
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-500">
                Subject
              </div>
              <div className="text-white font-medium mt-1">{b.subject}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Audience
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  {b.audience_label}
                </div>
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Sender
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  {formatSender(b.sender_type)}
                </div>
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Sent
                </div>
                <div className="text-green-400 text-sm mt-1">{b.sent_count}</div>
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Failed
                </div>
                <div className="text-red-400 text-sm mt-1">{b.failed_count}</div>
              </div>
            </div>

            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-500">
                Date
              </div>
              <div className="text-slate-500 text-sm mt-1">
                {new Date(b.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href={`/admin/broadcasts/${b.id}`}
                className="flex-1 text-center rounded-lg border border-ocean-400/30 px-3 py-2 text-sm text-ocean-400 transition hover:bg-ocean-400/10"
              >
                View
              </Link>
              <button
                onClick={() => handleDeleteClick(b.id)}
                disabled={deletingId === b.id}
                className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {deletingId === b.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
            <p className="text-slate-300">
              Are you sure you want to delete this broadcast history record? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}