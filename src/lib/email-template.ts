export function buildEmailTemplate({
  subject,
  content,
}: {
  subject: string;
  content: string;
}) {
  return `
  <div style="background:#0f172a; padding:20px; font-family:Arial, sans-serif;">
    <div style="max-width:600px; margin:auto; background:#020617; border-radius:10px; padding:24px;">

      <!-- Header -->
      <h2 style="color:#14b8a6; margin-bottom:4px;">
        OMSP
      </h2>
      <p style="color:#64748b; font-size:12px; margin-bottom:20px;">
        Organization of Marine Science Professionals
      </p>

      <!-- Subject -->
      <h3 style="color:#ffffff; margin-bottom:16px;">
        ${subject}
      </h3>

      <!-- Body -->
      <div style="color:#cbd5f5; font-size:14px; line-height:1.6;">
        ${content}
      </div>

      <!-- Footer -->
      <hr style="margin:24px 0; border:none; border-top:1px solid #1e293b;" />

      <p style="font-size:12px; color:#64748b;">
        You are receiving this email because you interacted with OMSP.
      </p>

      <p style="font-size:12px; color:#64748b;">
        © ${new Date().getFullYear()} OMSP. All rights reserved.
      </p>

    </div>
  </div>
  `;
}