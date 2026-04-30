import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { sendEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const submissionId = params.id;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { status } = body as { status?: string };

  if (!["pending", "approved", "rejected"].includes(status ?? "")) {
    return badRequest("Invalid submission status.");
  }

  const admin = createAdminClient();

  const { data: submission, error: fetchErr } = await admin
    .from("form_submissions")
    .select(`
      id,
      status,
      form_id,
      form:forms(id, title),
      values:form_submission_values(
        id,
        value,
        field:form_fields(id, label)
      )
    `)
    .eq("id", submissionId)
    .single();

  if (fetchErr || !submission) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  const { data: updated, error: updateErr } = await admin
    .from("form_submissions")
    .update({ status })
    .eq("id", submissionId)
    .select()
    .single();

  if (updateErr) return serverError(updateErr.message);

  const values = submission.values ?? [];

  const emailValue = values.find((item: any) =>
    String(item.field?.label ?? "").toLowerCase().includes("email")
  );

  const applicantEmail = emailValue
    ? String(emailValue.value ?? "").trim()
    : "";

  const nameValue = values.find((item: any) =>
    String(item.field?.label ?? "").toLowerCase().includes("name")
  );

  const applicantName = nameValue
    ? String(nameValue.value ?? "").trim()
    : "";

  if (applicantEmail && applicantEmail.includes("@")) {
    try {
      if (status === "approved") {
        await sendEmail({
          to: applicantEmail,
          subject: "Your OMSP Submission Has Been Approved",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #222;">
              <h2>Congratulations${applicantName ? `, ${applicantName}` : ""}</h2>

              <p>
                We are pleased to let you know that your submission to the
                <strong> Organization of Marine Science Professionals (OMSP)</strong>
                has been approved.
              </p>

              <p>
                Thank you for taking the time to connect with OMSP. We are excited to have you as part of our growing professional community.
              </p>

              <p style="margin-top: 28px;">
                Warm regards,<br />
                <strong>OMSP Team</strong>
              </p>
            </div>
          `,
        });
      }

      if (status === "rejected") {
        await sendEmail({
          to: applicantEmail,
          subject: "Update on Your OMSP Submission",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #222;">
              <h2>Hello${applicantName ? ` ${applicantName}` : ""},</h2>

              <p>
                Thank you for submitting your details to the
                <strong> Organization of Marine Science Professionals (OMSP)</strong>.
              </p>

              <p>
                After reviewing your submission, we are unable to approve it at this time.
              </p>

              <p>
                You may contact the OMSP team for clarification or further guidance if needed.
              </p>

              <p style="margin-top: 28px;">
                Warm regards,<br />
                <strong>OMSP Team</strong>
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Submission status email failed:", emailError);
    }
  }

  return NextResponse.json({
    success: true,
    submission: updated,
  });
}