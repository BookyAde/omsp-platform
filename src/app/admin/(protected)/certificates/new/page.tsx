import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import NewCertificateForm from "./NewCertificateForm";

export const dynamic = "force-dynamic";

async function getForms() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("forms").select("id, title").order("created_at");
  return data ?? [];
}

export default async function NewCertificatePage() {
  const forms = await getForms();
  return (
    <div>
      <div className="admin-page-header mb-6">
        <h1 className="admin-page-title">Create New Certificate</h1>
        <p className="admin-page-subtitle">Generate from approved form submissions or manually.</p>
      </div>
      <NewCertificateForm forms={forms} />
    </div>
  );
}