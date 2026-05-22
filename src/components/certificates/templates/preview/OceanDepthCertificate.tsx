import { Cedarville_Cursive, Mr_Dafoe, Reenie_Beanie } from "next/font/google";
import type { CertificateTemplateProps } from "../../CertificatePreview";

const cedarville = Cedarville_Cursive({ weight: "400", subsets: ["latin"] });
const mrDafoe = Mr_Dafoe({ weight: "400", subsets: ["latin"] });
const reenie = Reenie_Beanie({ weight: "400", subsets: ["latin"] });

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
    return {
      fontFamily: "Signatie",
      fontSize: "22px",
      fontWeight: 400,
      lineHeight: 1,
    };
  }

  if (style === "amsterdam" || style === "elegant") {
    return {
      fontFamily: "AmsterdamHandwriting",
      fontSize: "24px",
      fontWeight: 400,
      lineHeight: 1,
    };
  }

  if (style === "cintarini") {
    return {
      fontFamily: "Cintarini",
      fontSize: "22px",
      fontWeight: 400,
      lineHeight: 1,
    };
  }

  if (style === "oceantrace") {
    return {
      fontFamily: "OceanTrace",
      fontSize: "22px",
      fontWeight: 400,
      lineHeight: 1,
    };
  }

  return {
    fontFamily: "BastligaOne",
    fontSize: "20px",
    fontWeight: 400,
    lineHeight: 1,
  };
}

export default function OceanDepthCertificate({
  recipientName,
  certificateTitle,
  issueDate,
  expiryDate,
  certificateId,
  organizationName = "Organization of Marine Science Professionals",
  description = "This certificate is proudly awarded in recognition of excellence, dedication, and commitment to marine and professional development.",
  qrCodeUrl,
  verificationUrl,
  signatoryName = "Authorized Signatory",
  signatoryTitle = "OMSP Administration",
  designOverrides,
}: CertificateTemplateProps) {
  const logoPosition = designOverrides?.logoPosition || "top-center";
  const qrPosition = designOverrides?.qrPosition || "bottom-right";
  const showWatermark = designOverrides?.showWatermark ?? true;
  const watermarkOpacity = designOverrides?.watermarkOpacity ?? 0.06;

  const signatureText =
    designOverrides?.signatureText || signatoryName || "Authorized Signatory";

  const signatureTitle =
    designOverrides?.signatureTitle ||
    signatoryTitle ||
    "OMSP Administration";

  const signatureStyle =
    designOverrides?.signatureStyle || "executive";

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-slate-950 p-4">
      <div className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl bg-gradient-to-br from-[#021826] via-[#032c44] to-[#021018] shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-10 top-20 h-72 w-72 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <div className="absolute inset-5 rounded-lg border border-cyan-400/40" />
        <div className="absolute inset-8 rounded-lg border border-white/10" />

        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-cyan-500/10 to-transparent" />
        <div className="absolute top-0 right-0 h-32 w-full bg-gradient-to-b from-white/5 to-transparent" />

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
              <div className="rounded-lg bg-white p-2 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="Certificate QR Code"
                  className="h-20 w-20"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-cyan-200/30 bg-white/10 text-[10px] text-cyan-100">
                QR
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-between px-14 py-12 text-center text-white">
          <div className="w-full">
            <div className={`mb-4 flex ${getLogoAlignment(logoPosition)}`}>
              <img
                src="/images/omsp-mark.png"
                alt="OMSP Logo"
                className="h-16 w-16 object-contain"
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
              {organizationName}
            </p>

            <h1 className="mt-6 font-serif text-5xl font-bold uppercase tracking-wide text-white">
              Certificate
            </h1>

            <p className="mt-3 text-lg font-medium text-cyan-200">
              {certificateTitle}
            </p>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-100/70">
              Proudly Presented To
            </p>

            <h2 className="mt-5 bg-gradient-to-r from-cyan-200 via-white to-cyan-200 bg-clip-text font-serif text-5xl font-bold text-transparent">
              {recipientName}
            </h2>

            <div className="mx-auto mt-4 h-px w-80 bg-cyan-300/40" />

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-200">
              {description}
            </p>
          </div>

          <div className="grid w-full -translate-y-6 grid-cols-3 items-end gap-6">
            <div className="text-left text-xs text-slate-300">
              <p className="font-semibold text-cyan-200">
                Certificate ID
              </p>
              <p>{certificateId}</p>

              <p className="mt-3 font-semibold text-cyan-200">
                Date Issued
              </p>
              <p>{issueDate}</p>

              {expiryDate && (
                <>
                  <p className="mt-3 font-semibold text-cyan-200">
                    Valid Until
                  </p>
                  <p>{expiryDate}</p>
                </>
              )}
            </div>

            <div className="text-center">
              <p
                className="text-5xl leading-none text-white"
                style={getSignatureStyle(signatureStyle)}
              >
                {signatureText}
              </p>

              <div className="mx-auto mb-2 mt-1 h-px w-48 bg-cyan-200/50" />

              <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/70">
                {signatureTitle}
              </p>
            </div>

            <div />
          </div>

          {verificationUrl && (
            <p className="absolute bottom-4 text-[10px] tracking-wide text-cyan-100/60">
              Scan QR Code To Verify Authenticity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}