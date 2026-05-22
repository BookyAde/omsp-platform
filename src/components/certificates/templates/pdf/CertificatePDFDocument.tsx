import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

type CertificatePDFProps = {
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

const SITE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://www.omspglobal.org";

const OMSP_LOGO_URL = `${SITE_URL}/images/omsp-mark.png`;

Font.register({ family: "Signatie", src: `${SITE_URL}/fonts/Signatie.otf` });
Font.register({
  family: "AmsterdamHandwriting",
  src: `${SITE_URL}/fonts/AmsterdamHandwriting.ttf`,
});
Font.register({
  family: "BastligaOne",
  src: `${SITE_URL}/fonts/BastligaOne.ttf`,
});
Font.register({ family: "Cintarini", src: `${SITE_URL}/fonts/Cintarini.ttf` });
Font.register({
  family: "OceanTrace",
  src: `${SITE_URL}/fonts/OceanTrace.ttf`,
});

const styles = StyleSheet.create({
  pageClassic: {
    padding: 28,
    backgroundColor: "#f1f5f9",
    fontFamily: "Times-Roman",
  },
  pagePure: {
    padding: 28,
    backgroundColor: "#f8fafc",
    fontFamily: "Times-Roman",
  },
  pageOcean: {
    padding: 20,
    backgroundColor: "#020617",
    fontFamily: "Times-Roman",
  },
  pageExecutive: {
    padding: 20,
    backgroundColor: "#020202",
    fontFamily: "Times-Roman",
  },
  pageMembership: {
    padding: 26,
    backgroundColor: "#f1f5f9",
    fontFamily: "Times-Roman",
  },

  canvas: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  classicCanvas: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f8f3e7",
    border: "10px solid #0f172a",
    padding: 34,
  },
  classicInner: {
    height: "100%",
    border: "2px solid #d97706",
    padding: 28,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },

  pureCanvas: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: 34,
  },
  pureInner: {
    height: "100%",
    border: "1px solid #e5e7eb",
    padding: 34,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },

  oceanCanvas: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#021826",
    border: "8px solid #063349",
    padding: 26,
  },
  oceanInner: {
    height: "100%",
    border: "1.5px solid #22d3ee",
    padding: 30,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    backgroundColor: "#03263d",
  },

  executiveCanvas: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#111111",
    border: "8px solid #d6b25e",
    padding: 26,
  },
  executiveInner: {
    height: "100%",
    border: "1.5px solid #8f7938",
    padding: 30,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    backgroundColor: "#111111",
  },

  membershipCanvas: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "6px solid #164e63",
    display: "flex",
    flexDirection: "row",
  },
  membershipSidebar: {
    width: 82,
    backgroundColor: "#164e63",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 44,
  },
  membershipMain: {
    flex: 1,
    padding: 42,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    position: "relative",
    backgroundColor: "#f8fafc",
  },

  logo: {
    width: 58,
    height: 58,
    alignSelf: "center",
    marginBottom: 14,
  },
  logoRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    border: "1px solid #d6b25e",
    padding: 9,
    alignSelf: "center",
    marginBottom: 14,
  },
  logoInRing: {
    width: 58,
    height: 58,
  },
  watermark: {
    position: "absolute",
    width: 260,
    height: 260,
    top: 135,
    left: 260,
  },

  org: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 3.2,
    marginBottom: 26,
  },
  heading: {
    fontSize: 46,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    marginBottom: 58,
  },
  presented: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 20,
  },
  recipient: {
    fontSize: 42,
    marginBottom: 12,
  },
  recipientLine: {
    width: 300,
    height: 2,
    alignSelf: "center",
    marginBottom: 32,
  },
  description: {
    fontSize: 10,
    lineHeight: 1.7,
    marginHorizontal: 115,
    marginBottom: 30,
  },

  footer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  meta: {
    width: 170,
    textAlign: "left",
    fontSize: 9,
    lineHeight: 1.5,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    marginBottom: 8,
  },
  signature: {
    width: 210,
    textAlign: "center",
    alignItems: "center",
  },
  signatureTextBase: {
    lineHeight: 1,
    marginBottom: 3,
  },
  signatureLine: {
    width: 170,
    borderTop: "1px solid #0f172a",
    paddingTop: 7,
    marginTop: 4,
  },
  signatoryTitle: {
    fontSize: 7.5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  qrWrap: {
    width: 170,
    alignItems: "flex-end",
  },
  qrBox: {
    backgroundColor: "#ffffff",
    padding: 6,
    borderRadius: 6,
  },
  qr: {
    width: 72,
    height: 72,
  },
  qrPlaceholder: {
    width: 72,
    height: 72,
    border: "1px solid #cbd5e1",
    textAlign: "center",
    fontSize: 9,
    paddingTop: 30,
    color: "#64748b",
  },
  verify: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 7,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  membershipInfoGrid: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 18,
  },
  membershipInfoCard: {
    width: 145,
    border: "1px solid #dbeafe",
    backgroundColor: "#ffffff",
    padding: 10,
    marginHorizontal: 4,
    textAlign: "left",
  },
  membershipInfoLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#164e63",
    marginBottom: 4,
  },
  membershipInfoValue: {
    fontSize: 8,
    color: "#475569",
  },
});

