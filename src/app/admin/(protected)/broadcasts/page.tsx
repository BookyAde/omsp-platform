import BroadcastEmailClient from "./BroadcastEmailClient";
import BroadcastHistoryClient from "./BroadcastHistoryClient";
import {
  createServerSupabaseClient,
  createAdminClient,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatAudience(
  audience: string,
  forms: { id: string; title: string }[]
) {
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

async function getForms() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("forms")
    .select("id, title")
    .order("created_at", { ascending: false });

  return data ?? [];
}

async function getUsers() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, email_promotions")
    .not("email", "is", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}

async function getBroadcasts() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("email_broadcasts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export default async function BroadcastsPage() {
  const forms = await getForms();
  const users = await getUsers();
  const broadcasts = await getBroadcasts();

  const formattedBroadcasts = broadcasts.map((broadcast: any) => ({
    ...broadcast,
    audience_label: formatAudience(
      broadcast.audience,
      forms
    ),
  }));

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">
            Broadcast Emails
          </h1>

          <p className="admin-page-subtitle">
            Send announcements, targeted messages,
            and track past broadcasts.
          </p>
        </div>
      </div>

      <BroadcastEmailClient
        forms={forms}
        users={users}
      />

      <div className="mt-8">
        <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-slate-500">
          Recent Broadcasts
        </h2>

        <BroadcastHistoryClient
          broadcasts={formattedBroadcasts}
        />
      </div>
    </div>
  );
}