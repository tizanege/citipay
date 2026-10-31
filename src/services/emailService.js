/**
 * CitiPay Email Notification Service (Resend + SMTP Dual Engine)
 */

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

/**
 * Dispatch an email through the CitiPay Mailer service (supports Resend or SMTP based on admin settings)
 */
export async function sendEmailNotification({ to, subject, html, text, fromName, provider }) {
  try {
    const res = await fetch(`${API_BASE}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
        fromName,
        provider
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.warn('Email dispatch warning:', errData.error || res.statusText)
      return { success: false, error: errData.error || res.statusText }
    }

    const data = await res.json()
    return data
  } catch (err) {
    console.warn('Network notice when contacting mailer service:', err.message)
    return { success: false, error: err.message, simulated: true }
  }
}

/**
 * Fetch Mailer Configuration from Server
 */
export async function getMailerConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/mail-config`)
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Could not fetch mailer config:', err.message)
  }
  return null
}

/**
 * Update Mailer Configuration (Provider, SMTP credentials, Resend key, notification toggles)
 */
export async function saveMailerConfig(configPayload) {
  try {
    const res = await fetch(`${API_BASE}/api/mail-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configPayload)
    })
    return await res.json()
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Send a Test Email to verify SMTP or Resend
 */
export async function sendTestEmail({ recipientEmail, providerOverride }) {
  try {
    const res = await fetch(`${API_BASE}/api/send-test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientEmail, providerOverride })
    })
    return await res.json()
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * 1. Player Login Credentials Email
 */
