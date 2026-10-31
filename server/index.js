import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const CONFIG_FILE = path.join(__dirname, 'mail-config.json')

// Helper: load mail config (stored on disk or fallback to env)
function getMailConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      return {
        provider: saved.provider || process.env.MAIL_PROVIDER || 'resend',
        resendApiKey: saved.resendApiKey || process.env.RESEND_API_KEY || '',
        fromEmail: saved.fromEmail || process.env.MAIL_FROM_EMAIL || 'CitiPay Portal <onboarding@resend.dev>',
        smtp: {
          host: saved.smtp?.host || process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(saved.smtp?.port || process.env.SMTP_PORT || 465),
          secure: saved.smtp?.secure !== undefined ? saved.smtp.secure : (process.env.SMTP_SECURE === 'true' || true),
          user: saved.smtp?.user || process.env.SMTP_USER || '',
          pass: saved.smtp?.pass || process.env.SMTP_PASS || '',
          fromName: saved.smtp?.fromName || process.env.SMTP_FROM_NAME || 'CitiLeague Administration'
        },
        notificationOptions: {
          notifyOnRegistration: saved.notificationOptions?.notifyOnRegistration ?? true,
          notifyOnPaymentReceipt: saved.notificationOptions?.notifyOnPaymentReceipt ?? true,
          notifyOnPaymentReminder: saved.notificationOptions?.notifyOnPaymentReminder ?? true,
          notifyOnPasswordReset: saved.notificationOptions?.notifyOnPasswordReset ?? true,
          notifyOnIslCupEntry: saved.notificationOptions?.notifyOnIslCupEntry ?? true,
          adminAlertEmail: saved.notificationOptions?.adminAlertEmail || process.env.ADMIN_ALERT_EMAIL || 'admin@citileague.ng'
        }
      }
    }
  } catch (err) {
    console.warn('Could not read mail-config.json:', err.message)
  }

  return {
    provider: process.env.MAIL_PROVIDER || 'resend',
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.MAIL_FROM_EMAIL || 'CitiPay Portal <onboarding@resend.dev>',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === 'true' || true,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      fromName: process.env.SMTP_FROM_NAME || 'CitiLeague Administration'
    },
    notificationOptions: {
      notifyOnRegistration: true,
      notifyOnPaymentReceipt: true,
      notifyOnPaymentReminder: true,
      notifyOnPasswordReset: true,
      notifyOnIslCupEntry: true,
      adminAlertEmail: process.env.ADMIN_ALERT_EMAIL || 'admin@citileague.ng'
    }
  }
}

function saveMailConfig(newConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Failed to write mail-config.json:', err)
    return false
  }
}

// 1. Health check
app.get('/api/health', (req, res) => {
  const config = getMailConfig()
  res.json({
    status: 'ok',
    service: 'citipay-email-service',
    activeProvider: config.provider,
    smtpConfigured: Boolean(config.smtp.user && config.smtp.pass),
    resendConfigured: Boolean(config.resendApiKey),
    timestamp: new Date().toISOString()
  })
})

// 2. Get Mailer Configuration
app.get('/api/mail-config', (req, res) => {
  const config = getMailConfig()
  // Mask secrets before returning
  res.json({
    provider: config.provider,
    fromEmail: config.fromEmail,
    resendApiKey: config.resendApiKey ? `${config.resendApiKey.slice(0, 6)}...${config.resendApiKey.slice(-4)}` : '',
    hasResendKey: Boolean(config.resendApiKey),
    smtp: {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      user: config.smtp.user,
      hasPass: Boolean(config.smtp.pass),
      fromName: config.smtp.fromName
    },
    notificationOptions: config.notificationOptions
  })
})

