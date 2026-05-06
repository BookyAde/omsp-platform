import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { sendEmail } from "@/lib/email";
import { buildEmailTemplate } from "@/lib/email-template";

type AudienceType = "users" | "form_applicants";
type UserAudience = "all" | "promotional" | "admins";
type SubmissionStatus = "all" | "pending" | "approved" | "rejected";

const validAudienceTypes: AudienceType[] = ["users", "form_applicants"];
const validUserAudiences: UserAudience[] = ["all", "promotional", "admins"];
const validSubmissionStatuses: SubmissionStatus[] = [
  "all",
  "pending",
  "approved",
  "rejected",
];

function extractEmailFromSubmissionValues(values: any[]) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const emailValue = values.find((item) => {
    const value = String(item.value ?? "").trim();
    const label = String(item.field?.label ?? "").toLowerCase();
    const fieldType = String(item.field?.field_type ?? "").toLowerCase();

    return (
      value &&
      emailRegex.test(value) &&
      (fieldType === "email" ||
        label.includes("email") ||
        label.includes("e-mail"))
    );
  });

  return emailValue ? String(emailValue.value).trim().toLowerCase() : null;
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const {
    subject,
    message,
    audience_type,
    user_audience,
    form_id,
    submission_status,
  } = body as {
    subject?: string;
    message?: string;
    audience_type?: AudienceType;
    user_audience?: UserAudience;
    form_id?: string;
    submission_status?: SubmissionStatus;
  };

  const selectedAudienceType: AudienceType = audience_type ?? "users";
  const selectedUserAudience: UserAudience = user_audience ?? "all";
  const selectedSubmissionStatus: SubmissionStatus =
    submission_status ?? "all";

  if (!subject?.trim() || !message?.trim()) {
    return badRequest("Subject and message are required.");
  }

  if (!validAudienceTypes.includes(selectedAudienceType)) {
    return badRequest("Invalid audience type selected.");
  }

  if (
    selectedAudienceType === "users" &&
    !validUserAudiences.includes(selectedUserAudience)
  ) {
    return badRequest("Invalid user audience selected.");
  }

  if (
    selectedAudienceType === "form_applicants" &&
    !validSubmissionStatuses.includes(selectedSubmissionStatus)
  ) {
    return badRequest("Invalid submission status selected.");
  }

  if (selectedAudienceType === "form_applicants" && !form_id) {
    return badRequest("Please select a form.");
  }

  const admin = createAdminClient();

  let recipientEmails: string[] = [];

  // ─── USERS ─────────────────────────────────────────────
  if (selectedAudienceType === "users") {
    let query = admin
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (selectedUserAudience === "promotional") {
      query = query.eq("email_promotions", true);
    }

    if (selectedUserAudience === "admins") {
      query = query.eq("role", "admin");
    }

    const { data: users, error } = await query;

    if (error) return serverError(error.message);

    recipientEmails = (users ?? [])
      .map((user) => user.email)
      .filter((email): email is string => Boolean(email));
  }

  // ─── FORM APPLICANTS ───────────────────────────────────
  if (selectedAudienceType === "form_applicants") {
    let query = admin
      .from("form_submissions")
      .select(
        `
        id,
        status,
        values:form_submission_values (
          value,
          field:form_fields (
            label,
            field_type
          )
        )
      `
      )
      .eq("form_id", form_id);

    if (selectedSubmissionStatus !== "all") {
      query = query.eq("status", selectedSubmissionStatus);
    }

    const { data: submissions, error } = await query;

    if (error) return serverError(error.message);

    recipientEmails = (submissions ?? [])
      .map((submission) =>
        extractEmailFromSubmissionValues(submission.values ?? [])
      )
      .filter((email): email is string => Boolean(email));
  }

  const uniqueEmails = Array.from(new Set(recipientEmails));

  let sentCount = 0;
  let failedCount = 0;

  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();

  // ✅ USE PROPER TEMPLATE
  const html = buildEmailTemplate({
    subject: cleanSubject,
    content: cleanMessage.replace(/\n/g, "<br />"),
  });

  for (const email of uniqueEmails) {
    try {
      await sendEmail({
        to: email,
        subject: cleanSubject,
        html,
      });

      sentCount++;
    } catch {
      failedCount++;
    }
  }

  const audienceLabel =
    selectedAudienceType === "users"
      ? selectedUserAudience
      : `form:${form_id}:${selectedSubmissionStatus}`;

  const { error: logErr } = await admin.from("email_broadcasts").insert({
    subject: cleanSubject,
    message: cleanMessage,
    audience: audienceLabel,
    sent_count: sentCount,
    failed_count: failedCount,
  });

  if (logErr) return serverError(logErr.message);

  return NextResponse.json({
    success: true,
    audience_type: selectedAudienceType,
    user_audience: selectedUserAudience,
    form_id: form_id ?? null,
    submission_status: selectedSubmissionStatus,
    total_recipients: uniqueEmails.length,
    sent_count: sentCount,
    failed_count: failedCount,
  });
}