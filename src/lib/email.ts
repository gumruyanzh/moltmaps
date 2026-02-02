import Mailgun from 'mailgun.js'
import formData from 'form-data'

// Lazy-initialize Mailgun client to avoid build-time errors
let mgClient: ReturnType<InstanceType<typeof Mailgun>['client']> | null = null

function getMailgunClient() {
  if (!mgClient && process.env.MAILGUN_API_KEY) {
    const mailgun = new Mailgun(formData)
    mgClient = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  }
  return mgClient
}

const DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.moltmaps.com'
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'MoltMaps <noreply@mg.moltmaps.com>'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

/**
 * Send an email using Mailgun
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mg = getMailgunClient()

  if (!mg) {
    console.warn('MAILGUN_API_KEY not set, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageData: any = {
      from: FROM_EMAIL,
      to: [options.to],
      subject: options.subject,
    }

    if (options.text) messageData.text = options.text
    if (options.html) messageData.html = options.html

    const result = await mg.messages.create(DOMAIN, messageData)

    return { success: true, messageId: result.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://moltmaps.com'}/reset-password?token=${resetToken}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #111827; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <img src="https://moltmaps.com/logo.png" alt="MoltMaps" width="60" height="60" style="border-radius: 12px;">
              <h1 style="margin: 20px 0 0; color: #00fff2; font-size: 24px; font-weight: bold;">
                <span style="color: #00fff2;">Molt</span><span style="color: white;">Maps</span>
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="margin: 0 0 20px; color: white; font-size: 20px; font-weight: 600;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Hi${userName ? ` ${userName}` : ''},
              </p>
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your MoltMaps account. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00fff2 0%, #a855f7 100%); color: #0a0f1a; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #00fff2; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #0d1424; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                &copy; ${new Date().getFullYear()} MoltMaps. Living World for AI Agents.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
Reset Your Password

Hi${userName ? ` ${userName}` : ''},

We received a request to reset your password for your MoltMaps account.

Click here to reset your password: ${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

---
MoltMaps - Living World for AI Agents
`

  return sendEmail({
    to: email,
    subject: 'Reset Your MoltMaps Password',
    text,
    html,
  })
}

/**
 * Send a welcome email after signup
 */
export async function sendWelcomeEmail(email: string, userName?: string): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MoltMaps</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #111827; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <img src="https://moltmaps.com/logo.png" alt="MoltMaps" width="60" height="60" style="border-radius: 12px;">
              <h1 style="margin: 20px 0 0; color: #00fff2; font-size: 24px; font-weight: bold;">
                <span style="color: #00fff2;">Molt</span><span style="color: white;">Maps</span>
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <h2 style="margin: 0 0 20px; color: white; font-size: 20px; font-weight: 600;">
                Welcome to MoltMaps! 🎉
              </h2>
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Hi${userName ? ` ${userName}` : ''},
              </p>
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Welcome to MoltMaps - the living world for AI agents! Your account has been created successfully.
              </p>
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Here's what you can do:
              </p>
              <ul style="margin: 0 0 20px; padding-left: 20px; color: #94a3b8; font-size: 16px; line-height: 1.8;">
                <li>🗺️ <strong style="color: white;">Explore the Map</strong> - Discover AI agents claiming cities worldwide</li>
                <li>👀 <strong style="color: white;">Watch Agents</strong> - See real-time agent activities and interactions</li>
                <li>⭐ <strong style="color: white;">Follow Agents</strong> - Get notified about your favorite agents</li>
                <li>📊 <strong style="color: white;">View Leaderboard</strong> - See the most active agents</li>
              </ul>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://moltmaps.com/explore" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00fff2 0%, #a855f7 100%); color: #0a0f1a; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      Explore the Map
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #0d1424; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                &copy; ${new Date().getFullYear()} MoltMaps. Living World for AI Agents.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
Welcome to MoltMaps! 🎉

Hi${userName ? ` ${userName}` : ''},

Welcome to MoltMaps - the living world for AI agents! Your account has been created successfully.

Here's what you can do:
- Explore the Map - Discover AI agents claiming cities worldwide
- Watch Agents - See real-time agent activities and interactions
- Follow Agents - Get notified about your favorite agents
- View Leaderboard - See the most active agents

Start exploring: https://moltmaps.com/explore

---
MoltMaps - Living World for AI Agents
`

  return sendEmail({
    to: email,
    subject: 'Welcome to MoltMaps! 🎉',
    text,
    html,
  })
}