export async function sendPlayerCredentialsEmail({ player, tempPassword, pin, clubName, portalUrl }) {
  const origin = portalUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://citifootypay.club')
  const loginUrl = `${origin}/login`
  const club = clubName || 'Ikoyi Sunday League'
  const memberId = player.display_id || player.member_id || 'SL-XXXX'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #09090b; padding: 24px 32px; text-align: left; border-bottom: 2px solid #10b981; }
        .logo-title { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .logo-sub { color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 4px; }
        .body-content { padding: 32px; }
        .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; }
        .lead { font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
        .cred-box { background: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 24px; }
        .cred-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
        .cred-row:last-child { border-bottom: none; }
        .cred-label { color: #64748b; font-weight: 600; }
        .cred-val { font-family: monospace; font-weight: 800; color: #0f172a; }
        .cred-val.highlight { color: #059669; font-size: 15px; }
        .cta-btn { display: inline-block; background: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-title">CitiPay Portal</div>
          <div class="logo-sub">${club} · Official Credentials</div>
        </div>
        <div class="body-content">
          <h2 class="greeting">Hello, ${player.full_name}</h2>
          <p class="lead">Your official player profile has been registered in the CitiPay financial & matchday management platform. Use the credentials below to sign in:</p>
          
          <div class="cred-box">
            <div class="cred-row">
              <span class="cred-label">Member ID:</span>
              <span class="cred-val highlight">${memberId}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Temporary Password:</span>
              <span class="cred-val">${tempPassword}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Access PIN:</span>
              <span class="cred-val">${pin}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Affiliated Club:</span>
              <span class="cred-val">${club}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="cta-btn" target="_blank">Sign In to Player Portal &rarr;</a>
          </div>

          <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.5;">
            🔒 Security Notice: Please change your temporary password after logging in for the first time. Keep your 4-digit PIN confidential.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CitiLeague Football Federation · Powered by CitiPay
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmailNotification({
    to: player.email,
    subject: `⚽ Your CitiPay Login Credentials (${memberId}) - ${club}`,
    html,
    text: `Hello ${player.full_name},\n\nYour CitiPay portal credentials for ${club}:\n\nMember ID: ${memberId}\nTemporary Password: ${tempPassword}\nPIN: ${pin}\n\nLogin URL: ${loginUrl}\n`
  })
}

/**
 * 2. Payment Receipt Email
 */
export async function sendPaymentReceiptEmail({ recipientEmail, memberName, amount, reference, description, receiptNo, paymentMethod, clubName }) {
  const club = clubName || 'Ikoyi Sunday League'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #059669; padding: 24px 32px; color: white; text-align: center; }
        .amount { font-size: 28px; font-weight: 900; margin: 8px 0; font-family: monospace; }
        .body-content { padding: 32px; }
        .receipt-box { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Official Settlement Receipt</div>
          <div class="amount">₦${Number(amount).toLocaleString()}</div>
          <div style="font-size: 12px; opacity: 0.9;">Payment Verified & Settled</div>
        </div>
        <div class="body-content">
          <h3 style="margin: 0 0 8px 0;">Received from ${memberName}</h3>
          <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">Thank you for your payment to <strong>${club}</strong>. Details of this transaction:</p>

          <div class="receipt-box">
            <div class="receipt-row"><span>Receipt No:</span><strong>${receiptNo || 'REC-VERIFIED'}</strong></div>
            <div class="receipt-row"><span>Reference:</span><strong style="font-family: monospace;">${reference}</strong></div>
            <div class="receipt-row"><span>Category:</span><span>${description}</span></div>
            <div class="receipt-row"><span>Channel:</span><span>${paymentMethod || 'Paystack'}</span></div>
            <div class="receipt-row"><span>Date:</span><span>${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmailNotification({
    to: recipientEmail,
    subject: `🧾 Payment Receipt (₦${Number(amount).toLocaleString()}) - ${club}`,
    html,
    text: `Payment Receipt of ₦${Number(amount).toLocaleString()} confirmed for ${memberName}. Receipt: ${receiptNo}. Ref: ${reference}.`
  })
}

/**
 * 3. Payment Reminder Email
 */
export async function sendPaymentReminderEmail({ player, amountDue, dueDate, reminderType, clubName }) {
  const club = clubName || 'Ikoyi Sunday League'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #d97706; padding: 20px 28px; color: white; }
        .body-content { padding: 28px; }
        .cta-btn { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 8px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h3 style="margin: 0; font-size: 18px;">Matchday Clearance Notice</h3>
          <span style="font-size: 11px; opacity: 0.9;">${reminderType || 'Outstanding Balance Reminder'}</span>
        </div>
        <div class="body-content">
          <p style="font-size: 14px; margin: 0 0 12px 0;">Dear <strong>${player.full_name}</strong>,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            This is a friendly reminder that you have an outstanding balance of <strong style="color: #b45309;">₦${Number(amountDue).toLocaleString()}</strong> for your <strong>${club}</strong> membership dues.
          </p>
          <p style="font-size: 12px; color: #64748b;">
            To maintain your <strong>Matchday Starting XI Clearance</strong> status and avoid due flags, please settle your payment before the upcoming matchday.
          </p>
          <div style="text-align: center;">
            <a href="https://citifootypay.club/login" class="cta-btn" target="_blank">Settle Dues Online &rarr;</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmailNotification({
    to: player.email,
    subject: `⚽ Matchday Eligibility Reminder (₦${Number(amountDue).toLocaleString()}) - ${club}`,
    html,
    text: `Reminder: You have an outstanding balance of ₦${Number(amountDue).toLocaleString()} for ${club}. Please settle your balance to maintain matchday clearance.`
  })
}

/**
 * 4. Password / PIN Recovery OTP Email
 */
export async function sendPasswordResetOtpEmail({ recipientEmail, otpCode, memberName }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; text-align: center; }
        .otp { font-size: 32px; font-weight: 900; letter-spacing: 6px; font-family: monospace; color: #059669; background: #f0fdf4; border: 1px dashed #86efac; border-radius: 12px; padding: 16px; margin: 24px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="margin: 0 0 10px 0; color: #0f172a;">Password Recovery Code</h2>
        <p style="font-size: 13px; color: #475569; margin: 0;">Use the 6-digit verification code below to reset your CitiPay portal password:</p>
        <div class="otp">${otpCode}</div>
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">This passcode expires in 15 minutes. If you did not request this, please contact your club administrator.</p>
      </div>
    </body>
    </html>
  `

  return sendEmailNotification({
    to: recipientEmail,
    subject: `🔒 CitiPay Password Recovery Code: ${otpCode}`,
    html,
    text: `Your CitiPay password recovery code is ${otpCode}. It expires in 15 minutes.`
  })
}

/**
 * 5. ISL Cup Finals Team Entry Confirmation Email
 */
export async function sendIslCupEntryEmail({ team, recipientEmail }) {
  const email = recipientEmail || `${team.captainName.toLowerCase().replace(/[^a-z0-9]/g, '')}@citileague.ng`
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #09090b; padding: 24px 32px; border-bottom: 2px solid #f59e0b; }
        .logo-title { color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; }
        .badge { display: inline-block; background: #fef3c7; color: #b45309; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; margin-top: 6px; }
        .body-content { padding: 32px; }
        .cred-box { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; margin: 20px 0; }
        .cred-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-title">ISL CUP FINALS 2026</div>
          <span class="badge">Team Registration Confirmed</span>
        </div>
        <div class="body-content">
          <h2 style="margin: 0 0 10px 0; color: #0f172a;">Registration Received: ${team.teamName}</h2>
          <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">
            Your team slot has been registered for the <strong>ISL Cup Finals 2026 (₦2.8M Prize Pool)</strong> at Lagos Preparatory School, Ikoyi.
          </p>

          <div class="cred-box">
            <div class="cred-row"><span>Team Name:</span><strong>${team.teamName}</strong></div>
            <div class="cred-row"><span>Coach:</span><strong>${team.coachName}</strong></div>
            <div class="cred-row"><span>Captain:</span><strong>${team.captainName}</strong></div>
            <div class="cred-row"><span>VIP Spectators:</span><strong>${team.vipSpectator1 || 'N/A'}, ${team.vipSpectator2 || 'N/A'}</strong></div>
            <div class="cred-row"><span>Fee:</span><strong style="color: #059669;">₦300,000 (${team.paymentStatus || 'Settled'})</strong></div>
            <div class="cred-row"><span>Reference:</span><strong style="font-family: monospace;">${team.reference || 'ISL-CONFIRMED'}</strong></div>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
            VIP passes and credentials will be distributed at check-in on matchday (Nov 22 & 29, 7:20 AM).
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmailNotification({
    to: email,
    subject: `🏆 ISL Cup Finals 2026 Entry Confirmation - ${team.teamName}`,
    html,
    text: `Team ${team.teamName} is registered for ISL Cup Finals 2026. Coach: ${team.coachName}, Captain: ${team.captainName}. Amount: ₦300,000.`
  })
}