function getSignatureFontStyle(style?: string) {
  if (style === "signatie" || style === "formal") {
    return { fontFamily: "Signatie", fontSize: 22 };
  }

  if (style === "amsterdam" || style === "elegant") {
    return { fontFamily: "AmsterdamHandwriting", fontSize: 24 };
  }

  if (style === "cintarini") {
    return { fontFamily: "Cintarini", fontSize: 22 };
  }

  if (style === "oceantrace") {
    return { fontFamily: "OceanTrace", fontSize: 22 };
  }

  return { fontFamily: "BastligaOne", fontSize: 22 };
}

function QrBlock({
  qrCodeDataUrl,
  color = "#64748b",
  borderColor = "#cbd5e1",
}: {
  qrCodeDataUrl?: string;
  color?: string;
  borderColor?: string;
}) {
  return (
    <View style={styles.qrWrap}>
      {qrCodeDataUrl ? (
        <View style={[styles.qrBox, { border: `1px solid ${borderColor}` }]}>
          <Image src={qrCodeDataUrl} style={styles.qr} />
        </View>
      ) : (
        <View style={[styles.qrPlaceholder, { color, borderColor }]}>
          <Text>QR</Text>
        </View>
      )}
    </View>
  );
}

function SignatureBlock({
  signatureText,
  signatureTitle,
  signatureStyle,
  color,
  lineColor,
  titleColor,
}: {
  signatureText: string;
  signatureTitle: string;
  signatureStyle: string;
  color: string;
  lineColor: string;
  titleColor: string;
}) {
  return (
    <View style={styles.signature}>
      <Text
        style={[
          styles.signatureTextBase,
          getSignatureFontStyle(signatureStyle),
          { color },
        ]}
      >
        {signatureText}
      </Text>

      <View style={[styles.signatureLine, { borderTop: `1px solid ${lineColor}` }]}>
        <Text style={[styles.signatoryTitle, { color: titleColor }]}>
          {signatureTitle}
        </Text>
      </View>
    </View>
  );
}

function Footer({
  certificateId,
  issueDate,
  qrCodeDataUrl,
  signatureText,
  signatureTitle,
  signatureStyle,
  labelColor,
  valueColor,
  signatureColor,
  signatureLineColor,
  signatureTitleColor,
  qrBorderColor,
  membership = false,
}: {
  certificateId: string;
  issueDate: string;
  qrCodeDataUrl?: string;
  signatureText: string;
  signatureTitle: string;
  signatureStyle: string;
  labelColor: string;
  valueColor: string;
  signatureColor: string;
  signatureLineColor: string;
  signatureTitleColor: string;
  qrBorderColor: string;
  membership?: boolean;
}) {
  return (
    <View style={styles.footer}>
      <View style={styles.meta}>
        <Text style={[styles.metaLabel, { color: labelColor }]}>
          {membership ? "Membership ID" : "Certificate ID"}
        </Text>
        <Text style={[styles.metaValue, { color: valueColor }]}>{certificateId}</Text>

        <Text style={[styles.metaLabel, { color: labelColor }]}>
          {membership ? "Issue Date" : "Date Issued"}
        </Text>
        <Text style={[styles.metaValue, { color: valueColor }]}>{issueDate}</Text>
      </View>

      <SignatureBlock
        signatureText={signatureText}
        signatureTitle={signatureTitle}
        signatureStyle={signatureStyle}
        color={signatureColor}
        lineColor={signatureLineColor}
        titleColor={signatureTitleColor}
      />

      <QrBlock qrCodeDataUrl={qrCodeDataUrl} borderColor={qrBorderColor} />
    </View>
  );
}

