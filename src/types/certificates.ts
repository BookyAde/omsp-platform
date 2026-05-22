export type CertificateTemplateId =
  | "classic-maritime"
  | "pure-clean"
  | "ocean-depth"
  | "executive-distinction"
  | "omsp-membership";

export type CertificateStatus = "valid" | "revoked" | "expired";

export type CertificateDesignOverrides = {
  primaryColor?: string;
  accentColor?: string;
  backgroundStyle?: "plain" | "wave" | "gradient";
  borderStyle?: "classic" | "minimal" | "none";
  sealStyle?: "none" | "watermark" | "gold";
  qrPlacement?: "bottom-right" | "bottom-left" | "center-footer";
};

export type CertificateTemplateMeta = {
  id: CertificateTemplateId;
  name: string;
  description: string;
  bestFor: string;
  orientation: "portrait" | "landscape";
};

export type CertificatePreviewData = {
  certificateId: string;
  certificateTitle: string;
  recipientName: string;
  recipientEmail?: string;
  programmeTitle?: string;
  certificateType?: string;
  issueDate: string;
  status: CertificateStatus;
  verificationUrl: string;
  qrCodeDataUrl?: string;
  templateId: CertificateTemplateId;
  designOverrides?: CertificateDesignOverrides;
};