import type { CertificateTemplateProps } from "../../CertificatePreview";

function getLogoAlignment(position?: string) {
  if (position === "top-left") return "justify-start";
  if (position === "top-right") return "justify-end";
  return "justify-center";
}

function getSignatureStyle(style?: string): React.CSSProperties {
  if (style === "signatie" || style === "formal") {
    return { fontFamily: "Signatie", fontSize: "28px", fontWeight: 400 };
  }

  if (style === "amsterdam" || style === "elegant") {
    return {
      fontFamily: "AmsterdamHandwriting",
      fontSize: "30px",
      fontWeight: 400,
    };
  }

  if (style === "cintarini") {
    return { fontFamily: "Cintarini", fontSize: "28px", fontWeight: 400 };
  }

  if (style === "oceantrace") {
    return { fontFamily: "OceanTrace", fontSize: "28px", fontWeight: 400 };
  }

  return { fontFamily: "BastligaOne", fontSize: "26px", fontWeight: 400 };
}

export default function ExecutiveDistinctionCertificate({
  recipientName,
  certificateTitle,
  issueDate,
  expiryDate,
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
  const watermarkOpacity = designOverrides?.watermarkOpacity ?? 0.025;

  const signatureText =
    designOverrides?.signatureText || signatoryName || "Authorized Signatory";

  const signatureTitle =
    designOverrides?.signatureTitle || signatoryTitle || "OMSP Administration";

  const signatureStyle = designOverrides?.signatureStyle || "executive";

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-slate-950 p-4">
      <div className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl border-[6px] border-[#c9a44d] bg-[#0a0a0a] shadow-2xl">
        
        {/* Outer and inner frame borders */}
        <div className="absolute inset-4 rounded-sm border border-[#c9a44d]/60 pointer-events-none" />
        <div className="absolute inset-7 rounded-sm border border-white/8 pointer-events-none" />

        {/* Subtle radial gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,164,77,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(201,164,77,0.06),_transparent_32%)] pointer-events-none" />

        {/* Side edge lighting */}
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#c9a44d]/8 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#c9a44d]/8 to-transparent pointer-events-none" />

        {/* Watermark */}
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

        {/* Main content */}
        <div className="relative z-10 flex h-full flex-col px-14 py-10 text-center text-white">
          
          {/* Header: Logo and organization */}
          <div className="mb-4">
            <div className={`mb-2 flex ${getLogoAlignment(logoPosition)}`}>
              <div className="rounded-full border border-[#c9a44d]/60 bg-black/30 p-2.5 shadow-lg">
                <img
                  src="/images/omsp-mark.png"
                  alt="OMSP Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
            </div>
            
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#d6b25e]">
              {organizationName}
            </p>
          </div>

          {/* Certificate title section */}
          <div className="mb-5">
            <h1 className="mt-3 font-serif text-4xl font-bold uppercase tracking-wide text-white">
              Executive Distinction
            </h1>

            <p className="mt-1.5 text-sm font-medium text-[#e4c36b]">
              {certificateTitle}
            </p>
          </div>

          {/* Recipient section - centered */}
          <div className="mx-auto max-w-2xl mb-6 flex-grow flex flex-col justify-center">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/50">
              Distinguished recognition awarded to
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold text-[#f7e3a2]">
              {recipientName}
            </h2>

            <div className="mx-auto mt-2 h-px w-80 bg-gradient-to-r from-transparent via-[#d6b25e] to-transparent" />

            <p className="mx-auto mt-4 max-w-2xl text-xs leading-5 text-slate-300">
              {description}
            </p>
          </div>

          {/* Bottom section: 3-column layout */}
          <div className="grid w-full grid-cols-3 items-end gap-4 pt-4 border-t border-[#d6b25e]/30">
            
            {/* Left: Certificate details */}
            <div className="text-left text-[10px] text-slate-300">
              <div className="space-y-2.5">
                <div>
                  <p className="font-semibold text-[#d6b25e] text-[9px] uppercase">Certificate ID</p>
                  <p className="mt-0.5">{certificateId}</p>
                </div>

                <div>
                  <p className="font-semibold text-[#d6b25e] text-[9px] uppercase">Date Issued</p>
                  <p className="mt-0.5">{issueDate}</p>
                </div>

                {expiryDate && (
                  <div>
                    <p className="font-semibold text-[#d6b25e] text-[9px] uppercase">Valid Until</p>
                    <p className="mt-0.5">{expiryDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Signature */}
            <div className="flex flex-col items-center">
              <p
                className="text-4xl leading-none text-[#f7e3a2]"
                style={getSignatureStyle(signatureStyle)}
              >
                {signatureText}
              </p>

              <div className="mx-auto mb-1 mt-1 h-px w-44 bg-[#d6b25e]" />

              <p className="text-[9px] uppercase tracking-[0.25em] text-white/60">
                {signatureTitle}
              </p>
            </div>

            {/* Right: QR Code */}
            <div className="flex justify-end">
              {qrPosition !== "hidden" && (
                <>
                  {qrCodeUrl ? (
                    <div className="rounded-lg border border-[#d6b25e]/50 bg-white p-1.5 shadow-xl">
                      <img
                        src={qrCodeUrl}
                        alt="Certificate QR Code"
                        className="h-20 w-20"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-[#d6b25e]/50 bg-white/10 text-[9px] font-semibold text-[#d6b25e] uppercase">
                      QR
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Verification text */}
          {verificationUrl && (
            <p className="mt-2 text-[8px] uppercase tracking-wide text-white/40">
              Scan QR Code To Verify Authenticity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}