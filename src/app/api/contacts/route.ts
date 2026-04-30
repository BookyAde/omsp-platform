import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { contactSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";
import { buildEmailTemplate } from "@/lib/email-template";
import { SUPPORT_EMAIL } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("contacts").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    if (error) throw error;

    const supportHtml = buildEmailTemplate({
      subject: `New Support Message — ${parsed.data.subject}`,
      content: `
        <p>A new contact message has been submitted.</p>

        <p><strong>Name:</strong> ${parsed.data.name}</p>
        <p><strong>Email:</strong> ${parsed.data.email}</p>
        <p><strong>Subject:</strong> ${parsed.data.subject}</p>

        <hr/>

        <p><strong>Message:</strong></p>
        <p>${parsed.data.message}</p>
      `,
    });

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `New Support Message — ${parsed.data.subject}`,
      html: supportHtml,
      senderType: "support",
      replyTo: parsed.data.email,
    });

    const userHtml = buildEmailTemplate({
      subject: "We received your message",
      content: `
        <p>Hello ${parsed.data.name},</p>
        <p>Thank you for contacting OMSP.</p>
        <p>We have received your message and our support team will get back to you soon.</p>
        <p>— OMSP Support</p>
      `,
    });

    await sendEmail({
      to: parsed.data.email,
      subject: "We received your message",
      html: userHtml,
      senderType: "support",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Contact submission error:", err);
    return NextResponse.json(
      { error: "Failed to save message." },
      { status: 500 }
    );
  }
}