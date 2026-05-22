import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function VerifyCertificatePage({
  params,
}: {
  params: { certificateId: string };
}) {
  const supabase = await createServerSupabaseClient();

  const { data: certificate, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_id", params.certificateId)
    .single();

  if (error || !certificate) {
    notFound();
  }

  const isExpired =
    certificate.expiry_date &&
    new Date(certificate.expiry_date) < new Date();

  const verificationStatus =
    certificate.status === "revoked"
      ? "revoked"
      : isExpired
        ? "expired"
        : "valid";

  const statusStyles =
    verificationStatus === "valid"
      ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/20"
      : verificationStatus === "expired"
        ? "bg-amber-500/20 text-amber-200 border-amber-400/20"
        : "bg-red-500/20 text-red-200 border-red-400/20";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            OMSP Certificate Verification
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Certificate Verification Result
          </h1>

          <div
            className={`mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${statusStyles}`}
          >
            {verificationStatus.toUpperCase()}
          </div>
        </div>

        <div className="mt-10 grid gap-5 rounded-2xl bg-slate-900/60 p-6 text-sm md:grid-cols-2">
          <div>
            <p className="text-slate-400">Recipient</p>
            <p className="mt-1 text-base font-semibold text-white">
              {certificate.recipient_name}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Certificate ID</p>
            <p className="mt-1 text-base font-semibold text-white">
              {certificate.certificate_id}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Certificate Title</p>
            <p className="mt-1 text-base font-semibold text-white">
              {certificate.certificate_title ||
                certificate.certificate_type}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Programme</p>
            <p className="mt-1 text-base font-semibold text-white">
              {certificate.programme_title || "Not specified"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Issue Date</p>
            <p className="mt-1 text-base font-semibold text-white">
              {new Date(certificate.issue_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Expiry Date</p>
            <p className="mt-1 text-base font-semibold text-white">
              {certificate.expiry_date
                ? new Date(
                    certificate.expiry_date
                  ).toLocaleDateString()
                : "No expiry"}
            </p>
          </div>
        </div>

        {certificate.pdf_url && (
          <div className="mt-8 text-center">
            <a
              href={certificate.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90"
            >
              Download Certificate PDF
            </a>
          </div>
        )}
      </div>
    </main>
  );
}