import ClassicMaritimeCertificate from "./templates/preview/ClassicMaritimeCertificate";
import PureCleanCertificate from "./templates/preview/PureCleanCertificate";
import OceanDepthCertificate from "./templates/preview/OceanDepthCertificate";
import ExecutiveDistinctionCertificate from "./templates/preview/ExecutiveDistinctionCertificate";
import OMSPMembershipCertificate from "./templates/preview/OMSPMembershipCertificate";

export type CertificateDesignOverrides = {
  logoPosition?: "top-left" | "top-center" | "top-right";
  qrPosition?:
    | "bottom-left"
    | "bottom-right"
    | "top-left"
    | "top-right"
    | "hidden";
  showWatermark?: boolean;
  watermarkOpacity?: number;
  signatureText?: string;
  signatureTitle?: string;
  signatureStyle?: "elegant" | "formal" | "executive" | string;
};

export type CertificateTemplateProps = {
  recipientName: string;
  certificateTitle: string;
  issueDate: string;
  certificateId: string;
  organizationName?: string;
  description?: string;
  qrCodeUrl?: string;
  verificationUrl?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  designOverrides?: CertificateDesignOverrides;
};

type CertificatePreviewProps = CertificateTemplateProps & {
  templateId?: string | null;
};

export default function CertificatePreview({
  templateId,
  ...props
}: CertificatePreviewProps) {
  switch (templateId) {
    case "pure-clean":
      return <PureCleanCertificate {...props} />;

    case "ocean-depth":
      return <OceanDepthCertificate {...props} />;

    case "executive-distinction":
      return <ExecutiveDistinctionCertificate {...props} />;

    case "omsp-membership":
      return <OMSPMembershipCertificate {...props} />;

    case "classic-maritime":
    default:
      return <ClassicMaritimeCertificate {...props} />;
  }
}