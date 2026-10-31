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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 32px 16px; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <tr>
          <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; opacity: 0.9; margin-bottom: 6px;">CitiPay Official Settlement Receipt</div>
            <div style="font-size: 36px; font-weight: 900; font-family: monospace; letter-spacing: -1px; margin: 6px 0;">₦${Number(amount).toLocaleString()}</div>
            <span style="display: inline-block; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.35); padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700;">✓ Payment Verified & Settled</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 28px;">
            <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: #0f172a;">Received from ${memberName}</h3>
            <p style="font-size: 13px; color: #64748b; margin: 0 0 24px 0; line-height: 1.5;">
              Thank you for your payment to <strong>${club}</strong>. Your dues balance and matchday clearance have been updated across the federation roster.
            </p>

            <!-- Receipt Breakdown Table -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Receipt Number:</td>
                      <td align="right" style="font-size: 12px; font-weight: 800; font-family: monospace; color: #0f172a; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">${receiptNo || 'REC-VERIFIED'}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Reference / Tx ID:</td>
                      <td align="right" style="font-size: 12px; font-weight: 700; font-family: monospace; color: #0f172a; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">${reference}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Payment Category:</td>
                      <td align="right" style="font-size: 12px; font-weight: 700; color: #0f172a; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">${description}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Settlement Channel:</td>
                      <td align="right" style="font-size: 12px; font-weight: 600; color: #047857; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">${paymentMethod || 'Direct Bank Transfer'}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0;">Settlement Date:</td>
                      <td align="right" style="font-size: 12px; font-weight: 600; color: #0f172a; padding: 7px 0;">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://citifootypay.club/history" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 10px;">
                View Official Ledger & History &rarr;
              </a>
            </div>

            <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0; text-align: center;">
              This is an automated legal transaction receipt issued under the authority of Citi Football Federation HQ.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background: #f8fafc; padding: 20px 28px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
            &copy; ${new Date().getFullYear()} ${club} · Powered by CitiPay
          </td>
        </tr>
      </table>
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
  const isPaid = team.paymentStatus === 'Paid'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 32px 16px; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <tr>
          <td style="background: linear-gradient(135deg, #09090b 0%, #1c1917 100%); padding: 32px 28px; border-bottom: 3px solid #f59e0b;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size: 21px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">🏆 ISL CUP FINALS 2026</div>
                  <div style="font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">₦2,800,000 Grand Championship Prize Pool</div>
                </td>
                <td align="right">
                  <span style="background: ${isPaid ? '#065f46' : '#78350f'}; border: 1px solid ${isPaid ? '#10b981' : '#f59e0b'}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase;">
                    ${isPaid ? '✓ SETTLED' : '⏳ PENDING APPROVAL'}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 32px 28px;">
            <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
              Team Entry: ${team.teamName}
            </h2>
            <p style="font-size: 13px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
              Your squad has officially claimed a registration slot in the <strong>ISL Cup Finals 2026</strong>. Review your team dossier, coach allocation, and VIP passes below:
            </p>

            <!-- Specification Card -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Registered Team:</td>
                      <td align="right" style="font-size: 13px; font-weight: 800; color: #0f172a; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">${team.teamName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Head Coach:</td>
                      <td align="right" style="font-size: 12px; font-weight: 700; color: #0f172a; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">${team.coachName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Team Captain:</td>
                      <td align="right" style="font-size: 12px; font-weight: 700; color: #0f172a; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">${team.captainName}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">VIP Spectators:</td>
                      <td align="right" style="font-size: 12px; font-weight: 600; color: #0f172a; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">
                        1. ${team.vipSpectator1 || 'Designated VIP 1'}<br/>
                        2. ${team.vipSpectator2 || 'Designated VIP 2'}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">Entry Settlement:</td>
                      <td align="right" style="font-size: 14px; font-weight: 900; font-family: monospace; color: #059669; padding: 7px 0; border-bottom: 1px solid #f1f5f9;">₦300,000</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #64748b; padding: 7px 0;">Official Registration ID:</td>
                      <td align="right" style="font-size: 12px; font-weight: 700; font-family: monospace; color: #64748b; padding: 7px 0;">${team.reference || team.receipt_no || 'ISL-CONFIRMED'}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Venue & Schedule Note -->
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 700; color: #b45309; margin-bottom: 4px;">📍 Matchday & Venue Logistics</div>
              <p style="font-size: 12px; color: #78350f; margin: 0; line-height: 1.5;">
                <strong>Venue:</strong> Lagos Preparatory School, Glover Road, Ikoyi.<br/>
                <strong>Dates:</strong> Matchday 1 (Nov 22, 2026) & Grand Finale (Nov 29, 2026) · Kickoff 7:20 AM.<br/>
                VIP credentials and team kits will be accredited at the media center at 6:45 AM.
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
              <a href="https://citifootypay.club/login" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 10px;">
                View Tournament Bracket & Schedule &rarr;
              </a>
            </div>

            <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0; text-align: center;">
              Citi Football Federation · Tournament Operations & Competition Committee
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background: #f8fafc; padding: 20px 28px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
            &copy; ${new Date().getFullYear()} ISL Cup Finals 2026 · Powered by CitiPay
          </td>
        </tr>
      </table>
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
