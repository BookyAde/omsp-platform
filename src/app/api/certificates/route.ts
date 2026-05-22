import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createServerSupabaseClient } from "@/lib/supabase";
import { generateCertificatePDFBlob } from "@/lib/certificates/pdf";

export const dynamic = "force-dynamic";

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.omspglobal.org"
  );
}

function generateCertificateId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `OMSP-CERT-${year}-${random}`;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("GET /api/certificates error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    const certificateId = body.certificate_id || generateCertificateId();

    const verificationUrl = `${getSiteUrl()}/verify/${encodeURIComponent(
      certificateId
    )}`;

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
      color: {
        dark: "#0B2545",
        light: "#FFFFFF",
      },
    });

    const issueDate = body.issue_date || new Date().toISOString().slice(0, 10);

    const certificateTitle =
      body.certificate_title ||
      body.programme_title ||
      "Certificate of Recognition";

    if (!body.recipient_name) {
      return NextResponse.json(
        { error: "recipient_name is required" },
        { status: 400 }
      );
    }

    const designOverrides = body.design_overrides || {};

    let pdfUrl: string | null = body.pdf_url || null;

    try {
      const pdfBlob = await generateCertificatePDFBlob({
        recipientName: body.recipient_name,
        certificateTitle,
        certificateId,
        issueDate,
        expiryDate: body.expiry_date || null,
        organizationName: "Organization of Marine Science Professionals",
        description:
          designOverrides.description ||
          "This certificate is issued in recognition of participation, achievement, and professional commitment.",
        verificationUrl,
        qrCodeDataUrl,
        templateId: body.template_id || "classic-maritime",
        signatoryName:
          designOverrides.signatureText ||
          body.signatory_name ||
          "OMSP Administration",
        signatoryTitle:
          designOverrides.signatureTitle ||
          body.signatory_title ||
          "Authorized Signatory",
        designOverrides,
      });

      const pdfPath = `certificates/${certificateId}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(pdfPath, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Certificate PDF upload error:", uploadError);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("certificates")
          .getPublicUrl(pdfPath);

        pdfUrl = publicUrlData.publicUrl;
      }
    } catch (pdfError) {
      console.error("Certificate PDF generation error:", pdfError);
    }

    const payload = {
      certificate_id: certificateId,
      certificate_title: certificateTitle,

      recipient_name: body.recipient_name,
      recipient_email: body.recipient_email || null,

      programme_title: body.programme_title || null,
      certificate_type: body.certificate_type || "general",

      issue_date: issueDate,
      expiry_date: body.expiry_date || null,
      status: body.status || "valid",

      form_id: body.form_id || null,
      submission_id: body.submission_id || null,

      template_id: body.template_id || "classic-maritime",
      design_overrides: designOverrides,

      verification_url: verificationUrl,
      qr_code_data_url: qrCodeDataUrl,

      pdf_url: pdfUrl,

      email_sent: false,
      email_sent_at: null,
    };

    const { data, error } = await supabase
      .from("certificates")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/certificates error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create certificate" },
      { status: 500 }
    );
  }
}