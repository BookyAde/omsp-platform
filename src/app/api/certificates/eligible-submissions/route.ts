import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

function pickValue(values: any[], keywords: string[]) {
  const found = values.find((item) => {
    const label = item.form_fields?.label?.toLowerCase() || "";
    return keywords.some((key) => label.includes(key));
  });

  return found?.value || "";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("form_id");

    if (!formId) {
      return NextResponse.json({ error: "form_id is required" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: submissions, error } = await supabase
      .from("form_submissions")
      .select(
        `
        id,
        form_id,
        status,
        submitted_at,
        form_submission_values (
          value,
          form_fields (
            label,
            field_type
          )
        )
      `
      )
      .eq("form_id", formId)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    const { data: certificates, error: certError } = await supabase
      .from("certificates")
      .select("submission_id, certificate_id, verification_url, qr_code_data_url")
      .eq("form_id", formId);

    if (certError) throw certError;

    const certMap = new Map(
      (certificates || []).map((cert) => [cert.submission_id, cert])
    );

    const formatted = (submissions || []).map((submission: any) => {
      const values = submission.form_submission_values || [];

      const name =
        pickValue(values, ["name", "full name", "surname", "firstname"]) ||
        "Unnamed Participant";

      const email = pickValue(values, ["email", "mail"]);

      const existingCertificate = certMap.get(submission.id);

      return {
        submission_id: submission.id,
        form_id: submission.form_id,
        recipient_name: name,
        recipient_email: email,
        status: submission.status,
        submitted_at: submission.submitted_at,
        has_certificate: Boolean(existingCertificate),
        certificate: existingCertificate || null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/certificates/eligible-submissions error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch eligible submissions" },
      { status: 500 }
    );
  }
}