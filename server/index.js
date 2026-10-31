import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'citipay-email-service', timestamp: new Date().toISOString() })
})

// Dispatch email via Resend
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, fromName } = req.body

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required email fields (to, subject, html/text).' })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[Resend Service] RESEND_API_KEY is not set. Simulating delivery to:', to)
      return res.json({
        success: true,
        simulated: true,
        message: 'Email simulated. Configure RESEND_API_KEY in .env for live dispatch.'
      })
    }

    const sender = process.env.RESEND_FROM_EMAIL || 'CitiPay Portal <onboarding@resend.dev>'

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Resend API Error]', data)
      return res.status(response.status).json({ error: data.message || 'Failed to dispatch email via Resend' })
    }

    return res.json({ success: true, data })
  } catch (error) {
    console.error('[Email Dispatch Error]', error)
    return res.status(500).json({ error: error.message || 'Internal server error while sending email' })
  }
})

app.listen(PORT, () => {
  console.log(`[CitiPay Mailer] Service listening on port ${PORT}`)
})
