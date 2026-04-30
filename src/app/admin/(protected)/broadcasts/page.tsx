import BroadcastEmailClient from "./BroadcastEmailClient";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
export const dynamic = "force-dynamic";

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

  return audience;
}

async function getForms() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("forms")
    .select("id, title")
    .order("created_at", { ascending: false });

  return data ?? [];
}

async function getBroadcasts() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("email_broadcasts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export default async function BroadcastsPage() {
  const forms = await getForms();
  const broadcasts = await getBroadcasts();

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Broadcast Emails</h1>
          <p className="admin-page-subtitle">
            Send announcements and track past broadcasts
          </p>
        </div>
      </div>

      {/* FORM */}
      <BroadcastEmailClient forms={forms} />

      {/* HISTORY */}
      <div className="mt-8">
        <h2 className="text-sm font-mono text-slate-500 uppercase tracking-wider mb-3">
          Recent Broadcasts
        </h2>

        {broadcasts.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-500 text-sm">
            No broadcasts yet.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ocean-700/50">
                  {["Subject", "Audience", "Sent", "Failed", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-ocean-700/30">
                {broadcasts.map((b: any) => (
                  <tr
                    key={b.id}
                    className="hover:bg-ocean-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-white text-sm font-medium">
                      {b.subject}
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      {formatAudience(b.audience, forms)}
                    </td>

                    <td className="px-6 py-4 text-green-400 text-sm">
                      {b.sent_count}
                    </td>

                    <td className="px-6 py-4 text-red-400 text-sm">
                      {b.failed_count}
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(b.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}