// 3. Update Mailer Configuration
app.post('/api/mail-config', (req, res) => {
  try {
    const current = getMailConfig()
    const { provider, resendApiKey, fromEmail, smtp, notificationOptions } = req.body

    const updated = {
      ...current,
      provider: provider || current.provider,
      resendApiKey: resendApiKey !== undefined && resendApiKey !== '' && !resendApiKey.includes('...') ? resendApiKey : current.resendApiKey,
      fromEmail: fromEmail || current.fromEmail,
      smtp: {
        ...current.smtp,
        ...(smtp || {}),
        pass: (smtp?.pass && !smtp.pass.includes('•••')) ? smtp.pass : current.smtp.pass
      },
      notificationOptions: {
        ...current.notificationOptions,
        ...(notificationOptions || {})
      }
    }

    saveMailConfig(updated)
    return res.json({ success: true, message: 'Mail configuration saved successfully.' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// 4. Send Test Email
app.post('/api/send-test-email', async (req, res) => {
  const { recipientEmail, providerOverride } = req.body
  const target = recipientEmail || 'support@citifootypay.club'

  const testPayload = {
    to: target,
    subject: `⚽ CitiPay Mailer Test (${(providerOverride || 'SMTP').toUpperCase()}) — Verification Confirmed`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 32px 16px; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 28px 32px; border-bottom: 3px solid #10b981;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">CitiPay Portal</div>
                    <div style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Citi Football Federation · Outbound Mailer</div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">✓ Connected</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="margin-bottom: 20px;">
                <h2 style="font-size: 19px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.3px;">Outbound Email Service Verified</h2>
                <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0;">
                  This is a test message to confirm that your SMTP and transactional mail dispatch pipeline is fully operational. Matchday eligibility updates, receipts, and login credentials will deliver through this channel.
                </p>
              </div>

              <!-- Diagnostic Info Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Active Provider:</td>
                        <td align="right" style="font-size: 12px; font-weight: 700; color: #0f172a; font-family: monospace; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">${(providerOverride || 'Hostinger SMTP').toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Recipient Address:</td>
                        <td align="right" style="font-size: 12px; font-weight: 700; color: #0f172a; font-family: monospace; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">${target}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Server Host:</td>
                        <td align="right" style="font-size: 12px; font-weight: 700; color: #0f172a; font-family: monospace; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">smtp.hostinger.com:465</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding: 6px 0;">Dispatched At:</td>
                        <td align="right" style="font-size: 11px; font-weight: 600; color: #475569; padding: 6px 0;">${new Date().toUTCString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://citifootypay.club/admin/dashboard" target="_blank" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                  Open Super Admin Portal &rarr;
                </a>
              </div>

              <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0; text-align: center;">
                Automated test verification dispatched by CitiPay Mailer daemon on Hostinger VPS.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} CitiPay · Ikoyi Sunday League & Citi Football Federation HQ
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `CitiPay Mailer test successful at ${new Date().toISOString()} via ${(providerOverride || 'Hostinger SMTP').toUpperCase()} to ${target}`
  }

  const result = await dispatchEmail(testPayload, providerOverride)
  if (result.success) {
    return res.json({ success: true, message: `Test email successfully sent to ${target}`, details: result })
  } else {
    return res.status(400).json({ success: false, error: result.error || 'Failed to dispatch test email' })
  }
})

// 5. Core Dispatcher: Resend vs SMTP vs Simulation
async function dispatchEmail({ to, subject, html, text, fromName }, providerOverride = null) {
  const config = getMailConfig()
  const activeProvider = providerOverride || config.provider || 'resend'
  const recipientList = Array.isArray(to) ? to : [to]

  // --- PATH A: SMTP (Nodemailer) ---
  if (activeProvider === 'smtp') {
    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
      console.warn('[SMTP] Host, User, or Pass missing. Simulating delivery.')
      return {
        success: true,
        simulated: true,
        provider: 'smtp',
        message: 'Simulated SMTP delivery. Please complete SMTP configuration in Admin Settings.'
      }
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465, // true for 465, false for 587/25
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        }
      })

      const senderAddress = `"${config.smtp.fromName || fromName || 'CitiPay'}" <${config.smtp.user}>`

      const info = await transporter.sendMail({
        from: senderAddress,
        to: recipientList.join(', '),
        subject,
        html,
        text
      })

      console.log(`[SMTP] Dispatched to ${recipientList.join(', ')} (Message ID: ${info.messageId})`)
      return { success: true, provider: 'smtp', messageId: info.messageId }
    } catch (err) {
      console.error('[SMTP Send Error]', err)
      return { success: false, error: `SMTP Error: ${err.message}` }
    }
  }

  // --- PATH B: RESEND API ---
  if (activeProvider === 'resend') {
    if (!config.resendApiKey) {
      console.warn('[Resend] API Key missing. Simulating delivery to:', recipientList.join(', '))
      return {
        success: true,
        simulated: true,
        provider: 'resend',
        message: 'Simulated Resend delivery. Please configure RESEND_API_KEY.'
      }
    }

    try {
      const sender = config.fromEmail || 'CitiPay Portal <onboarding@resend.dev>'
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: sender,
          to: recipientList,
          subject,
          html,
          text
        })
      })

      const data = await response.json()
      if (!response.ok) {
        console.error('[Resend Error]', data)
        return { success: false, error: data.message || 'Resend API rejected message' }
      }

      console.log(`[Resend] Dispatched to ${recipientList.join(', ')} (ID: ${data.id})`)
      return { success: true, provider: 'resend', data }
    } catch (err) {
      console.error('[Resend Request Error]', err)
      return { success: false, error: `Resend Error: ${err.message}` }
    }
  }

  // Fallback Simulation
  return {
    success: true,
    simulated: true,
    provider: activeProvider,
    message: 'Simulated delivery.'
  }
}

// 6. Generic Dispatch Endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, fromName, provider } = req.body

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required email fields (to, subject, html/text).' })
    }

    const result = await dispatchEmail({ to, subject, html, text, fromName }, provider)
    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    return res.json(result)
  } catch (error) {
    console.error('[Dispatch Exception]', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`[CitiPay Mailer] Service listening on port ${PORT}`)
})
