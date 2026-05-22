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

export default function ExecutiveDistinctionCertificate({
  recipientName,
  certificateTitle,
  issueDate,
  certificateId,
  organizationName = "Organization of Marine Science Professionals",
  description = "This certificate is issued in distinguished recognition of exceptional service, leadership, partnership, and professional contribution.",
  qrCodeUrl,
  verificationUrl,
  signatoryName = "Authorized Signatory",
  signatoryTitle = "OMSP Administration",
  designOverrides,
}: CertificateTemplateProps) {
  const logoPosition = designOverrides?.logoPosition || "top-center";
  const qrPosition = designOverrides?.qrPosition || "bottom-right";
  const showWatermark = designOverrides?.showWatermark ?? true;
  const watermarkOpacity = designOverrides?.watermarkOpacity ?? 0.04;

  const signatureText =
    designOverrides?.signatureText || signatoryName || "Authorized Signatory";
  const signatureTitle =
    designOverrides?.signatureTitle || signatoryTitle || "OMSP Administration";
  const signatureStyle = designOverrides?.signatureStyle || "executive";

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-slate-950 p-4">
      <div className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl border-[8px] border-[#d6b25e] bg-[#111111] shadow-2xl">
        <div className="absolute inset-5 border border-[#d6b25e]/70" />
        <div className="absolute inset-9 border border-white/10" />

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#d6b25e]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#d6b25e]/10 blur-3xl" />

        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#d6b25e]/15 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#d6b25e]/15 to-transparent" />

        {showWatermark && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img
              src="/images/omsp-mark.png"
              alt="OMSP Seal"
              className="h-72 w-72 object-contain grayscale"
              style={{ opacity: watermarkOpacity }}
            />
          </div>
        )}

        {qrPosition !== "hidden" && (
          <div className={getQrPosition(qrPosition)}>
            {qrCodeUrl ? (
              <div className="rounded-lg border border-[#d6b25e]/40 bg-white p-2 shadow-xl">
                <img
                  src={qrCodeUrl}
                  alt="Certificate QR Code"
                  className="h-20 w-20"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-[#d6b25e]/40 bg-white/10 text-[10px] text-[#d6b25e]">
                QR
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-between px-16 py-12 text-center text-white">
          <div className="w-full">
            <div className={`mb-4 flex ${getLogoAlignment(logoPosition)}`}>
              <div className="rounded-full border border-[#d6b25e]/60 bg-black/30 p-3">
                <img
                  src="/images/omsp-mark.png"
                  alt="OMSP Logo"
                  className="h-14 w-14 object-contain"
                />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d6b25e]">
              {organizationName}
            </p>

            <h1 className="mt-6 font-serif text-5xl font-bold uppercase tracking-wide text-white">
              Executive Distinction
            </h1>

            <p className="mt-3 text-lg font-medium text-[#d6b25e]">
              {certificateTitle}
            </p>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">
              Distinguished recognition awarded to
            </p>

            <h2 className="mt-5 font-serif text-5xl font-bold text-[#f7e3a2]">
              {recipientName}
            </h2>

            <div className="mx-auto mt-4 h-px w-96 bg-gradient-to-r from-transparent via-[#d6b25e] to-transparent" />

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300">
              {description}
            </p>
          </div>

          <div className="grid w-full grid-cols-3 items-end gap-6">
            <div className="text-left text-xs text-slate-300">
              <p className="font-semibold text-[#d6b25e]">Certificate ID</p>
              <p>{certificateId}</p>

              <p className="mt-3 font-semibold text-[#d6b25e]">Date Issued</p>
              <p>{issueDate}</p>
            </div>

            <div className="text-center">
              <p
                className="text-5xl leading-none text-[#f7e3a2]"
                style={getSignatureStyle(signatureStyle)}
              >
                {signatureText}
              </p>

              <div className="mx-auto mb-2 mt-1 h-px w-52 bg-[#d6b25e]" />

              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                {signatureTitle}
              </p>
            </div>

            <div />
          </div>

          {verificationUrl && (
            <p className="absolute bottom-4 text-[10px] tracking-wide text-white/45">
              Scan QR Code To Verify Authenticity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}