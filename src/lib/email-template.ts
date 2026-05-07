export function buildEmailTemplate({
  subject,
  content,
}: {
  subject: string;
  content: string;
}) {
  const year = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0; padding:0; background:#020f1e; font-family:Arial, Helvetica, sans-serif;">
      <div style="background:linear-gradient(180deg,#020f1e 0%,#041529 100%); padding:32px 16px;">
        <div style="max-width:620px; margin:0 auto;">

          <div style="text-align:center; margin-bottom:20px;">
            <img
              src="https://www.omspglobal.org/images/omsp-mark.png"
              alt="OMSP Logo"
              width="72"
              height="72"
              style="display:block; margin:0 auto 14px auto; object-fit:contain; border-radius:50%;"
            />

            <div style="color:#2dd4bf; font-size:13px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase;">
              OMSP
            </div>

            <p style="color:#94a3b8; font-size:13px; margin:8px 0 0 0;">
              Organization of Marine Science Professionals
            </p>
          </div>

          <div style="background:#ffffff; border-radius:22px; overflow:hidden; border:1px solid rgba(45,212,191,0.18);">
            <div style="height:5px; background:linear-gradient(90deg,#0d9488,#2dd4bf,#7dd3fc);"></div>

            <div style="padding:32px 28px;">
              <h2 style="margin:0 0 20px 0; color:#020f1e; font-size:22px; line-height:1.35; font-weight:700;">
                ${subject}
              </h2>

              <div style="color:#334155; font-size:15px; line-height:1.8;">
                ${content}
              </div>
            </div>

            <div style="background:#f8fafc; padding:22px 28px; border-top:1px solid #e2e8f0;">
              <p style="font-size:13px; color:#64748b; line-height:1.7; margin:0 0 10px 0;">
                You are receiving this email because you interacted with OMSP or submitted information through our platform.
              </p>

              <p style="font-size:13px; color:#64748b; line-height:1.7; margin:0;">
                Need help? Contact us at
                <a href="mailto:support@omspglobal.org" style="color:#0d9488; text-decoration:none; font-weight:600;">
                  support@omspglobal.org
                </a>
              </p>
            </div>
          </div>

          <p style="text-align:center; color:#64748b; font-size:12px; margin:20px 0 0 0;">
            © ${year} OMSP. All rights reserved.
          </p>

        </div>
      </div>
    </body>
  </html>
  `;
}