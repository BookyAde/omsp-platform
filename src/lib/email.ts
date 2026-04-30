type EmailSenderType = "admin" | "team" | "support";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  senderType?: EmailSenderType;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
};

const senderProfiles: Record<EmailSenderType, { email: string; name: string }> = {
  admin: {
    email: process.env.OMSP_ADMIN_EMAIL || "admin@omspglobal.org",
    name: "OMSP Admin",
  },
  team: {
    email: process.env.OMSP_TEAM_EMAIL || "team@omspglobal.org",
    name: "OMSP Team",
  },
  support: {
    email: process.env.OMSP_SUPPORT_EMAIL || "support@omspglobal.org",
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
}: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;

  const selectedSender = senderProfiles[senderType];

  const senderEmail =
    fromEmail || selectedSender.email || process.env.EMAIL_FROM || "admin@omspglobal.org";

  const senderName =
    fromName || selectedSender.name || process.env.EMAIL_FROM_NAME || "OMSP";

  if (!apiKey) {
    throw new Error("Missing BREVO_API_KEY in .env.local");
  }

  const recipients = Array.isArray(to)
    ? to.map((email) => ({ email }))
    : to.split(",").map((email) => ({ email: email.trim() }));

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: recipients,
      subject,
      htmlContent: html,
      ...(replyTo
        ? {
            replyTo: {
              email: replyTo,
            },
          }
        : {}),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Brevo email error:", data);
    throw new Error(data.message || "Failed to send email");
  }

  return data;
}
