import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { sendEmail } from "@/lib/email";
import { buildEmailTemplate } from "@/lib/email-template";
import { TEAM_EMAIL } from "@/lib/emails";

// ─── GET — list submissions (admin only) ─────────────────────────────

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const formId = searchParams.get("form_id");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 500);

  const admin = createAdminClient();

  let query = admin
    .from("form_submissions")
    .select(`
      id,
      submitted_at,
      ip_address,
      form_id,
      form:forms(id, title, slug),
      values:form_submission_values(
        id,
        value,
        field:form_fields(id, label, field_type, field_order, is_active)
      )
    `)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (formId) {
    query = query.eq("form_id", formId) as typeof query;
  }

  const { data, error } = await query;
  if (error) return serverError(error.message);

  const sorted = (data ?? []).map((sub: any) => ({
    ...sub,
    values: [...(sub.values ?? [])].sort(
      (a: any, b: any) =>
        (a.field?.field_order ?? 0) - (b.field?.field_order ?? 0)
    ),
  }));

  return NextResponse.json(sorted);
}

// ─── POST — accept submission ───────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { form_id, values } = body as any;

  if (!form_id || typeof form_id !== "string") {
    return badRequest("form_id is required.");
  }

  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return badRequest("values must be an object.");
  }

  const admin = createAdminClient();

  // ─── Validate form ─────────────────────────────────────────────

  const { data: form, error: formErr } = await admin
    .from("forms")
    .select("id, title, status, deadline, requires_review")
    .eq("id", form_id)
    .eq("status", "published")
    .single();

  if (formErr || !form) {
    return NextResponse.json(
      { error: "Form not found or not accepting submissions." },
      { status: 404 }
    );
  }

  // ✅ Fixed deadline check (timezone-safe)
  const now = new Date().toISOString();

  if (form.deadline && form.deadline < now) {
    return NextResponse.json(
      {
        message:
          "This form is now closed. Thank you for your interest. It is no longer accepting responses.",
      },
      { status: 410 }
    );
  }

  // ─── Get fields ─────────────────────────────────────────────

  const { data: fields, error: fieldsErr } = await admin
    .from("form_fields")
    .select("id, label, required")
    .eq("form_id", form_id)
    .eq("is_active", true);

  if (fieldsErr) return serverError(fieldsErr.message);

  // ─── Validate required fields ─────────────────────────────

  for (const field of fields ?? []) {
    if (field.required) {
      const val = values[field.id];
      const isEmpty =
        !val || (typeof val === "string" && val.trim() === "");

      if (isEmpty) {
        return NextResponse.json(
          { error: `"${field.label}" is required.` },
          { status: 422 }
        );
      }
    }
  }

  // ─── Extract email for duplicate check ─────────────────────

  const emailField = fields?.find((f) =>
    f.label.toLowerCase().includes("email")
  );

  const applicantEmail = emailField
    ? String(values[emailField.id] ?? "").trim().toLowerCase()
    : "";

  if (emailField && applicantEmail && applicantEmail.includes("@")) {
    const { data: existingSubmission, error: duplicateErr } = await admin
      .from("form_submission_values")
      .select(`
        submission_id,
        submission:form_submissions!inner(id, form_id)
      `)
      .eq("field_id", emailField.id)
      .ilike("value", applicantEmail)
      .eq("submission.form_id", form_id)
      .maybeSingle();

    if (duplicateErr) return serverError(duplicateErr.message);

    if (existingSubmission) {
      return NextResponse.json(
        { message: "You have already submitted this form." },
        { status: 409 }
      );
    }
  }

  // ─── Insert submission ─────────────────────────────────────

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const initialStatus = form.requires_review ? "pending" : "approved";

  const { data: submission, error: subErr } = await admin
    .from("form_submissions")
    .insert({
      form_id,
      ip_address: ip,
      status: initialStatus,
    })
    .select()
    .single();

  if (subErr) return serverError(subErr.message);

  const knownFieldIds = new Set((fields ?? []).map((f) => f.id));

  const valueRows = Object.entries(values)
    .filter(([fieldId]) => knownFieldIds.has(fieldId))
    .map(([fieldId, value]) => ({
      submission_id: submission.id,
      field_id: fieldId,
      value:
        fieldId === emailField?.id
          ? String(value ?? "").trim().toLowerCase()
          : String(value ?? ""),
    }));

  if (valueRows.length > 0) {
    const { error: valErr } = await admin
      .from("form_submission_values")
      .insert(valueRows);

    if (valErr) {
      await admin.from("form_submissions").delete().eq("id", submission.id);
      return serverError(valErr.message);
    }
  }

  // ─── File URLs ─────────────────────────────────────────────

  const signedUrls: Record<string, string> = {};

  for (const row of valueRows) {
    if (row.value && row.value.includes("forms/")) {
      const { data } = await admin.storage
        .from("form-uploads")
        .createSignedUrl(row.value, 60 * 60);

      if (data?.signedUrl) {
        signedUrls[row.value] = data.signedUrl;
      }
    }
  }

  const formattedValues = valueRows
    .map((row: any) => {
      const field = fields?.find((f) => f.id === row.field_id);
      const label = field?.label ?? "Field";

      if (row.value && row.value.includes("forms/")) {
        return `<p><strong>${label}:</strong><br/>
          <a href="${signedUrls[row.value]}" target="_blank">View file</a></p>`;
      }

      return `<p><strong>${label}:</strong> ${row.value}</p>`;
    })
    .join("");

  // ─── Team notification ─────────────────────────────────────

  try {
    const adminHtml = buildEmailTemplate({
      subject: `New Submission — ${form.title}`,
      content: `
        <p>A new submission has been received.</p>
        <p><strong>Form:</strong> ${form.title}</p>
        <p><strong>Status:</strong> ${initialStatus}</p>
        <hr/>
        ${formattedValues}
      `,
    });

    await sendEmail({
      to: TEAM_EMAIL,
      subject: `New Submission — ${form.title}`,
      html: adminHtml,
      senderType: "team",
    });
  } catch (err) {
    console.error("Team email failed:", err);
  }

  // ─── Applicant email ─────────────────────────────────────

  if (applicantEmail && applicantEmail.includes("@")) {
    try {
      const html = buildEmailTemplate({
        subject: "Application Received",
        content: `
          <p>Hello,</p>
          <p>Your submission for <strong>${form.title}</strong> has been received.</p>
          <p>We will review it and get back to you.</p>
          <p>— OMSP Team</p>
        `,
      });

      await sendEmail({
        to: applicantEmail,
        subject: "Application Received",
        html,
        senderType: "team",
      });
    } catch (err) {
      console.error("Applicant email failed:", err);
    }
  }

  return NextResponse.json(
    {
      success: true,
      submission_id: submission.id,
      status: initialStatus,
    },
    { status: 201 }
  );
}