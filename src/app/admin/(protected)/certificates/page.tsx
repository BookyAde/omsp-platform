// src/app/admin/(protected)/certificates/page.tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import CertificateList from "./components/CertificateList";

export const dynamic = "force-dynamic";

async function getCertificates() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load certificates:", error);
    return [];
  }
  return data || [];
}

export default async function CertificatesPage() {
  const certificates = await getCertificates();

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Certificates</h1>
          <p className="admin-page-subtitle">
            Manage issued certificates, generate new ones, and send them to recipients.
          </p>
        </div>
        <Link
          href="/admin/certificates/new"
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          + New Certificate
        </Link>
      </div>

      <div className="mt-8">
        <CertificateList initialCertificates={certificates} />
      </div>
    </div>
  );
}