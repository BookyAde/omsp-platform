import { createServerSupabaseClient } from "@/lib/supabase";
import CertificatesClient from "./CertificatesClient";

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

  return <CertificatesClient initialCertificates={certificates} />;
}