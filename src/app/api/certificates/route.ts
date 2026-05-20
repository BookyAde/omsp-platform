import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

import { createServerSupabaseClient } from "@/lib/supabase";

function generateCertificateId(sequence: number) {
  const year = new Date().getFullYear();
  return `OMSP-CERT-${year}-${String(sequence).padStart(6, "0")}`;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
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
    const body = await request.json();

    const {
      form_id,
      submission_id,
      recipient_name,
      recipient_email,
      programme_title,
      certificate_type,
      source = "form_submission",
    } = body;

    if (!recipient_name || !programme_title) {
      return NextResponse.json(
        { error: "Recipient name and programme title are required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { count, error: countError } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const nextSequence = (count || 0) + 1;
    const certificate_id = generateCertificateId(nextSequence);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const verification_url = `${siteUrl}/verify/${certificate_id}`;
    const qr_code_data_url = await QRCode.toDataURL(verification_url);

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        certificate_id,
        source,
        form_id: form_id || null,
        submission_id: submission_id || null,
        recipient_name,
        recipient_email: recipient_email || null,
        programme_title,
        certificate_type: certificate_type || "Participation",
        verification_url,
        qr_code_data_url,
        status: "valid",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("POST /api/certificates error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create certificate" },
      { status: 500 }
    );
  }
}