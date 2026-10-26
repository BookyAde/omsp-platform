import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from "@react-pdf/renderer";
import { getPdfLogoSrc, registerPdfFonts } from "@/lib/certificates/pdf-assets";

/**
 * PDF twins of the five preview templates in ../preview.
 *
 * Sizing: the preview card renders at most 1024 CSS px wide (max-w-5xl) at an
 * A4-landscape ratio. Every measurement below is written in those preview
 * pixels and converted with px() to PDF points, so a Tailwind value in the
 * preview (e.g. text-5xl = 48px, p-2 = 8px) can be copied across unchanged
 * and the page proportions stay identical. Pages are full-bleed and never wrap.
 */

type CertificatePDFProps = {
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

type RenderProps = {
  recipientName: string;
  certificateTitle: string;
  certificateId: string;
  issueDate: string;
  expiryDate?: string | null;
  organizationName: string;
  finalDescription: string;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  signatureText: string;
  signatureTitle: string;
  signatureStyle: string;
  watermarkOpacity?: number;
  showWatermark: boolean;
  logoPosition: string;
  qrPosition: string;
};

type S = Record<string, any>;

registerPdfFonts();

// ─── Units & helpers ─────────────────────────────────────────────────────────

const PAGE_W = 841.89;
const PAGE_H = 595.28;
const PREVIEW_W = 1024;
const PX = PAGE_W / PREVIEW_W;
const px = (n: number) => Math.round(n * PX * 100) / 100;

const SANS = "DMSans";
const SERIF = "Times-Bold";
const WHITE = "#ffffff";

function hexToRgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/** Pre-blends `fg` at `alpha` over `bg` (react-pdf has no reliable rgba()). */
function mix(fg: string, bg: string, alpha: number) {
  const f = hexToRgb(fg);
  const b = hexToRgb(bg);
  return (
    "#" +
    f
      .map((c, i) =>
        Math.round(c * alpha + b[i] * (1 - alpha))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

type TextOpts = {
  weight?: number;
  tracking?: number; // em
  upper?: boolean;
  lh?: number; // unitless multiplier
  serif?: boolean;
  align?: "left" | "center" | "right";
};

function text(size: number, color: string, o: TextOpts = {}): S {
  return {
    fontFamily: o.serif ? SERIF : SANS,
    ...(o.serif ? {} : { fontWeight: o.weight ?? 400 }),
    fontSize: px(size),
    color,
    letterSpacing: px(size) * (o.tracking ?? 0),
    textTransform: o.upper ? "uppercase" : "none",
    lineHeight: o.lh ?? 1.5,
    textAlign: o.align ?? "center",
  };
}

// Tailwind line-height shortcuts (line height / font size).
const LH_XS = 16 / 12;
const LH_SM = 20 / 14;
const LH_7 = 28 / 16;

function getSignatureFontStyle(style: string | undefined, large = false): S {
  const [signatie, amsterdam, cintarini, oceantrace, fallback] = large
    ? [28, 30, 28, 28, 26]
    : [22, 24, 22, 22, 20];

  if (style === "signatie" || style === "formal") {
    return { fontFamily: "Signatie", fontSize: px(signatie) };
  }
  if (style === "amsterdam" || style === "elegant") {
    return { fontFamily: "AmsterdamHandwriting", fontSize: px(amsterdam) };
  }
  if (style === "cintarini") {
    return { fontFamily: "Cintarini", fontSize: px(cintarini) };
  }
  if (style === "oceantrace") {
    return { fontFamily: "OceanTrace", fontSize: px(oceantrace) };
  }
  return { fontFamily: "BastligaOne", fontSize: px(fallback) };
}

const justifyFor = (position: string) =>
  position === "top-left"
    ? "flex-start"
    : position === "top-right"
    ? "flex-end"
    : "center";

const fill: S = {
  position: "absolute",
  top: 0,
  left: 0,
  width: PAGE_W,
  height: PAGE_H,
};

// ─── Building blocks ─────────────────────────────────────────────────────────

/** Bordered rectangle inset `inset` preview-px from the page edge. */
function Frame({
  inset,
  width = 1,
  color,
  radius = 0,
}: {
  inset: number;
  width?: number;
  color: string;
  radius?: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        top: px(inset),
        left: px(inset),
        width: PAGE_W - 2 * px(inset),
        height: PAGE_H - 2 * px(inset),
        borderWidth: px(width),
        borderColor: color,
        borderStyle: "solid",
        borderRadius: px(radius),
      }}
    />
  );
}

function Gradient({
  id,
  left = 0,
  top = 0,
  width = PAGE_W,
  height = PAGE_H,
  x2,
  y2,
  stops,
}: {
  id: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  x2: number;
  y2: number;
  stops: [number, string][];
}) {
  return (
    <Svg
      style={{ position: "absolute", left, top, width, height }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2={String(x2)} y2={String(y2)}>
          {stops.map(([offset, color]) => (
            <Stop key={offset} offset={`${offset * 100}%`} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}

function Watermark({ opacity }: { opacity: number }) {
  return (
    <View style={{ ...fill, alignItems: "center", justifyContent: "center" }}>
      <Image
        src={getPdfLogoSrc()}
        style={{
          width: px(288),
          height: px(288),
          objectFit: "contain",
          opacity,
        }}
      />
    </View>
  );
}

function LogoRow({
  position,
  size,
  marginBottom,
}: {
  position: string;
  size: number;
  marginBottom: number;
}) {
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: justifyFor(position),
        marginBottom: px(marginBottom),
      }}
    >
      <Image
        src={getPdfLogoSrc()}
        style={{ width: px(size), height: px(size), objectFit: "contain" }}
      />
    </View>
  );
}

type QrStyle = {
  pad?: number;
  radius?: number;
  borderColor?: string;
  placeholderColor: string;
  placeholderBg: string;
};

function QrBox({ dataUrl, style }: { dataUrl?: string; style: QrStyle }) {
  const pad = style.pad ?? 8;
  const radius = style.radius ?? 8;
  const border: S = style.borderColor
    ? { borderWidth: px(1), borderColor: style.borderColor, borderStyle: "solid" }
    : {};

  if (dataUrl) {
    return (
      <View
        style={{
          backgroundColor: WHITE,
          padding: px(pad),
          borderRadius: px(radius),
          ...border,
        }}
      >
        <Image src={dataUrl} style={{ width: px(80), height: px(80) }} />
      </View>
    );
  }

  return (
    <View
      style={{
        width: px(80),
        height: px(80),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: px(radius),
        backgroundColor: style.placeholderBg,
        borderWidth: px(1),
        borderColor: style.borderColor ?? style.placeholderColor,
        borderStyle: "solid",
      }}
    >
      <Text style={text(10, style.placeholderColor)}>QR</Text>
    </View>
  );
}

/** QR code pinned to a corner of the card, like the preview's getQrPosition(). */
function CornerQr({
  position,
  offset,
  dataUrl,
  style,
}: {
  position: string;
  offset: number;
  dataUrl?: string;
  style: QrStyle;
}) {
  if (position === "hidden") return null;

  const o = px(offset);
  const place: S =
    position === "top-left"
      ? { top: o, left: o }
      : position === "top-right"
      ? { top: o, right: o }
      : position === "bottom-left"
      ? { bottom: o, left: o }
      : { bottom: o, right: o };

  return (
    <View style={{ position: "absolute", ...place }}>
      <QrBox dataUrl={dataUrl} style={style} />
    </View>
  );
}

/** Absolute layer covering the card's padding box (inside the border). */
function layer(border: number): S {
  return {
    position: "absolute",
    top: px(border),
    left: px(border),
    width: PAGE_W - 2 * px(border),
    height: PAGE_H - 2 * px(border),
  };
}

function MetaList({
  items,
  labelStyle,
  valueStyle,
  gap,
  valueGap = 0,
}: {
  items: [string, string][];
  labelStyle: S;
  valueStyle: S;
  gap: number;
  valueGap?: number;
}) {
  return (
    <View>
      {items.map(([label, value], i) => (
        <View key={label} style={{ marginTop: i === 0 ? 0 : px(gap) }}>
          <Text style={labelStyle}>{label}</Text>
          <Text style={{ ...valueStyle, marginTop: px(valueGap) }}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function Signature({
  text: signature,
  title,
  fontStyle,
  color,
  lineColor,
  lineW,
  lineMt,
  lineMb,
  titleStyle,
  width,
}: {
  text: string;
  title: string;
  fontStyle: S;
  color: string;
  lineColor: string;
  lineW: number;
  lineMt: number;
  lineMb: number;
  titleStyle: S;
  width: number;
}) {
  return (
    <View style={{ width: px(width), alignItems: "center" }}>
      <Text style={{ ...fontStyle, color, lineHeight: 1, textAlign: "center" }}>
        {signature}
      </Text>
      <View
        style={{
          width: px(lineW),
          height: px(1),
          backgroundColor: lineColor,
          marginTop: px(lineMt),
          marginBottom: px(lineMb),
        }}
      />
      <Text style={titleStyle}>{title}</Text>
    </View>
  );
}

// ─── Shared layout: Classic Maritime / Pure Clean / Ocean Depth ──────────────
// These three previews share one structure: header, recipient block and a
// three-column footer spread over the card with justify-between.

type StandardTheme = {
  border: number;
  padX: number;
  padY: number;
  lift: number; // footer translate-y (px, upward)
  org: { color: string; tracking: number };
  title: { color: string; upper: boolean; tracking: number };
  presented: { label: string; color: string; tracking: number };
  recipient: {
    color: string;
    mt: number;
    underline?: { color: string };
    rule?: { width: number; color: string };
  };
  desc: { color: string; maxHeight?: number };
  issuedLabel: string;
  meta: { label: string; value: string };
  sig: { color: string; line: string; lineW: number; title: string; titleTracking: number };
  verify: string;
};

function StandardContent({ p, t, title }: { p: RenderProps; t: StandardTheme; title: string }) {
  const contentW = PREVIEW_W - 2 * t.border - 2 * t.padX;
  const colW = (contentW - 48) / 3;

  const metaItems: [string, string][] = [
    ["Certificate ID", p.certificateId],
    [t.issuedLabel, p.issueDate],
  ];
  if (p.expiryDate) metaItems.push(["Valid Until", p.expiryDate]);

  return (
    <>
      <View
        style={{
          ...layer(t.border),
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: px(t.padX),
          paddingVertical: px(t.padY),
        }}
      >
        <View style={{ width: "100%", alignItems: "center" }}>
          <LogoRow position={p.logoPosition} size={64} marginBottom={16} />
          <Text
            style={text(12, t.org.color, {
              weight: 600,
              tracking: t.org.tracking,
              upper: true,
              lh: LH_XS,
            })}
          >
            {p.organizationName}
          </Text>
          <Text
            style={{
              ...text(48, t.title.color, {
                serif: true,
                tracking: t.title.tracking,
                upper: t.title.upper,
                lh: 1,
              }),
              marginTop: px(24),
            }}
          >
            {title}
          </Text>
        </View>

        <View style={{ width: px(672), alignItems: "center" }}>
          <Text
            style={text(14, t.presented.color, {
              tracking: t.presented.tracking,
              upper: true,
              lh: LH_SM,
            })}
          >
            {t.presented.label}
          </Text>

          <View
            style={{
              width: "100%",
              alignItems: "center",
              marginTop: px(t.recipient.mt),
              ...(t.recipient.underline
                ? {
                    borderBottomWidth: px(2),
                    borderBottomColor: t.recipient.underline.color,
                    borderBottomStyle: "solid",
                    paddingHorizontal: px(40),
                    paddingBottom: px(12),
                  }
                : {}),
            }}
          >
            <Text style={text(48, t.recipient.color, { serif: true, tracking: -0.025, lh: 1 })}>
              {p.recipientName}
            </Text>
          </View>

          {t.recipient.rule && (
            <View
              style={{
                width: px(t.recipient.rule.width),
                height: px(1),
                backgroundColor: t.recipient.rule.color,
                marginTop: px(16),
              }}
            />
          )}

          <Text
            style={{
              ...text(16, t.desc.color, { lh: LH_7 }),
              width: "100%",
              marginTop: px(24),
              ...(t.desc.maxHeight
                ? { maxHeight: px(t.desc.maxHeight), overflow: "hidden" }
                : {}),
            }}
          >
            {p.finalDescription}
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            position: "relative",
            top: -px(t.lift),
          }}
        >
          <View style={{ width: px(colW) }}>
            <MetaList
              items={metaItems}
              labelStyle={text(12, t.meta.label, { weight: 600, lh: LH_XS, align: "left" })}
              valueStyle={text(12, t.meta.value, { lh: LH_XS, align: "left" })}
              gap={12}
            />
          </View>

          <Signature
            text={p.signatureText}
            title={p.signatureTitle}
            fontStyle={getSignatureFontStyle(p.signatureStyle)}
            color={t.sig.color}
            lineColor={t.sig.line}
            lineW={t.sig.lineW}
            lineMt={4}
            lineMb={8}
            titleStyle={text(12, t.sig.title, {
              tracking: t.sig.titleTracking,
              upper: true,
              lh: LH_XS,
            })}
            width={colW}
          />

          <View style={{ width: px(colW) }} />
        </View>
      </View>

      {p.verificationUrl && (
        <Text
          style={{
            position: "absolute",
            bottom: px(t.border + 16),
            left: 0,
            right: 0,
            ...text(10, t.verify, { tracking: 0.025 }),
          }}
        >
          Scan QR Code To Verify Authenticity
        </Text>
      )}
    </>
  );
}

// ─── Classic Maritime ────────────────────────────────────────────────────────

function ClassicMaritimePDF(p: RenderProps) {
  const B = 10;
  const BG = "#f8f3e7";
  const NAVY = "#0f172a";

  const title = p.certificateTitle?.trim() || "Certificate of Excellence";

  return (
    <Page size="A4" orientation="landscape" wrap={false} style={{ backgroundColor: BG }}>
      <Frame inset={0} width={B} color={NAVY} />
      <Frame inset={B + 20} width={2} color={mix("#f59e0b", BG, 0.7)} />
      <Frame inset={B + 32} width={1} color={mix("#1e293b", BG, 0.3)} />

      <View
        style={{
          position: "absolute",
          top: px(B),
          left: px(B),
          width: px(160),
          height: px(160),
          backgroundColor: NAVY,
          borderBottomRightRadius: px(160),
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: px(B),
          right: px(B),
          width: px(160),
          height: px(160),
          backgroundColor: NAVY,
          borderTopLeftRadius: px(160),
        }}
      />

      {p.showWatermark && <Watermark opacity={p.watermarkOpacity ?? 0.05} />}

      <CornerQr
        position={p.qrPosition}
        offset={B + 40}
        dataUrl={p.qrCodeDataUrl}
        style={{ placeholderColor: "#64748b", placeholderBg: WHITE, borderColor: "#cbd5e1" }}
      />

      <StandardContent
        p={p}
        title={title}
        t={{
          border: B,
          padX: 56,
          padY: 48,
          lift: 24,
          org: { color: "#334155", tracking: 0.35 },
          title: { color: "#0f172a", upper: true, tracking: 0.025 },
          presented: { label: "Presented to", color: "#475569", tracking: 0.25 },
          recipient: { color: "#0f172a", mt: 16, underline: { color: "#f59e0b" } },
          desc: { color: "#334155" },
          issuedLabel: "Issued",
          meta: { label: "#334155", value: "#334155" },
          sig: { color: "#0f172a", line: "#0f172a", lineW: 192, title: "#475569", titleTracking: 0.1 },
          verify: "#64748b",
        }}
      />
    </Page>
  );
}

// ─── Pure Clean ──────────────────────────────────────────────────────────────

function PureCleanPDF(p: RenderProps) {
  const B = 1;
  const SLATE_200 = "#e2e8f0";

  const title = p.certificateTitle?.trim() || "Certificate of Recognition";

  return (
    <Page size="A4" orientation="landscape" wrap={false} style={{ backgroundColor: WHITE }}>
      <Frame inset={0} width={B} color={SLATE_200} />
      <Frame inset={B + 24} width={1} color={SLATE_200} radius={8} />

      <View
        style={{
          position: "absolute",
          top: px(B + 40),
          left: px(B + 40),
          width: px(96),
          height: px(96),
          borderRadius: px(48),
          borderWidth: px(1),
          borderColor: SLATE_200,
          borderStyle: "solid",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: px(B + 40),
          right: px(B + 40),
          width: px(96),
          height: px(96),
          borderRadius: px(48),
          borderWidth: px(1),
          borderColor: SLATE_200,
          borderStyle: "solid",
        }}
      />

      {p.showWatermark && <Watermark opacity={p.watermarkOpacity ?? 0.04} />}

      <CornerQr
        position={p.qrPosition}
        offset={B + 40}
        dataUrl={p.qrCodeDataUrl}
        style={{
          radius: 6,
          borderColor: SLATE_200,
          placeholderColor: "#94a3b8",
          placeholderBg: WHITE,
        }}
      />

      <StandardContent
        p={p}
        title={title}
        t={{
          border: B,
          padX: 64,
          padY: 56,
          lift: 0,
          org: { color: "#64748b", tracking: 0.32 },
          title: { color: "#0f172a", upper: false, tracking: -0.025 },
          presented: { label: "Awarded to", color: "#94a3b8", tracking: 0.22 },
          recipient: { color: "#0f172a", mt: 20, rule: { width: 288, color: "#cbd5e1" } },
          desc: { color: "#475569", maxHeight: 80 },
          issuedLabel: "Date Issued",
          meta: { label: "#334155", value: "#64748b" },
          sig: { color: "#0f172a", line: "#334155", lineW: 176, title: "#94a3b8", titleTracking: 0.1 },
          verify: "#94a3b8",
        }}
      />
    </Page>
  );
}

// ─── Ocean Depth ─────────────────────────────────────────────────────────────

function OceanDepthPDF(p: RenderProps) {
  const B = 0;
  const BG = "#032235"; // midpoint of the preview's #021826 → #032c44 → #021018 gradient

  const title = p.certificateTitle?.trim() || "Certificate of Excellence";

  return (
    <Page size="A4" orientation="landscape" wrap={false} style={{ backgroundColor: BG }}>
      <Gradient
        id="ocean-bg"
        x2={1}
        y2={1}
        stops={[
          [0, "#021826"],
          [0.5, "#032c44"],
          [1, "#021018"],
        ]}
      />
      <Frame inset={20} width={1} color={mix("#22d3ee", BG, 0.4)} radius={8} />
      <Frame inset={32} width={1} color={mix(WHITE, BG, 0.1)} radius={8} />

      {p.showWatermark && <Watermark opacity={p.watermarkOpacity ?? 0.06} />}

      <CornerQr
        position={p.qrPosition}
        offset={B + 40}
        dataUrl={p.qrCodeDataUrl}
        style={{
          borderColor: undefined,
          placeholderColor: "#cffafe",
          placeholderBg: mix(WHITE, BG, 0.1),
        }}
      />

      <StandardContent
        p={p}
        title={title}
        t={{
          border: B,
          padX: 56,
          padY: 48,
          lift: 24,
          org: { color: "#a5f3fc", tracking: 0.35 },
          title: { color: WHITE, upper: true, tracking: 0.025 },
          presented: {
            label: "Proudly Presented To",
            color: mix("#cffafe", BG, 0.7),
            tracking: 0.25,
          },
          recipient: {
            color: "#e0f2fe", // the preview's cyan-200 → white → cyan-200 text gradient
            mt: 20,
            rule: { width: 320, color: mix("#67e8f9", BG, 0.4) },
          },
          desc: { color: "#e2e8f0" },
          issuedLabel: "Date Issued",
          meta: { label: "#a5f3fc", value: "#cbd5e1" },
          sig: {
            color: WHITE,
            line: mix("#a5f3fc", BG, 0.5),
            lineW: 192,
            title: mix("#cffafe", BG, 0.7),
            titleTracking: 0.25,
          },
          verify: mix("#cffafe", BG, 0.6),
        }}
      />
    </Page>
  );
}

// ─── Executive Distinction ───────────────────────────────────────────────────

function ExecutiveDistinctionPDF(p: RenderProps) {
  const B = 6;
  const BG = "#0a0a0a";
  const GOLD = "#d6b25e";
  const GOLD_FRAME = "#c9a44d";
  const GOLD_LIGHT = "#f7e3a2";
  const SLATE_300 = "#cbd5e1";

  const PAD_X = 56;
  const GAP = 16;
  const colW = (PREVIEW_W - 2 * B - 2 * PAD_X - 2 * GAP) / 3;

  const title = p.certificateTitle?.trim() || "Executive Distinction";

  const metaItems: [string, string][] = [
    ["Certificate ID", p.certificateId],
    ["Date Issued", p.issueDate],
  ];
  if (p.expiryDate) metaItems.push(["Valid Until", p.expiryDate]);

  return (
    <Page size="A4" orientation="landscape" wrap={false} style={{ backgroundColor: BG }}>
      <Frame inset={0} width={B} color={GOLD_FRAME} />
      <Frame inset={B + 16} width={1} color={mix(GOLD_FRAME, BG, 0.6)} radius={2} />
      <Frame inset={B + 28} width={1} color={mix(WHITE, BG, 0.08)} radius={2} />

      {p.showWatermark && <Watermark opacity={p.watermarkOpacity ?? 0.025} />}

      <View
        style={{
          ...layer(B),
          flexDirection: "column",
          alignItems: "center",
          paddingHorizontal: px(PAD_X),
          paddingVertical: px(40),
        }}
      >
        {/* Header: logo + organization */}
        <View style={{ width: "100%", alignItems: "center", marginBottom: px(16) }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: justifyFor(p.logoPosition),
              marginBottom: px(8),
            }}
          >
            <View
              style={{
                padding: px(10),
                borderRadius: px(999),
                borderWidth: px(1),
                borderColor: mix(GOLD_FRAME, BG, 0.6),
                borderStyle: "solid",
                backgroundColor: mix("#000000", BG, 0.3),
              }}
            >
              <Image
                src={getPdfLogoSrc()}
                style={{ width: px(48), height: px(48), objectFit: "contain" }}
              />
            </View>
          </View>
          <Text style={text(10, GOLD, { weight: 600, tracking: 0.35, upper: true })}>
            {p.organizationName}
          </Text>
        </View>

        {/* Title */}
        <View style={{ width: "100%", alignItems: "center", marginBottom: px(24) }}>
          <Text style={text(48, WHITE, { serif: true, tracking: 0.025, upper: true, lh: 1 })}>
            {title}
          </Text>
        </View>

        {/* Recipient */}
        <View
          style={{
            width: px(672),
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: px(24),
          }}
        >
          <Text style={text(10, mix(WHITE, BG, 0.5), { tracking: 0.3, upper: true })}>
            Distinguished Recognition Awarded To
          </Text>
          <Text
            style={{
              ...text(36, GOLD_LIGHT, { serif: true, lh: 40 / 36 }),
              marginTop: px(8),
            }}
          >
            {p.recipientName}
          </Text>
          <View
            style={{
              width: px(320),
              height: px(1),
              backgroundColor: mix(GOLD, BG, 0.7),
              marginTop: px(12),
            }}
          />
          <Text
            style={{
              ...text(12, SLATE_300, { lh: 20 / 12 }),
              width: "100%",
              marginTop: px(16),
            }}
          >
            {p.finalDescription}
          </Text>
        </View>

        {/* Footer: details / signature / QR */}
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTopWidth: px(1),
            borderTopColor: mix(GOLD, BG, 0.3),
            borderTopStyle: "solid",
            paddingTop: px(16),
          }}
        >
          <View style={{ width: px(colW) }}>
            <MetaList
              items={metaItems}
              labelStyle={text(9, GOLD, { weight: 600, upper: true, align: "left" })}
              valueStyle={text(10, SLATE_300, { align: "left" })}
              gap={10}
              valueGap={2}
            />
          </View>

          <Signature
            text={p.signatureText}
            title={p.signatureTitle}
            fontStyle={getSignatureFontStyle(p.signatureStyle, true)}
            color={GOLD_LIGHT}
            lineColor={GOLD}
            lineW={176}
            lineMt={4}
            lineMb={4}
            titleStyle={text(9, mix(WHITE, BG, 0.6), { tracking: 0.25, upper: true })}
            width={colW}
          />

          <View style={{ width: px(colW), alignItems: "flex-end" }}>
            {p.qrPosition !== "hidden" && (
              <QrBox
                dataUrl={p.qrCodeDataUrl}
                style={{
                  pad: 6,
                  borderColor: mix(GOLD, BG, 0.5),
                  placeholderColor: GOLD,
                  placeholderBg: mix(WHITE, BG, 0.1),
                }}
              />
            )}
          </View>
        </View>

        {p.verificationUrl && (
          <Text
            style={{
              ...text(8, mix(WHITE, BG, 0.4), { tracking: 0.025, upper: true }),
              width: "100%",
              marginTop: px(8),
            }}
          >
            Scan QR Code To Verify Authenticity
          </Text>
        )}
      </View>
    </Page>
  );
}

// ─── OMSP Membership ─────────────────────────────────────────────────────────

function OMSPMembershipPDF(p: RenderProps) {
  const B = 6;
  const SIDEBAR = 96;
  const CYAN_950 = "#083344";
  const CYAN_900 = "#164e63";
  const CYAN_800 = "#155e75";
  const BG = "#f4fafd"; // midpoint of the preview's white → cyan-50 → slate-100 gradient

  const title = p.certificateTitle?.trim() || "Membership Certificate";
  const innerH = PAGE_H - 2 * px(B);

  const cards: [string, string][] = [
    ["Member ID", p.certificateId],
    ["Issue Date", p.issueDate],
  ];
  if (p.expiryDate) cards.push(["Valid Until", p.expiryDate]);
  cards.push(["Status", p.expiryDate ? "Verified Active Member" : "Verified Member"]);

  const gridW = 768;
  const cardGap = 12;
  const cardW = (gridW - cardGap * (cards.length - 1)) / cards.length;

  const mainW = PREVIEW_W - 2 * B - SIDEBAR;
  const footColW = (mainW - 2 * 48 - 48) / 3;

  // Rotated sidebar label, centred on (cx, cy) in layer coordinates.
  const sideLabel = (label: string, cy: number, size: number, tracking: number, color: string, weight: number) => (
    <View
      style={{
        position: "absolute",
        left: px(SIDEBAR / 2) - px(100),
        top: px(cy) - px(10),
        width: px(200),
        height: px(20),
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(-90deg)",
        transformOrigin: "50% 50%",
      }}
    >
      <Text style={text(size, color, { weight, tracking, upper: true })}>{label}</Text>
    </View>
  );

  return (
    <Page size="A4" orientation="landscape" wrap={false} style={{ backgroundColor: WHITE }}>
      <Gradient
        id="membership-bg"
        x2={1}
        y2={1}
        stops={[
          [0, WHITE],
          [0.5, "#ecfeff"],
          [1, "#f1f5f9"],
        ]}
      />
      <Frame inset={0} width={B} color={CYAN_950} />

      <Gradient
        id="membership-sidebar"
        left={px(B)}
        top={px(B)}
        width={px(SIDEBAR)}
        height={innerH}
        x2={0}
        y2={1}
        stops={[
          [0, CYAN_950],
          [0.5, CYAN_800],
          [1, "#0f766e"],
        ]}
      />
      <View
        style={{
          position: "absolute",
          top: px(B),
          left: px(B + SIDEBAR),
          width: px(1),
          height: innerH,
          backgroundColor: mix(CYAN_900, BG, 0.2),
        }}
      />
      <View
        style={{
          position: "absolute",
          top: px(B),
          right: px(B),
          width: px(32),
          height: innerH,
          backgroundColor: CYAN_950,
        }}
      />
      <Frame inset={B + 24} width={1} color={mix(CYAN_900, BG, 0.15)} radius={8} />

      {p.showWatermark && <Watermark opacity={p.watermarkOpacity ?? 0.05} />}

      <CornerQr
        position={p.qrPosition}
        offset={B + 32}
        dataUrl={p.qrCodeDataUrl}
        style={{
          borderColor: mix(CYAN_900, WHITE, 0.2),
          placeholderColor: CYAN_900,
          placeholderBg: WHITE,
        }}
      />

      {/* Sidebar labels */}
      <View style={layer(B)}>
        {sideLabel("OMSP Membership", 130, 11, 0.32, WHITE, 600)}
        <View
          style={{
            position: "absolute",
            top: innerH / 2 - px(32),
            left: px(SIDEBAR / 2),
            width: px(1),
            height: px(64),
            backgroundColor: mix(WHITE, CYAN_800, 0.4),
          }}
        />
        {sideLabel("Verified", 724.2 - 2 * B - 80, 10, 0.24, "#cffafe", 400)}
      </View>

      {/* Main column */}
      <View
        style={{
          ...layer(B),
          left: px(B + SIDEBAR),
          width: px(mainW),
          flexDirection: "column",
          paddingHorizontal: px(48),
          paddingVertical: px(36),
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, paddingRight: px(16) }}>
            <Text style={text(10, CYAN_800, { weight: 600, tracking: 0.28, upper: true, align: "left" })}>
              {p.organizationName}
            </Text>
            <Text
              style={{
                ...text(36, CYAN_950, { serif: true, lh: 40 / 36, align: "left" }),
                marginTop: px(12),
              }}
            >
              {title}
            </Text>
          </View>

          <View
            style={{
              padding: px(12),
              borderRadius: px(999),
              borderWidth: px(1),
              borderColor: mix(CYAN_900, WHITE, 0.15),
              borderStyle: "solid",
              backgroundColor: WHITE,
            }}
          >
            <Image
              src={getPdfLogoSrc()}
              style={{ width: px(56), height: px(56), objectFit: "contain" }}
            />
          </View>
        </View>

        <View style={{ width: px(gridW), alignSelf: "center", alignItems: "center", marginTop: px(40) }}>
          <Text style={text(12, "#64748b", { tracking: 0.24, upper: true, lh: LH_XS })}>
            This certifies that
          </Text>
          <Text style={{ ...text(48, "#020617", { serif: true, lh: 1 }), marginTop: px(16) }}>
            {p.recipientName}
          </Text>
          <View
            style={{
              width: px(320),
              height: px(1),
              backgroundColor: mix(CYAN_800, WHITE, 0.4),
              marginTop: px(16),
            }}
          />
          <Text
            style={{
              ...text(14, "#475569", { lh: 24 / 14 }),
              width: px(672),
              marginTop: px(20),
              maxHeight: px(96),
              overflow: "hidden",
            }}
          >
            {p.finalDescription}
          </Text>
        </View>

        <View
          style={{
            width: px(gridW),
            alignSelf: "center",
            flexDirection: "row",
            marginTop: px(32),
          }}
        >
          {cards.map(([label, value], i) => (
            <View
              key={label}
              style={{
                width: px(cardW),
                marginRight: i === cards.length - 1 ? 0 : px(cardGap),
                padding: px(12),
                borderRadius: px(12),
                borderWidth: px(1),
                borderColor: mix(CYAN_900, WHITE, 0.1),
                borderStyle: "solid",
                backgroundColor: "#fbfdfe",
              }}
            >
              <Text style={text(12, CYAN_900, { weight: 600, lh: LH_XS, align: "left" })}>{label}</Text>
              <Text style={{ ...text(12, "#475569", { lh: LH_XS, align: "left" }), marginTop: px(4) }}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexGrow: 1, minHeight: px(24) }} />

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View style={{ width: px(footColW) }}>
            <Text style={text(12, CYAN_900, { weight: 600, lh: LH_XS, align: "left" })}>Verification ID</Text>
            <Text style={text(12, "#64748b", { lh: LH_XS, align: "left" })}>{p.certificateId}</Text>
          </View>

          <Signature
            text={p.signatureText}
            title={p.signatureTitle}
            fontStyle={getSignatureFontStyle(p.signatureStyle)}
            color={CYAN_950}
            lineColor={CYAN_900}
            lineW={192}
            lineMt={4}
            lineMb={8}
            titleStyle={text(12, "#64748b", { tracking: 0.1, upper: true, lh: LH_XS })}
            width={footColW}
          />

          <View style={{ width: px(footColW) }} />
        </View>
      </View>

      {p.verificationUrl && (
        <Text
          style={{
            position: "absolute",
            bottom: px(B + 16),
            left: 0,
            right: 0,
            ...text(10, "#94a3b8", { tracking: 0.025 }),
          }}
        >
          Scan QR Code To Verify Membership Authenticity
        </Text>
      )}
    </Page>
  );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export default function CertificatePDFDocument({
  recipientName,
  certificateTitle,
  certificateId,
  issueDate,
  expiryDate,
  organizationName = "Organization of Marine Science Professionals",
  description = "This certificate is issued in recognition of participation, achievement, and professional commitment.",
  verificationUrl,
  qrCodeDataUrl,
  templateId,
  signatoryName = "OMSP Administration",
  signatoryTitle = "Authorized Signatory",
  designOverrides,
}: CertificatePDFProps) {
  const props: RenderProps = {
    recipientName,
    certificateTitle: certificateTitle || "", // each template supplies its own fallback title
    certificateId,
    issueDate,
    expiryDate,
    organizationName,
    finalDescription: designOverrides?.description || description,
    verificationUrl,
    qrCodeDataUrl,
    signatureText: designOverrides?.signatureText || signatoryName || "OMSP Administration",
    signatureTitle: designOverrides?.signatureTitle || signatoryTitle || "Authorized Signatory",
    signatureStyle: designOverrides?.signatureStyle || "bastliga",
    watermarkOpacity: designOverrides?.watermarkOpacity,
    showWatermark: designOverrides?.showWatermark ?? true,
    logoPosition: designOverrides?.logoPosition || "top-center",
    qrPosition: designOverrides?.qrPosition || "bottom-right",
  };

  const Template =
    templateId === "pure-clean"
      ? PureCleanPDF
      : templateId === "ocean-depth"
      ? OceanDepthPDF
      : templateId === "executive-distinction"
      ? ExecutiveDistinctionPDF
      : templateId === "omsp-membership"
      ? OMSPMembershipPDF
      : ClassicMaritimePDF;

  return (
    <Document
      title={`${certificateTitle || "Certificate"} - ${recipientName}`}
      author="Organization of Marine Science Professionals"
    >
      <Template {...props} />
    </Document>
  );
}
