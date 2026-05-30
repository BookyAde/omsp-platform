// src/app/admin/(protected)/broadcasts/new/page.tsx
import NewBroadcastWrapper from "./NewBroadcastWrapper";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

export default async function NewBroadcastPage() {
  const forms = await getForms();
  const users = await getUsers();

  return (
    <div>
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title">Create New Broadcast</h1>
        <p className="admin-page-subtitle">
          Compose and send an email to your selected audience.
        </p>
      </div>

      <NewBroadcastWrapper forms={forms} users={users} />
    </div>
  );
}