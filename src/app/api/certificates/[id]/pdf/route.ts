import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/server-utils";
import {
  buildCertificatePDFInput,
  generateCertificatePDFBlob,
} from "@/lib/certificates/pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/certificates/[id]/pdf
 *
 * Re-renders the certificate PDF from the stored row on every request, so the
 * download always reflects the current template and design overrides instead of
 * the copy saved when the certificate was created.
 *
 * Certificates have no per-user owner, so access is admin-only.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("[pdf-route] called for id:", params.id);

  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = await createServerSupabaseClient();

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  try {
    const qrCodeDataUrl =
      cert.qr_code_data_url ||
      (cert.verification_url
        ? await QRCode.toDataURL(cert.verification_url, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 300,
            color: { dark: "#0B2545", light: "#FFFFFF" },
          })
        : undefined);

    const blob = await generateCertificatePDFBlob(
      buildCertificatePDFInput({
        recipientName: cert.recipient_name,
        certificateTitle:
          cert.certificate_title ||
          cert.programme_title ||
          "Certificate of Recognition",
        certificateId: cert.certificate_id,
        issueDate: cert.issue_date,
        expiryDate: cert.expiry_date || null,
        templateId: cert.template_id,
        designOverrides: cert.design_overrides,
        verificationUrl: cert.verification_url || undefined,
        qrCodeDataUrl,
      })
    );

    const filename = `certificate-${cert.certificate_id}`.replace(
      /[^A-Za-z0-9._-]/g,
      "_"
    );

    return new NextResponse(await blob.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[pdf-route] generation failed:", e);

    return NextResponse.json(
      {
        error: "PDF generation failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
