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

export default function ClassicMaritimeCertificate({
  recipientName,
  certificateTitle,
  issueDate,
  expiryDate,
  certificateId,
  organizationName = "Organization of Marine Science Professionals",
  description = "This certificate is proudly issued in recognition of participation, achievement, and professional commitment.",
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
      <div className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl border-[10px] border-slate-900 bg-[#f8f3e7] shadow-xl">
        <div className="absolute inset-5 border-2 border-amber-500/70" />
        <div className="absolute inset-8 border border-slate-800/30" />

        <div className="absolute left-0 top-0 h-40 w-40 rounded-br-full bg-slate-900" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-tl-full bg-slate-900" />

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
              <div className="rounded-lg bg-white p-2 shadow">
                <img
                  src={qrCodeUrl}
                  alt="Certificate QR Code"
                  className="h-20 w-20"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-300 bg-white text-[10px] text-slate-500">
                QR
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-between px-14 py-12 text-center">
          <div className="w-full">
            <div className={`mb-4 flex ${getLogoAlignment(logoPosition)}`}>
              <img
                src="/images/omsp-mark.png"
                alt="OMSP Logo"
                className="h-16 w-16 object-contain"
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-700">
              {organizationName}
            </p>

            <h1 className="mt-6 font-serif text-5xl font-bold uppercase tracking-wide text-slate-900">
              Certificate
            </h1>

            <p className="mt-2 text-lg font-medium text-amber-700">
              {certificateTitle}
            </p>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-600">
              Presented to
            </p>

            <h2 className="mt-4 border-b-2 border-amber-500 px-10 pb-3 font-serif text-5xl font-bold text-slate-900">
              {recipientName}
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-700">
              {description}
            </p>
          </div>

          <div className="grid w-full grid-cols-3 items-end gap-6">
            <div className="text-left text-xs text-slate-700">
              <p className="font-semibold">Certificate ID</p>
              <p>{certificateId}</p>

              <p className="mt-3 font-semibold">Issued</p>
              <p>{issueDate}</p>

              {expiryDate && (
                <>
                  <p className="mt-3 font-semibold">Valid Until</p>
                  <p>{expiryDate}</p>
                </>
              )}
            </div>

            <div className="text-center">
              <p
                className="text-5xl leading-none text-slate-900"
                style={getSignatureStyle(signatureStyle)}
              >
                {signatureText}
              </p>

              <div className="mx-auto mb-2 mt-1 h-px w-48 bg-slate-900" />

              <p className="text-xs uppercase tracking-widest text-slate-600">
                {signatureTitle}
              </p>
            </div>

            <div />
          </div>

          {verificationUrl && (
            <p className="absolute bottom-4 text-[10px] tracking-wide text-slate-500">
              Scan QR Code To Verify Authenticity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}