function ClassicMaritimePDF(props: RenderProps) {
  const d = props.finalDescription;

  return (
    <Page size="A4" orientation="landscape" style={styles.pageClassic}>
      <View style={styles.classicCanvas}>
        {props.showWatermark && (
          <Image
            src={OMSP_LOGO_URL}
            style={[styles.watermark, { opacity: props.watermarkOpacity }]}
          />
        )}

        <View style={styles.classicInner}>
          <Image src={OMSP_LOGO_URL} style={styles.logo} />

          <Text style={[styles.org, { color: "#334155" }]}>
            {props.organizationName}
          </Text>

          <Text style={[styles.heading, { color: "#0f172a" }]}>Certificate</Text>

          <Text style={[styles.title, { color: "#b45309" }]}>
            {props.certificateTitle}
          </Text>

          <Text style={[styles.presented, { color: "#475569" }]}>Presented to</Text>

          <Text style={[styles.recipient, { color: "#0f172a" }]}>
            {props.recipientName}
          </Text>

          <View style={[styles.recipientLine, { backgroundColor: "#d97706" }]} />

          <Text style={[styles.description, { color: "#334155" }]}>{d}</Text>

          <Footer
            certificateId={props.certificateId}
            issueDate={props.issueDate}
            qrCodeDataUrl={props.qrCodeDataUrl}
            signatureText={props.signatureText}
            signatureTitle={props.signatureTitle}
            signatureStyle={props.signatureStyle}
            labelColor="#0f172a"
            valueColor="#334155"
            signatureColor="#0f172a"
            signatureLineColor="#0f172a"
            signatureTitleColor="#475569"
            qrBorderColor="#cbd5e1"
          />

          {props.verificationUrl && (
            <Text style={[styles.verify, { color: "#64748b" }]}>
              Scan QR Code To Verify Authenticity
            </Text>
          )}
        </View>
      </View>
    </Page>
  );
}

function PureCleanPDF(props: RenderProps) {
  return (
    <Page size="A4" orientation="landscape" style={styles.pagePure}>
      <View style={styles.pureCanvas}>
        {props.showWatermark && (
          <Image
            src={OMSP_LOGO_URL}
            style={[
              styles.watermark,
              { opacity: props.watermarkOpacity, width: 250, height: 250 },
            ]}
          />
        )}

        <View style={styles.pureInner}>
          <Image src={OMSP_LOGO_URL} style={styles.logo} />

          <Text style={[styles.org, { color: "#64748b" }]}>
            {props.organizationName}
          </Text>

          <Text
            style={[
              styles.heading,
              { color: "#111827", textTransform: "none", fontSize: 42 },
            ]}
          >
            Certificate of Recognition
          </Text>

          <Text style={[styles.title, { color: "#64748b", marginBottom: 58 }]}>
            {props.certificateTitle}
          </Text>

          <Text style={[styles.presented, { color: "#94a3b8" }]}>Awarded to</Text>

          <Text style={[styles.recipient, { color: "#111827" }]}>
            {props.recipientName}
          </Text>

          <View style={[styles.recipientLine, { backgroundColor: "#cbd5e1" }]} />

          <Text style={[styles.description, { color: "#475569" }]}>
            {props.finalDescription}
          </Text>

          <Footer
            certificateId={props.certificateId}
            issueDate={props.issueDate}
            qrCodeDataUrl={props.qrCodeDataUrl}
            signatureText={props.signatureText}
            signatureTitle={props.signatureTitle}
            signatureStyle={props.signatureStyle}
            labelColor="#334155"
            valueColor="#64748b"
            signatureColor="#111827"
            signatureLineColor="#334155"
            signatureTitleColor="#64748b"
            qrBorderColor="#e2e8f0"
          />

          {props.verificationUrl && (
            <Text style={[styles.verify, { color: "#94a3b8" }]}>
              Scan QR Code To Verify Authenticity
            </Text>
          )}
        </View>
      </View>
    </Page>
  );
}

