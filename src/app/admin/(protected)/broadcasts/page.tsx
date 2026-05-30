// src/app/admin/(protected)/broadcasts/page.tsx
import Link from "next/link";
import BroadcastHistoryClient from "./BroadcastHistoryClient";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getBroadcasts() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("email_broadcasts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

async function getForms() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("forms")
    .select("id, title")
    .order("created_at", { ascending: false });
  return data ?? [];
}

function formatAudience(audience: string, forms: { id: string; title: string }[]) {
  if (audience === "all") return "All registered users";
  if (audience === "promotional") return "Promotional users";
  if (audience === "admins") return "Admins only";
  if (audience.startsWith("form:")) {
    const [, formId, status] = audience.split(":");
    const form = forms.find((f) => f.id === formId);
    const statusLabel =
      status === "approved"
        ? "Approved applicants"
        : status === "rejected"
        ? "Rejected applicants"
        : status === "pending"
        ? "Pending applicants"
        : "All applicants";
    return `${form?.title ?? "Unknown form"} • ${statusLabel}`;
  }
  if (audience.startsWith("selected_users:")) {
    const count = audience.split(":")[1] ?? "0";
    return `${count} selected user${count === "1" ? "" : "s"}`;
  }
  if (audience.startsWith("manual_emails:")) {
    const count = audience.split(":")[1] ?? "0";
    return `${count} manual email${count === "1" ? "" : "s"}`;
  }
  return audience;
}

export default async function BroadcastsListPage() {
  const broadcasts = await getBroadcasts();
  const forms = await getForms();

  const formattedBroadcasts = broadcasts.map((broadcast) => ({
    ...broadcast,
    audience_label: formatAudience(broadcast.audience, forms),
  }));

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Broadcast Emails</h1>
          <p className="admin-page-subtitle">
            View past broadcasts and create new ones.
          </p>
        </div>
        <Link
          href="/admin/broadcasts/new"
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          + New Broadcast
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-slate-500">
          Recent Broadcasts
        </h2>
        <BroadcastHistoryClient broadcasts={formattedBroadcasts} />
      </div>
    </div>
  );
}