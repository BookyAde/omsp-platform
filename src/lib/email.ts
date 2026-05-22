import { buildEmailTemplate } from "@/lib/email-template";

export const ADMIN_EMAIL = "admin@omspglobal.org";
export const TEAM_EMAIL = "team@omspglobal.org";
export const SUPPORT_EMAIL = "support@omspglobal.org";

type EmailSenderType = "admin" | "team" | "support";

type EmailAttachment = {
  name: string;
  content: string; // Base64 content
};

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  senderType?: EmailSenderType;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  useTemplate?: boolean;
  attachments?: EmailAttachment[];
};

const senderProfiles: Record<EmailSenderType, { email: string; name: string }> = {
  admin: {
    email: process.env.OMSP_ADMIN_EMAIL || ADMIN_EMAIL,
    name: "OMSP Admin",
  },
  team: {
    email: process.env.OMSP_TEAM_EMAIL || TEAM_EMAIL,
    name: "OMSP Team",
  },
  support: {
    email: process.env.OMSP_SUPPORT_EMAIL || SUPPORT_EMAIL,
    name: "OMSP Support",
  },
};

export async function sendEmail({
  to,
  subject,
  html,
  senderType = "admin",
  fromEmail,
  fromName,
  replyTo,
  useTemplate = true,
  attachments,
}: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("Missing BREVO_API_KEY in .env.local");
  }

  const selectedSender = senderProfiles[senderType];

  const senderEmail =
    fromEmail ||
    selectedSender.email ||
    process.env.EMAIL_FROM ||
    ADMIN_EMAIL;

  const senderName =
    fromName ||
    selectedSender.name ||
    process.env.EMAIL_FROM_NAME ||
    "OMSP";

  const recipients = Array.isArray(to)
    ? to.map((email) => ({ email: email.trim() })).filter((item) => item.email)
    : to
        .split(",")
        .map((email) => ({ email: email.trim() }))
        .filter((item) => item.email);

  if (recipients.length === 0) {
    throw new Error("No valid recipient email provided");
  }

  const htmlContent = useTemplate
    ? buildEmailTemplate({
        subject,
        content: html,
      })
    : html;

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: recipients,
    subject,
    htmlContent,
    ...(replyTo
      ? {
          replyTo: {
            email: replyTo,
          },
        }
      : {}),
    ...(attachments && attachments.length > 0
      ? {
          attachment: attachments.map((file) => ({
            name: file.name,
            content: file.content,
          })),
        }
      : {}),
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Brevo email error:", data);
    throw new Error(data.message || "Failed to send email");
  }

  return data;
}