function OceanDepthPDF(props: RenderProps) {
  return (
    <Page size="A4" orientation="landscape" style={styles.pageOcean}>
      <View style={styles.oceanCanvas}>
        {props.showWatermark && (
          <Image
            src={OMSP_LOGO_URL}
            style={[
              styles.watermark,
              {
                opacity: props.watermarkOpacity,
                width: 270,
                height: 270,
                top: 126,
                left: 250,
              },
            ]}
          />
        )}

        <View style={styles.oceanInner}>
          <Image src={OMSP_LOGO_URL} style={[styles.logo, { width: 62, height: 62 }]} />

          <Text style={[styles.org, { color: "#bae6fd" }]}>
            {props.organizationName}
          </Text>

          <Text style={[styles.heading, { color: "#ffffff", fontSize: 50 }]}>
            Certificate
          </Text>

          <Text style={[styles.title, { color: "#a5f3fc", marginBottom: 62 }]}>
            {props.certificateTitle}
          </Text>

          <Text style={[styles.presented, { color: "#bae6fd" }]}>
            Proudly Presented To
          </Text>

          <Text style={[styles.recipient, { color: "#e0f2fe" }]}>
            {props.recipientName}
          </Text>

          <View style={[styles.recipientLine, { backgroundColor: "#67e8f9" }]} />

          <Text
            style={[
              styles.description,
              { color: "#e2e8f0", marginHorizontal: 130 },
            ]}
          >
            {props.finalDescription}
          </Text>

          <Footer
            certificateId={props.certificateId}
            issueDate={props.issueDate}
            qrCodeDataUrl={props.qrCodeDataUrl}
            signatureText={props.signatureText}
            signatureTitle={props.signatureTitle}
            signatureStyle={props.signatureStyle}
            labelColor="#bae6fd"
            valueColor="#cbd5e1"
            signatureColor="#ffffff"
            signatureLineColor="#bae6fd"
            signatureTitleColor="#bae6fd"
            qrBorderColor="#bae6fd"
          />

          {props.verificationUrl && (
            <Text style={[styles.verify, { color: "#bae6fd" }]}>
              Scan QR Code To Verify Authenticity
            </Text>
          )}
        </View>
      </View>
    </Page>
  );
}

function ExecutiveDistinctionPDF(props: RenderProps) {
  return (
    <Page size="A4" orientation="landscape" style={styles.pageExecutive}>
      <View style={styles.executiveCanvas}>
        {props.showWatermark && (
          <Image
            src={OMSP_LOGO_URL}
            style={[
              styles.watermark,
              {
                opacity: props.watermarkOpacity,
                width: 270,
                height: 270,
                top: 126,
                left: 250,
              },
            ]}
          />
        )}

        <View style={styles.executiveInner}>
          <View style={styles.logoRing}>
            <Image src={OMSP_LOGO_URL} style={styles.logoInRing} />
          </View>

          <Text style={[styles.org, { color: "#d6b25e" }]}>
            {props.organizationName}
          </Text>

          <Text
            style={[
              styles.heading,
              { color: "#ffffff", fontSize: 48, textTransform: "none" },
            ]}
          >
            Executive Distinction
          </Text>

          <Text style={[styles.title, { color: "#d6b25e", marginBottom: 62 }]}>
            {props.certificateTitle}
          </Text>

          <Text style={[styles.presented, { color: "#cbd5e1" }]}>
            Distinguished Recognition Awarded To
          </Text>

          <Text style={[styles.recipient, { color: "#f7e3a2" }]}>
            {props.recipientName}
          </Text>

          <View style={[styles.recipientLine, { backgroundColor: "#d6b25e" }]} />

          <Text
            style={[
              styles.description,
              { color: "#cbd5e1", marginHorizontal: 130 },
            ]}
          >
            {props.finalDescription}
          </Text>

          <Footer
            certificateId={props.certificateId}
            issueDate={props.issueDate}
            qrCodeDataUrl={props.qrCodeDataUrl}
            signatureText={props.signatureText}
            signatureTitle={props.signatureTitle}
            signatureStyle={props.signatureStyle}
            labelColor="#d6b25e"
            valueColor="#cbd5e1"
            signatureColor="#f7e3a2"
            signatureLineColor="#d6b25e"
            signatureTitleColor="#cbd5e1"
            qrBorderColor="#d6b25e"
          />

          {props.verificationUrl && (
            <Text style={[styles.verify, { color: "#cbd5e1" }]}>
              Scan QR Code To Verify Authenticity
            </Text>
          )}
        </View>
      </View>
    </Page>
  );
}

