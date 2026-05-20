import { createServerSupabaseClient } from "@/lib/supabase";
import Link from "next/link";

type PageProps = {
  params: {
    certificateId: string;
  };
};

export const dynamic = "force-dynamic";

export default async function CertificateVerificationPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient();
  const certificateId = decodeURIComponent(params.certificateId);

  const { data: certificate, error } = await supabase
    .from("certificates")
    .select(
      `
      certificate_id,
      recipient_name,
      programme_title,
      certificate_type,
      issue_date,
      status
    `
    )
    .eq("certificate_id", certificateId)
    .maybeSingle();

  const isValid = certificate && certificate.status === "valid";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
          OMSP Certificate Verification
        </p>

        {error || !certificate ? (
          <>
            <h1 className="text-3xl font-bold text-red-300">
              Certificate Not Found
            </h1>

            <p className="mt-4 text-slate-300">
              This certificate could not be verified in the official OMSP
              records. Please check the certificate ID or contact OMSP support.
            </p>

            <div className="mt-8 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">
              Certificate ID checked: {certificateId}
            </div>
          </>
        ) : (
          <>
            <div
              className={`mb-6 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                isValid
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              {isValid ? "Valid Certificate" : `Status: ${certificate.status}`}
            </div>

            <h1 className="text-3xl font-bold">
              {isValid
                ? "This certificate is authentic"
                : "This certificate is currently not valid"}
            </h1>

            <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <Info label="Recipient" value={certificate.recipient_name} />
              <Info label="Programme" value={certificate.programme_title} />
              <Info label="Certificate Type" value={certificate.certificate_type} />
              <Info label="Issue Date" value={certificate.issue_date} />
              <Info label="Certificate ID" value={certificate.certificate_id} />
              <Info label="Status" value={certificate.status} />
            </div>

            <p className="mt-6 text-sm text-slate-400">
              This page confirms that the certificate ID above exists in the
              official records of the Organization of Marine Science
              Professionals.
            </p>
          </>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Return to OMSP website
          </Link>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-medium text-white">
        {value || "Not provided"}
      </p>
    </div>
  );
}