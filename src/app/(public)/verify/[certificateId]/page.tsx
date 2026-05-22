import { createServerSupabaseClient } from "@/lib/supabase";
import Link from "next/link";

type PageProps = {
  params: {
    certificateId: string;
  };
};

export const dynamic = "force-dynamic";

export default async function CertificateVerificationPage({
  params,
}: PageProps) {
  const supabase = await createServerSupabaseClient();

  const certificateId = decodeURIComponent(params.certificateId);

  const { data: certificate, error } = await supabase
    .from("certificates")
    .select(
      `
      certificate_id,
      recipient_name,
      programme_title,
      certificate_title,
      certificate_type,
      issue_date,
      expiry_date,
      status
    `
    )
    .eq("certificate_id", certificateId)
    .maybeSingle();

  const now = new Date();

  const isExpired =
    certificate?.expiry_date &&
    new Date(certificate.expiry_date) < now;

  const computedStatus = !certificate
    ? "not-found"
    : certificate.status === "revoked"
    ? "revoked"
    : isExpired
    ? "expired"
    : "valid";

  const isValid = computedStatus === "valid";

  function getStatusStyles() {
    switch (computedStatus) {
      case "valid":
        return {
          badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
          card: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
          title: "Certificate Verified",
        };

      case "expired":
        return {
          badge: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
          card: "border-amber-500/20 bg-amber-500/10 text-amber-200",
          title: "Certificate Expired",
        };

      case "revoked":
        return {
          badge: "bg-red-500/15 text-red-300 border border-red-500/20",
          card: "border-red-500/20 bg-red-500/10 text-red-200",
          title: "Certificate Revoked",
        };

      default:
        return {
          badge: "bg-slate-500/15 text-slate-300 border border-slate-500/20",
          card: "border-slate-500/20 bg-slate-500/10 text-slate-200",
          title: "Certificate Not Found",
        };
    }
  }

  const styles = getStatusStyles();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="border-b border-white/10 bg-white/[0.03] px-8 py-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
              <img
                src="/images/omsp-mark.png"
                alt="OMSP"
                className="h-12 w-12 object-contain"
              />
            </div>

            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">
              Organization of Marine Science Professionals
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Certificate Verification Portal
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              This verification portal confirms the authenticity and current
              validity status of certificates issued officially by OMSP.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          {error || !certificate ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
              <div className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">
                Certificate Not Found
              </div>

              <h2 className="mt-6 text-3xl font-bold text-white">
                Unable to verify certificate
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                The certificate ID provided could not be found in the official
                OMSP verification records. Please confirm that the certificate
                ID is correct or contact the organization directly.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Certificate ID Checked
                </p>

                <p className="mt-2 break-all font-mono text-lg text-red-200">
                  {certificateId}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${styles.badge}`}
                  >
                    {styles.title}
                  </div>

                  <h2 className="mt-5 text-4xl font-bold leading-tight">
                    {computedStatus === "valid" &&
                      "This certificate is authentic and currently valid."}

                    {computedStatus === "expired" &&
                      "This certificate has exceeded its validity period."}

                    {computedStatus === "revoked" &&
                      "This certificate is no longer recognized as valid."}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Verification Status
                  </p>

                  <p className="mt-2 text-lg font-semibold capitalize text-white">
                    {computedStatus}
                  </p>
                </div>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <Info
                  label="Recipient Name"
                  value={certificate.recipient_name}
                />

                <Info
                  label="Certificate Type"
                  value={certificate.certificate_type}
                />

                <Info
                  label="Certificate Title"
                  value={
                    certificate.certificate_title ||
                    certificate.programme_title
                  }
                />

                <Info
                  label="Issue Date"
                  value={certificate.issue_date}
                />

                <Info
                  label="Expiry Date"
                  value={certificate.expiry_date || "No expiry date"}
                />

                <Info
                  label="Certificate ID"
                  value={certificate.certificate_id}
                />
              </div>

              <div
                className={`mt-10 rounded-3xl border p-6 leading-7 ${styles.card}`}
              >
                {isValid &&
                  "This certificate is officially recognized by the Organization of Marine Science Professionals and remains valid at the time of verification."}

                {computedStatus === "expired" &&
                  "This certificate was legitimately issued by OMSP but is no longer within its approved validity period."}

                {computedStatus === "revoked" &&
                  "This certificate has been revoked by the issuing organization and should no longer be treated as active or valid."}
              </div>

              <div className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-6">
                <h3 className="text-lg font-semibold">
                  About OMSP Verification
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Every official OMSP certificate is issued with a unique
                  verification identifier and QR validation system. This portal
                  exists to ensure transparency, authenticity, and trusted
                  professional recognition across all OMSP programmes,
                  certifications, memberships, and executive recognitions.
                </p>
              </div>
            </>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Return to OMSP Website
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact OMSP
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 break-words text-lg font-semibold leading-7 text-white">
        {value || "Not provided"}
      </p>
    </div>
  );
}