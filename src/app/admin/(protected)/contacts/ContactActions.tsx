"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContactStatus } from "@/types";

interface ContactActionsProps {
  id: string;
  currentStatus: ContactStatus;
}

export default function ContactActions({
  id,
  currentStatus,
}: ContactActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: ContactStatus) {
    try {
      setBusy(true);

      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Failed to update message status.");
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteMessage() {
    const confirmed = confirm(
      "Are you sure you want to delete this contact message?"
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json().catch(() => null);
        alert(result?.error || "Failed to delete contact message.");
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      {currentStatus === "unread" && (
        <button
          onClick={() => updateStatus("read")}
          disabled={busy}
          className="rounded-lg border border-ocean-600/50 bg-ocean-800 px-3 py-1.5
                     text-xs font-medium text-slate-300 transition-all
                     hover:bg-ocean-700 hover:text-white disabled:opacity-50"
        >
          Mark read
        </button>
      )}

      {currentStatus !== "archived" && (
        <button
          onClick={() => updateStatus("archived")}
          disabled={busy}
          className="rounded-lg border border-ocean-600/50 bg-ocean-800 px-3 py-1.5
                     text-xs font-medium text-slate-400 transition-all
                     hover:border-red-500/30 hover:bg-red-500/10
                     hover:text-red-400 disabled:opacity-50"
        >
          Archive
        </button>
      )}

      <button
        onClick={deleteMessage}
        disabled={busy}
        className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5
                   text-xs font-medium text-red-400 transition-all
                   hover:border-red-500/40 hover:bg-red-500/10
                   disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}