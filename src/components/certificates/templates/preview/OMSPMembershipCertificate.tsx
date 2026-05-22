import type { CertificateTemplateProps } from "../../CertificatePreview";

function getLogoAlignment(position?: string) {
  if (position === "top-left") return "justify-start";
  if (position === "top-right") return "justify-end";
  return "justify-center";
}

function getQrPosition(position?: string) {
  if (position === "top-left") return "absolute left-10 top-10";
  if (position === "top-right") return "absolute right-10 top-10";
  if (position === "bottom-left") return "absolute bottom-10 left-10";
  return "absolute bottom-10 right-10";
}

function getSignatureStyle(style?: string): React.CSSProperties {
  if (style === "signatie" || style === "formal") {
    return { fontFamily: "Signatie", fontSize: "22px", fontWeight: 400 };
  }

  if (style === "amsterdam" || style === "elegant") {
    return {
      fontFamily: "AmsterdamHandwriting",
      fontSize: "24px",
      fontWeight: 400,
    };
  }

  if (style === "cintarini") {
    return { fontFamily: "Cintarini", fontSize: "22px", fontWeight: 400 };
  }

  if (style === "oceantrace") {
    return { fontFamily: "OceanTrace", fontSize: "22px", fontWeight: 400 };
  }

  return { fontFamily: "BastligaOne", fontSize: "20px", fontWeight: 400 };
}

export default function OMSPMembershipCertificate({
  recipientName,
  certificateTitle,
  issueDate,
  certificateId,
  organizationName = "Organization of Marine Science Professionals",
  description = "This certifies that the named individual is recognized as a member of the Organization of Marine Science Professionals, subject to verification and membership validity.",
  qrCodeUrl,
  verificationUrl,
  signatoryName = "Authorized Signatory",
  signatoryTitle = "OMSP Administration",
  designOverrides,
}: CertificateTemplateProps) {
  const logoPosition = designOverrides?.logoPosition || "top-center";
  const qrPosition = designOverrides?.qrPosition || "bottom-right";
  const showWatermark = designOverrides?.showWatermark ?? true;
  const watermarkOpacity = designOverrides?.watermarkOpacity ?? 0.05;

  const signatureText =
    designOverrides?.signatureText || signatoryName || "Authorized Signatory";
  const signatureTitle =
    designOverrides?.signatureTitle || signatoryTitle || "OMSP Administration";
  const signatureStyle = designOverrides?.signatureStyle || "executive";

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-slate-100 p-4">
      <div className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl border-[6px] border-cyan-900 bg-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-cyan-50 to-slate-100" />

        <div className="absolute left-0 top-0 h-full w-28 bg-gradient-to-b from-cyan-950 via-cyan-800 to-teal-700" />
        <div className="absolute right-0 top-0 h-full w-10 bg-cyan-950" />

        <div className="absolute left-28 top-0 h-full w-px bg-cyan-700/30" />
        <div className="absolute inset-6 rounded-lg border border-cyan-900/20" />

        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="absolute -top-24 left-20 h-72 w-72 rounded-full bg-teal-300/20 blur-2xl" />

        {showWatermark && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img
              src="/images/omsp-mark.png"
              alt="OMSP Seal"
              className="h-72 w-72 object-contain"
              style={{ opacity: watermarkOpacity }}
            />
          </div>
        )}

        {qrPosition !== "hidden" && (
          <div className={getQrPosition(qrPosition)}>
            {qrCodeUrl ? (
              <div className="rounded-lg border border-cyan-900/20 bg-white p-2 shadow">
                <img
                  src={qrCodeUrl}
                  alt="Certificate QR Code"
                  className="h-20 w-20"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-cyan-900/20 bg-white text-[10px] text-cyan-900">
                QR
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 flex h-full">
          <aside className="flex w-28 flex-col items-center justify-between py-10 text-white">
            <div className="rotate-[-90deg] whitespace-nowrap text-xs font-semibold uppercase tracking-[0.35em]">
              OMSP Membership
            </div>

            <div className="h-16 w-px bg-white/40" />

            <div className="rotate-[-90deg] whitespace-nowrap text-[10px] uppercase tracking-[0.25em] text-cyan-100">
              Verified
            </div>
          </aside>

          <div className="flex flex-1 flex-col justify-between px-14 py-12 text-center text-slate-900">
            <div className="w-full">
              <div className={`mb-4 flex ${getLogoAlignment(logoPosition)}`}>
                <div className="rounded-full border border-cyan-900/20 bg-white p-3 shadow">
                  <img
                    src="/images/omsp-mark.png"
                    alt="OMSP Logo"
                    className="h-14 w-14 object-contain"
                  />
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-800">
                {organizationName}
              </p>

              <h1 className="mt-5 font-serif text-5xl font-bold text-cyan-950">
                Membership Certificate
              </h1>

              <p className="mt-3 text-base font-medium text-slate-600">
                {certificateTitle}
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                This certifies that
              </p>

              <h2 className="mt-5 font-serif text-5xl font-bold text-slate-950">
                {recipientName}
              </h2>

              <div className="mx-auto mt-4 h-px w-80 bg-cyan-800/40" />

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600">
                {description}
              </p>

              <div className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3 text-left text-xs">
                <div className="rounded-xl border border-cyan-900/10 bg-white/70 p-3">
                  <p className="font-semibold text-cyan-900">Member ID</p>
                  <p className="mt-1 text-slate-600">{certificateId}</p>
                </div>

                <div className="rounded-xl border border-cyan-900/10 bg-white/70 p-3">
                  <p className="font-semibold text-cyan-900">Issue Date</p>
                  <p className="mt-1 text-slate-600">{issueDate}</p>
                </div>

                <div className="rounded-xl border border-cyan-900/10 bg-white/70 p-3">
                  <p className="font-semibold text-cyan-900">Status</p>
                  <p className="mt-1 text-slate-600">Verified Member</p>
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-3 items-end gap-6">
              <div className="text-left text-xs text-slate-500">
                <p className="font-semibold text-cyan-900">Verification ID</p>
                <p>{certificateId}</p>
              </div>

              <div className="text-center">
                <p
                  className="text-5xl leading-none text-cyan-950"
                  style={getSignatureStyle(signatureStyle)}
                >
                  {signatureText}
                </p>

                <div className="mx-auto mb-2 mt-1 h-px w-48 bg-cyan-900" />

                <p className="text-xs uppercase tracking-widest text-slate-500">
                  {signatureTitle}
                </p>
              </div>

              <div />
            </div>

            {verificationUrl && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-wide text-slate-400">
                Scan QR Code To Verify Membership Authenticity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}