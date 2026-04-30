export function buildEmailTemplate({
  subject,
  content,
}: {
  subject: string;
  content: string;
}) {
  const year = new Date().getFullYear();

  return `
  <div style="background:#0f172a; padding:24px; font-family:Arial, Helvetica, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#020617; border-radius:14px; padding:28px; border:1px solid #1e293b;">

      <!-- Header -->
      <div style="text-align:center; margin-bottom:24px;">
        <img
          src="https://omspglobal.org/images/omsp-mark.png"
          alt="OMSP Logo"
          width="64"
          height="64"
          style="display:block; margin:0 auto 12px auto; object-fit:contain;"
        />

        <h2 style="color:#14b8a6; margin:0; font-size:22px; letter-spacing:0.04em;">
          OMSP
        </h2>

        <p style="color:#94a3b8; font-size:12px; margin:6px 0 0 0;">
          Organization of Marine Science Professionals
        </p>
      </div>

      <!-- Subject -->
      <h3 style="color:#ffffff; margin:0 0 18px 0; font-size:18px;">
        ${subject}
      </h3>

      <!-- Body -->
      <div style="color:#cbd5e1; font-size:14px; line-height:1.7;">
        ${content}
      </div>

      <!-- Footer -->
      <hr style="margin:28px 0 18px 0; border:none; border-top:1px solid #1e293b;" />

      <p style="font-size:12px; color:#64748b; margin:0 0 8px 0;">
        You are receiving this email because you interacted with OMSP.
      </p>

      <p style="font-size:12px; color:#64748b; margin:0;">
        © ${year} OMSP. All rights reserved.
      </p>

    </div>
  </div>
  `;
}