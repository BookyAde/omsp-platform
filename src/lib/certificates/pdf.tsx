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