import { pdf } from "@react-pdf/renderer";
import CertificatePDFDocument from "@/components/certificates/templates/pdf/CertificatePDFDocument";

export type GenerateCertificatePDFInput = {
  recipientName: string;
  certificateTitle: string;
  certificateId: string;
  issueDate: string;
  organizationName?: string;
  description?: string;
  verificationUrl?: string;
  expiryDate?: string | null;
  qrCodeDataUrl?: string;
  templateId?: string | null;
  signatoryName?: string;
  signatoryTitle?: string;
  designOverrides?: Record<string, any> | null;
};

export async function generateCertificatePDFBlob(
  input: GenerateCertificatePDFInput
) {
  return pdf(<CertificatePDFDocument {...input} />).toBlob();
}

type BuildCertificatePDFInputParams = {
  recipientName: string;
  certificateTitle: string;
  certificateId: string;
  issueDate: string;
  expiryDate?: string | null;
  templateId?: string | null;
  designOverrides?: Record<string, any> | null;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
};

/**
 * Single place that turns certificate data into PDF input, shared by the create
 * route (POST /api/certificates) and the on-demand download route
 * (GET /api/certificates/[id]/pdf) so both always render the same document.
 */
export function buildCertificatePDFInput({
  signatoryName,
  signatoryTitle,
  designOverrides,
  templateId,
  ...rest
}: BuildCertificatePDFInputParams): GenerateCertificatePDFInput {
  const overrides = designOverrides || {};

  return {
    ...rest,
    organizationName: "Organization of Marine Science Professionals",
    description:
      overrides.description ||
      "This certificate is issued in recognition of participation, achievement, and professional commitment.",
    templateId: templateId || "classic-maritime",
    signatoryName:
      overrides.signatureText || signatoryName || "OMSP Administration",
    signatoryTitle:
      overrides.signatureTitle || signatoryTitle || "Authorized Signatory",
    designOverrides: overrides,
  };
}
