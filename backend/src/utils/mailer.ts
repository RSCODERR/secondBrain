import crypto from "crypto";

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Verified sender in Brevo (must match the verified sender email)
const SENDER = {
  name: process.env.EMAIL_FROM_NAME || "Second Brain",
  email: process.env.EMAIL_FROM_ADDRESS || "akasharmaraghav@gmail.com",
};

/**
 * Send an email via Brevo transactional API (HTTP — not SMTP, works on Render free tier)
 */
async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const body = JSON.stringify({
    sender: SENDER,
    to: [{ email: options.to }],
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.text,
  });

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Mailer] Brevo API error (${response.status}):`, errorBody);
    return false;
  }

  const data = await response.json() as { messageId?: string };
  console.log(`[Mailer] Email sent to ${options.to}. MessageId: ${data?.messageId}`);
  return true;
}

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send an anti-spam optimized verification email with a 6-digit OTP code
 */
export async function sendVerificationEmail(
  toEmail: string,
  username: string,
  otpCode: string
): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Second Brain email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070b08; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ecfdf5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b08; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #121c15; border: 1px solid #1a3321; border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #047857); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">
                🧠
              </div>
              <h1 style="margin: 14px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Second Brain</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Confirm your email address</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Hello <strong style="color: #6ee7b7;">@${username}</strong>! Thank you for joining Second Brain. Please enter the verification code below to activate your account.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 0;">
              <div style="display: inline-block; background-color: #09120b; border: 1.5px dashed #10b981; border-radius: 14px; padding: 16px 36px; letter-spacing: 10px; font-size: 32px; font-weight: 800; font-family: monospace; color: #10b981; text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);">
                ${otpCode}
              </div>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">
                This code will expire in <strong>15 minutes</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #1a3321; padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b7280;">
                If you did not request this email, no further action is required. Your email remains safe.
              </p>
              <p style="margin: 14px 0 0 0; font-size: 11px; color: #4b5563;">
                © ${new Date().getFullYear()} Second Brain • Personal Knowledge Base
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const plainText = `Second Brain - Email Verification\n\nHello @${username},\n\nYour 6-digit verification code is:\n${otpCode}\n\nThis code expires in 15 minutes.\n\nIf you did not create a Second Brain account, please disregard this email.\n© ${new Date().getFullYear()} Second Brain`.trim();

  try {
    return await sendMail({
      to: toEmail,
      subject: `${otpCode} is your Second Brain verification code`,
      html: htmlContent,
      text: plainText,
    });
  } catch (error) {
    console.error("[Mailer] Failed to send verification email:", error);
    return false;
  }
}

/**
 * Send an anti-spam optimized password reset email with a 6-digit OTP code
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  username: string,
  resetCode: string
): Promise<boolean> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Second Brain password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070b08; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ecfdf5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b08; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #121c15; border: 1px solid #1a3321; border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #047857); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">
                🔑
              </div>
              <h1 style="margin: 14px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Second Brain</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Password Reset Request</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Hello <strong style="color: #6ee7b7;">@${username}</strong>, we received a request to reset the password for your Second Brain account. Use the code below to complete the reset:
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 0;">
              <div style="display: inline-block; background-color: #09120b; border: 1.5px dashed #10b981; border-radius: 14px; padding: 16px 36px; letter-spacing: 10px; font-size: 32px; font-weight: 800; font-family: monospace; color: #10b981; text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);">
                ${resetCode}
              </div>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">
                This code will expire in <strong>15 minutes</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #1a3321; padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b7280;">
                If you did not request a password reset, please ignore this email. Your current password remains secure and unchanged.
              </p>
              <p style="margin: 14px 0 0 0; font-size: 11px; color: #4b5563;">
                © ${new Date().getFullYear()} Second Brain • Personal Knowledge Base
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const plainText = `Second Brain - Password Reset Request\n\nHello @${username},\n\nYour 6-digit password reset code is:\n${resetCode}\n\nThis code expires in 15 minutes.\n\nIf you did not request a password reset, please disregard this email.\n© ${new Date().getFullYear()} Second Brain`.trim();

  try {
    return await sendMail({
      to: toEmail,
      subject: `${resetCode} is your Second Brain password reset code`,
      html: htmlContent,
      text: plainText,
    });
  } catch (error) {
    console.error("[Mailer] Failed to send password reset email:", error);
    return false;
  }
}

/**
 * Send a bug report email to the admin inbox
 */
export async function sendBugReportEmail(opts: {
  category: string;
  title: string;
  description: string;
  username: string;
  userEmail: string;
}): Promise<boolean> {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "secondbrain.in.app@gmail.com";

  const categoryLabels: Record<string, string> = {
    ui: "UI / Visual glitch",
    auth: "Login / Signup issue",
    content: "Content not saving / loading",
    performance: "Slow / performance issue",
    other: "Other",
  };
  const categoryLabel = categoryLabels[opts.category] ?? opts.category;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bug Report – Second Brain</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070b08; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ecfdf5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b08; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #121c15; border: 1px solid #1a3321; border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; box-shadow: 0 0 20px rgba(245,158,11,0.4);">
                🐛
              </div>
              <h1 style="margin: 14px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Bug Report</h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #6b7280;">Second Brain · Internal Report</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d150f; border: 1px solid #1e3424; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e3424;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Category</span>
                    <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #f59e0b;">${categoryLabel}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e3424;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Reported by</span>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6ee7b7;">@${opts.username} &lt;${opts.userEmail}&gt;</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e3424;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Title</span>
                    <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #ffffff;">${opts.title}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Description</span>
                    <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.7; color: #d1d5db; white-space: pre-wrap;">${opts.description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #1a3321; padding-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #4b5563;">
                © ${new Date().getFullYear()} Second Brain · Auto-generated bug report
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const plainText = `Bug Report – Second Brain\n\nCategory: ${categoryLabel}\nReported by: @${opts.username} <${opts.userEmail}>\nTitle: ${opts.title}\n\nDescription:\n${opts.description}\n\n---\n© ${new Date().getFullYear()} Second Brain`;

  try {
    return await sendMail({
      to: ADMIN_EMAIL,
      subject: `[Bug · ${categoryLabel}] ${opts.title}`,
      html: htmlContent,
      text: plainText,
    });
  } catch (error) {
    console.error("[Mailer] Failed to send bug report email:", error);
    return false;
  }
}

