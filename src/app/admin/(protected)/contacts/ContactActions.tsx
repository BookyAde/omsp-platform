"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContactStatus } from "@/types";

interface ContactActionsProps {
  id: string;
  currentStatus: ContactStatus;
}

export default function ContactActions({ id, currentStatus }: ContactActionsProps) {
  const router  = useRouter();
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: ContactStatus) {
    setBusy(true);
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {currentStatus === "unread" && (
        <button
          onClick={() => updateStatus("read")}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 border border-ocean-600/50
                     text-slate-300 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          Mark read
        </button>
      )}
      {currentStatus !== "archived" && (
        <button
          onClick={() => updateStatus("archived")}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-red-500/10 border border-ocean-600/50
                     hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-medium transition-all disabled:opacity-50"
        >
          Archive
        </button>
      )}
    </div>
  );
}
