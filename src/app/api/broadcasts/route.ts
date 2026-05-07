import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { sendEmail } from "@/lib/email";

type AudienceType =
  | "users"
  | "form_applicants"
  | "selected_users"
  | "manual_emails";

type UserAudience = "all" | "promotional" | "admins";
type SubmissionStatus = "all" | "pending" | "approved" | "rejected";
type SenderType = "admin" | "team" | "support";

const validAudienceTypes: AudienceType[] = [
  "users",
  "form_applicants",
  "selected_users",
  "manual_emails",
];

const validUserAudiences: UserAudience[] = ["all", "promotional", "admins"];

const validSubmissionStatuses: SubmissionStatus[] = [
  "all",
  "pending",
  "approved",
  "rejected",
];

const validSenderTypes: SenderType[] = ["admin", "team", "support"];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractEmailFromSubmissionValues(values: any[]) {
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

function cleanEmails(emails: string[]) {
  return Array.from(
    new Set(
      emails
        .map((email) => String(email).trim().toLowerCase())
        .filter((email) => emailRegex.test(email))
    )
  );
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
    selected_user_ids,
    manual_emails,
    sender_type,
  } = body as {
    subject?: string;
    message?: string;
    audience_type?: AudienceType;
    user_audience?: UserAudience;
    form_id?: string;
    submission_status?: SubmissionStatus;
    selected_user_ids?: string[];
    manual_emails?: string[];
    sender_type?: SenderType;
  };

  const selectedAudienceType: AudienceType = audience_type ?? "users";
  const selectedUserAudience: UserAudience = user_audience ?? "all";
  const selectedSubmissionStatus: SubmissionStatus = submission_status ?? "all";
  const selectedSenderType: SenderType = sender_type ?? "team";

  if (!subject?.trim() || !message?.trim()) {
    return badRequest("Subject and message are required.");
  }

  if (!validAudienceTypes.includes(selectedAudienceType)) {
    return badRequest("Invalid audience type selected.");
  }

  if (!validSenderTypes.includes(selectedSenderType)) {
    return badRequest("Invalid sender selected.");
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

  if (
    selectedAudienceType === "selected_users" &&
    (!selected_user_ids || selected_user_ids.length === 0)
  ) {
    return badRequest("Please select at least one user.");
  }

  if (
    selectedAudienceType === "manual_emails" &&
    (!manual_emails || manual_emails.length === 0)
  ) {
    return badRequest("Please enter at least one email address.");
  }

  const admin = createAdminClient();
  let recipientEmails: string[] = [];

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

  if (selectedAudienceType === "selected_users") {
    const { data: selectedUsers, error } = await admin
      .from("profiles")
      .select("email")
      .in("id", selected_user_ids ?? [])
      .not("email", "is", null);

    if (error) return serverError(error.message);

    recipientEmails = (selectedUsers ?? [])
      .map((user) => user.email)
      .filter((email): email is string => Boolean(email));
  }

  if (selectedAudienceType === "manual_emails") {
    recipientEmails = manual_emails ?? [];
  }

  const uniqueEmails = cleanEmails(recipientEmails);

  if (uniqueEmails.length === 0) {
    return badRequest("No valid recipient email address was found.");
  }

  let sentCount = 0;
  let failedCount = 0;

  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();
  const emailBody = cleanMessage.replace(/\n/g, "<br />");

  for (const email of uniqueEmails) {
    try {
      await sendEmail({
        to: email,
        subject: cleanSubject,
        html: emailBody,
        senderType: selectedSenderType,
      });

      sentCount++;
    } catch {
      failedCount++;
    }
  }

  const audienceLabel =
    selectedAudienceType === "users"
      ? selectedUserAudience
      : selectedAudienceType === "form_applicants"
        ? `form:${form_id}:${selectedSubmissionStatus}`
        : selectedAudienceType === "selected_users"
          ? `selected_users:${uniqueEmails.length}`
          : `manual_emails:${uniqueEmails.length}`;

  const { error: logErr } = await admin.from("email_broadcasts").insert({
    subject: cleanSubject,
    message: cleanMessage,
    audience: audienceLabel,
    sent_count: sentCount,
    failed_count: failedCount,
    sender_type: selectedSenderType,
  });

  if (logErr) return serverError(logErr.message);

  return NextResponse.json({
    success: true,
    audience_type: selectedAudienceType,
    user_audience: selectedUserAudience,
    form_id: form_id ?? null,
    submission_status: selectedSubmissionStatus,
    sender_type: selectedSenderType,
    total_recipients: uniqueEmails.length,
    sent_count: sentCount,
    failed_count: failedCount,
  });
}