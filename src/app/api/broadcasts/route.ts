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

// Helper to convert a File (or Blob) to base64 string
async function fileToBase64(file: File | Blob): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return badRequest("Invalid form data. Could not parse multipart.");
  }

  // Extract fields
  const subject = formData.get("subject")?.toString();
  const message = formData.get("message")?.toString();
  const audience_type = formData.get("audience_type")?.toString() as AudienceType;
  const user_audience = formData.get("user_audience")?.toString() as UserAudience;
  const form_id = formData.get("form_id")?.toString();
  const submission_status = formData.get("submission_status")?.toString() as SubmissionStatus;
  const sender_type = formData.get("sender_type")?.toString() as SenderType;
  const selected_user_ids = JSON.parse(formData.get("selected_user_ids")?.toString() || "[]");
  const manual_emails = JSON.parse(formData.get("manual_emails")?.toString() || "[]");

  // Extract attachments (files with key "attachments")
  const uploadedFiles: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === "attachments" && value instanceof File) {
      uploadedFiles.push(value);
    }
  }

  const selectedAudienceType: AudienceType = audience_type ?? "users";
  const selectedUserAudience: UserAudience = user_audience ?? "all";
  const selectedSubmissionStatus: SubmissionStatus = submission_status ?? "all";
  const selectedSenderType: SenderType = sender_type ?? "team";

  // Validate required fields
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

  // Validate total attachment size (e.g., 20MB)
  const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > 20 * 1024 * 1024) {
    return badRequest("Total attachment size exceeds 20MB.");
  }

  // Convert attachments to base64 (required by Brevo)
  let attachments: { name: string; content: string }[] = [];
  if (uploadedFiles.length > 0) {
    attachments = await Promise.all(
      uploadedFiles.map(async (file) => ({
        name: file.name,
        content: await fileToBase64(file),
      }))
    );
  }

  const admin = createAdminClient();
  let recipientEmails: string[] = [];

  // ------------------- Build recipient list (unchanged) -------------------
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

  // ------------------- Pre‑fetch user IDs -------------------
  const { data: profileMatches, error: profileError } = await admin
    .from("profiles")
    .select("email, id")
    .in("email", uniqueEmails);
  if (profileError) {
    console.error("Failed to fetch profile ids:", profileError);
  }
  const emailToUserId = new Map<string, string>();
  (profileMatches ?? []).forEach((p) => {
    if (p.email) emailToUserId.set(p.email, p.id);
  });

  // ------------------- Send emails with attachments -------------------
  let sentCount = 0;
  let failedCount = 0;
  const recipientResults: {
    email: string;
    userId: string | null;
    status: string;
  }[] = [];

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
        attachments, // pass base64 attachments
      });
      sentCount++;
      recipientResults.push({
        email,
        userId: emailToUserId.get(email) || null,
        status: "sent",
      });
    } catch {
      failedCount++;
      recipientResults.push({
        email,
        userId: emailToUserId.get(email) || null,
        status: "failed",
      });
    }
  }

  // ------------------- Log broadcast -------------------
  const audienceLabel =
    selectedAudienceType === "users"
      ? selectedUserAudience
      : selectedAudienceType === "form_applicants"
        ? `form:${form_id}:${selectedSubmissionStatus}`
        : selectedAudienceType === "selected_users"
          ? `selected_users:${uniqueEmails.length}`
          : `manual_emails:${uniqueEmails.length}`;

  const { data: broadcastLog, error: logErr } = await admin
    .from("email_broadcasts")
    .insert({
      subject: cleanSubject,
      message: cleanMessage,
      audience: audienceLabel,
      sent_count: sentCount,
      failed_count: failedCount,
      sender_type: selectedSenderType,
    })
    .select("id")
    .single();

  if (logErr) {
    return serverError(logErr.message);
  }

  const broadcastId = broadcastLog.id;

  // ------------------- Store recipients -------------------
  if (recipientResults.length > 0) {
    const recipientRows = recipientResults.map((r) => ({
      broadcast_id: broadcastId,
      email: r.email,
      user_id: r.userId,
      status: r.status,
    }));
    const { error: insertRecipientsError } = await admin
      .from("broadcast_recipients")
      .insert(recipientRows);
    if (insertRecipientsError) {
      console.error("Failed to store recipients:", insertRecipientsError);
    }
  }

  return NextResponse.json({
    success: true,
    total_recipients: uniqueEmails.length,
    sent_count: sentCount,
    failed_count: failedCount,
  });
}