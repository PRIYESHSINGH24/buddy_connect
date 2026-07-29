import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const EMAIL_FROM = process.env.EMAIL_FROM || "Buddy Connect <noreply@buddyconnect.app>"

/**
 * Send an email verification link.
 */
export async function sendVerificationEmail(
  to: string,
  verifyLink: string
): Promise<boolean> {
  if (!resend) {
    console.warn("Email not configured (RESEND_API_KEY missing). Verification link:", verifyLink)
    return false
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Verify your Buddy Connect email",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Buddy Connect</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 16px;">Verify your email</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Click the button below to verify your email address and complete your account setup.
            </p>
            <a href="${verifyLink}" 
               style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Verify Email
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0;">
              If you didn't create a Buddy Connect account, you can safely ignore this email.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            © ${new Date().getFullYear()} Buddy Connect. All rights reserved.
          </p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("sendVerificationEmail error:", error)
    return false
  }
}

/**
 * Send a password reset link.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<boolean> {
  if (!resend) {
    console.warn("Email not configured (RESEND_API_KEY missing). Reset link:", resetLink)
    return false
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Reset your Buddy Connect password",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Buddy Connect</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 16px;">Reset your password</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              We received a request to reset your password. Click the button below to choose a new password.
              This link expires in 1 hour.
            </p>
            <a href="${resetLink}" 
               style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Reset Password
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            © ${new Date().getFullYear()} Buddy Connect. All rights reserved.
          </p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("sendPasswordResetEmail error:", error)
    return false
  }
}