function OMSPMembershipPDF(props: RenderProps) {
  return (
    <Page size="A4" orientation="landscape" style={styles.pageMembership}>
      <View style={styles.membershipCanvas}>
        <View style={styles.membershipSidebar}>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            OMSP
          </Text>

          <Text
            style={{
              color: "#cffafe",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Verified
          </Text>
        </View>

        <View style={styles.membershipMain}>
          {props.showWatermark && (
            <Image
              src={OMSP_LOGO_URL}
              style={[
                styles.watermark,
                {
                  opacity: props.watermarkOpacity,
                  width: 250,
                  height: 250,
                  top: 125,
                  left: 230,
                },
              ]}
            />
          )}

          <Image src={OMSP_LOGO_URL} style={styles.logo} />

          <Text style={[styles.org, { color: "#0e7490" }]}>
            {props.organizationName}
          </Text>

          <Text
            style={[
              styles.heading,
              {
                color: "#164e63",
                fontSize: 44,
                textTransform: "none",
              },
            ]}
          >
            Membership Certificate
          </Text>

          <Text style={[styles.title, { color: "#64748b", marginBottom: 36 }]}>
            {props.certificateTitle}
          </Text>

          <Text style={[styles.presented, { color: "#64748b" }]}>
            This Certifies That
          </Text>

          <Text style={[styles.recipient, { color: "#020617" }]}>
            {props.recipientName}
          </Text>

          <View style={[styles.recipientLine, { backgroundColor: "#0e7490" }]} />

          <Text
            style={[
              styles.description,
              { color: "#475569", marginBottom: 12, marginHorizontal: 90 },
            ]}
          >
            {props.finalDescription}
          </Text>

          <View style={styles.membershipInfoGrid}>
            <View style={styles.membershipInfoCard}>
              <Text style={styles.membershipInfoLabel}>Member ID</Text>
              <Text style={styles.membershipInfoValue}>{props.certificateId}</Text>
            </View>

            <View style={styles.membershipInfoCard}>
              <Text style={styles.membershipInfoLabel}>Issue Date</Text>
              <Text style={styles.membershipInfoValue}>{props.issueDate}</Text>
            </View>

            <View style={styles.membershipInfoCard}>
              <Text style={styles.membershipInfoLabel}>Status</Text>
              <Text style={styles.membershipInfoValue}>Verified Member</Text>
            </View>
          </View>

          <Footer
            certificateId={props.certificateId}
            issueDate={props.issueDate}
            qrCodeDataUrl={props.qrCodeDataUrl}
            signatureText={props.signatureText}
            signatureTitle={props.signatureTitle}
            signatureStyle={props.signatureStyle}
            labelColor="#164e63"
            valueColor="#475569"
            signatureColor="#164e63"
            signatureLineColor="#164e63"
            signatureTitleColor="#64748b"
            qrBorderColor="#164e63"
            membership
          />

          {props.verificationUrl && (
            <Text style={[styles.verify, { color: "#94a3b8" }]}>
              Scan QR Code To Verify Membership Authenticity
            </Text>
          )}
        </View>
      </View>
    </Page>
  );
}

type RenderProps = {
  recipientName: string;
  certificateTitle: string;
  certificateId: string;
  issueDate: string;
  organizationName: string;
  finalDescription: string;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  signatureText: string;
  signatureTitle: string;
  signatureStyle: string;
  watermarkOpacity: number;
  showWatermark: boolean;
};

export default function CertificatePDFDocument({
  recipientName,
  certificateTitle,
  certificateId,
  issueDate,
  organizationName = "Organization of Marine Science Professionals",
  description = "This certificate is issued in recognition of participation, achievement, and professional commitment.",
  verificationUrl,
  qrCodeDataUrl,
  templateId,
  signatoryName = "OMSP Administration",
  signatoryTitle = "Authorized Signatory",
  designOverrides,
}: CertificatePDFProps) {
  const showWatermark = designOverrides?.showWatermark ?? true;
  const watermarkOpacity = designOverrides?.watermarkOpacity ?? 0.05;

  const signatureText =
    designOverrides?.signatureText || signatoryName || "OMSP Administration";

  const signatureTitle =
    designOverrides?.signatureTitle || signatoryTitle || "Authorized Signatory";

  const signatureStyle = designOverrides?.signatureStyle || "bastliga";

  const finalDescription = designOverrides?.description || description;

  const props: RenderProps = {
    recipientName,
    certificateTitle,
    certificateId,
    issueDate,
    organizationName,
    finalDescription,
    verificationUrl,
    qrCodeDataUrl,
    signatureText,
    signatureTitle,
    signatureStyle,
    watermarkOpacity,
    showWatermark,
  };

  switch (templateId) {
    case "pure-clean":
      return <Document><PureCleanPDF {...props} /></Document>;

    case "ocean-depth":
      return <Document><OceanDepthPDF {...props} /></Document>;

    case "executive-distinction":
      return <Document><ExecutiveDistinctionPDF {...props} /></Document>;

    case "omsp-membership":
      return <Document><OMSPMembershipPDF {...props} /></Document>;

    case "classic-maritime":
    default:
      return <Document><ClassicMaritimePDF {...props} /></Document>;
  }
}