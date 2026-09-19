import dns from "dns";
import nodemailer, { SendMailOptions, SentMessageInfo } from "nodemailer";
import crypto from "crypto";

// Force IPv4 resolution to prevent ENETUNREACH in IPv6-unreachable cloud environments (e.g. Render)
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

function createTransporter(port: number, secure: boolean) {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: secure,
    family: 4, // CRITICAL FOR RENDER: forces IPv4 to eliminate ENETUNREACH on IPv6
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS?.replace(/\s+/g, ""), // Strip whitespace from App Passwords
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  } as any);
}

const defaultPort = Number(process.env.SMTP_PORT) || 465;
const defaultSecure = process.env.SMTP_PORT === "587" ? false : true;
const primaryTransporter = createTransporter(defaultPort, defaultSecure);

async function sendMailWithFallback(mailOptions: SendMailOptions): Promise<SentMessageInfo> {
  try {
    return await primaryTransporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error(`[Mailer] Primary send (port ${defaultPort}) failed:`, error?.message || error);

    // If port 465 failed due to connection/socket/network issue, try port 587 with STARTTLS
    if (defaultPort === 465) {
      console.log("[Mailer] Attempting fallback to port 587 (STARTTLS IPv4)...");
      try {
        const fallbackTransporter = createTransporter(587, false);
        return await fallbackTransporter.sendMail(mailOptions);
      } catch (fallbackError: any) {
        console.error("[Mailer] Fallback send (port 587) also failed:", fallbackError?.message || fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
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
  const senderEmail = process.env.SMTP_USER || "no-reply@secondbrain.app";
  const fromName = process.env.EMAIL_FROM_NAME || "Second Brain";
  const fromHeader = `"${fromName}" <${senderEmail}>`;

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
        <!-- Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #121c15; border: 1px solid #1a3321; border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #047857); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">
                🧠
              </div>
              <h1 style="margin: 14px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Second Brain</h1>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding-bottom: 20px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Confirm your email address</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Hello <strong style="color: #6ee7b7;">@${username}</strong>! Thank you for joining Second Brain. Please enter the verification code below to activate your account.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
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

          <!-- Security Notice -->
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
</html>
  `.trim();

  // Plain-text alternative (crucial for spam filters)
  const plainTextContent = `
Second Brain - Email Verification

Hello @${username},

Your 6-digit verification code is:
${otpCode}

This code expires in 15 minutes.

If you did not create a Second Brain account, please disregard this email.
© ${new Date().getFullYear()} Second Brain
  `.trim();

  try {
    const info = await sendMailWithFallback({
      from: fromHeader,
      to: toEmail,
      subject: `${otpCode} is your Second Brain verification code`,
      text: plainTextContent,
      html: htmlContent,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
      },
    });

    console.log(`[Mailer] Verification email sent to ${toEmail}. MessageId: ${info.messageId}`);
    return true;
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
  const senderEmail = process.env.SMTP_USER || "no-reply@secondbrain.app";
  const fromName = process.env.EMAIL_FROM_NAME || "Second Brain";
  const fromHeader = `"${fromName}" <${senderEmail}>`;

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
        <!-- Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #121c15; border: 1px solid #1a3321; border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #047857); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">
                🔑
              </div>
              <h1 style="margin: 14px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Second Brain</h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom: 20px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Password Reset Request</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Hello <strong style="color: #6ee7b7;">@${username}</strong>, we received a request to reset the password for your Second Brain account. Use the code below to complete the reset:
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
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

          <!-- Security Notice -->
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
</html>
  `.trim();

  const plainTextContent = `
Second Brain - Password Reset Request

Hello @${username},

Your 6-digit password reset code is:
${resetCode}

This code expires in 15 minutes.

If you did not request a password reset, please disregard this email. Your account remains secure.
© ${new Date().getFullYear()} Second Brain
  `.trim();

  try {
    const info = await sendMailWithFallback({
      from: fromHeader,
      to: toEmail,
      subject: `${resetCode} is your Second Brain password reset code`,
      text: plainTextContent,
      html: htmlContent,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
      },
    });

    console.log(`[Mailer] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Failed to send password reset email:", error);
    return false;
  }
}

