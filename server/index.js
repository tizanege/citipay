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
  const target = recipientEmail || 'wigglemeddle@gmail.com'

  const testPayload = {
    to: target,
    subject: `⚽ CitiPay Mailer Test (${(providerOverride || 'Current Provider').toUpperCase()})`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border-radius: 12px; border: 1px solid #10b981; max-width: 500px;">
        <h2 style="color: #0f172a; margin-top: 0;">CitiPay Mailer Test Successful!</h2>
        <p style="color: #475569; font-size: 13px;">This test confirms that your outbound email integration is operational.</p>
        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; font-family: monospace;">
          Provider: ${providerOverride || 'Default Config'}<br/>
          Timestamp: ${new Date().toISOString()}<br/>
          Recipient: ${target}
        </div>
      </div>
    `,
    text: `CitiPay Mailer test successful at ${new Date().toISOString()}`
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
