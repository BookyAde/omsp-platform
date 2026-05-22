import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { buildCertificateEmailContent } from "@/lib/email-template";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: certificate, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    if (!certificate.recipient_email) {
      return NextResponse.json(
        { error: "This certificate has no recipient email." },
        { status: 400 }
      );
    }

    if (!certificate.pdf_url) {
      return NextResponse.json(
        { error: "This certificate has no PDF attached yet." },
        { status: 400 }
      );
    }

    const pdfResponse = await fetch(certificate.pdf_url);

    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch certificate PDF." },
        { status: 500 }
      );
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");

    const certificateTitle =
      certificate.certificate_title ||
      certificate.programme_title ||
      "OMSP Certificate";

    const emailHtml = buildCertificateEmailContent({
      recipientName: certificate.recipient_name,
      certificateTitle,
      certificateId: certificate.certificate_id,
      verificationUrl: certificate.verification_url,
    });

    await sendEmail({
      to: certificate.recipient_email,
      subject: `Your OMSP Certificate - ${certificateTitle}`,
      html: emailHtml,
      senderType: "admin",
      attachments: [
        {
          name: `${certificate.certificate_id}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    const { data: updatedCertificate, error: updateError } = await supabase
      .from("certificates")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedCertificate);
  } catch (error: any) {
    console.error("POST /api/certificates/[id]/send-email error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to send certificate email" },
      { status: 500 }
    );
  }
}