import type { CertificateTemplateProps } from "../CertificatePreview";

export default function PureCleanCertificate({
  recipientName,
  certificateTitle,
  issueDate,
  certificateId,
  organizationName = "Organization of Marine Science Professionals",
  description = "This certificate is issued in recognition of successful participation, contribution, and professional commitment.",
  qrCodeUrl,
  verificationUrl,
  signatoryName = "Authorized Signatory",
  signatoryTitle = "OMSP Administration",
}: CertificateTemplateProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-2xl">
        
        {/* Frame borders */}
        <div className="absolute inset-5 rounded-lg border border-slate-200 pointer-events-none" />
        <div className="absolute inset-8 rounded-lg border border-slate-100 pointer-events-none" />

        {/* Corner accents */}
        <div className="absolute top-8 left-8 h-20 w-20 rounded-full border-2 border-slate-200/60 pointer-events-none" />
        <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border-2 border-slate-200/60 pointer-events-none" />

        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/30 pointer-events-none" />

        <div className="relative z-10 flex h-full flex-col px-14 py-12 text-center">
          
          {/* Header section */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              {organizationName}
            </p>

            <h1 className="mt-5 font-serif text-4xl font-bold text-slate-900">
              Certificate of Recognition
            </h1>

            <div className="mx-auto mt-3 h-px w-56 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            <p className="mt-3 text-sm font-medium text-slate-600">
              {certificateTitle}
            </p>
          </div>

          {/* Recipient section - centered and expanded */}
          <div className="mb-8 flex-grow flex flex-col justify-center max-w-3xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-3">
              In recognition and appreciation of the service rendered to
            </p>

            <h2 className="font-serif text-5xl font-bold text-slate-900 mb-4">
              {recipientName}
            </h2>

            <div className="mx-auto h-px w-80 bg-slate-300 mb-5" />

            <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>

          {/* Bottom section: Details, signature, QR */}
          <div className="grid w-full grid-cols-3 gap-6 items-end pt-6 border-t border-slate-200">
            
            {/* Left: Certificate details */}
            <div className="text-left">
              <div className="text-xs text-slate-600 space-y-3">
                <div>
                  <p className="font-semibold text-slate-700 text-[10px] uppercase tracking-wide mb-1">
                    Certificate ID
                  </p>
                  <p className="font-mono text-slate-500">{certificateId}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 text-[10px] uppercase tracking-wide mb-1">
                    Date Issued
                  </p>
                  <p className="text-slate-500">{issueDate}</p>
                </div>
              </div>
            </div>

            {/* Center: Signature */}
            <div className="flex flex-col items-center">
              <div className="mb-1 h-px w-40 bg-slate-700" />
              
              <p className="font-serif text-2xl font-semibold text-slate-900 mt-1 mb-2">
                {signatoryName}
              </p>

              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                {signatoryTitle}
              </p>
            </div>

            {/* Right: QR Code */}
            <div className="flex justify-end">
              {qrCodeUrl ? (
                <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-2 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="Certificate QR Code"
                    className="h-22 w-22"
                  />
                </div>
              ) : (
                <div className="flex h-22 w-22 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-50 text-xs font-semibold text-slate-400">
                  QR Code
                </div>
              )}
            </div>
          </div>

          {/* Verification text */}
          {verificationUrl && (
            <p className="mt-3 text-[9px] uppercase tracking-wider text-slate-400">
              Scan QR code to verify authenticity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}