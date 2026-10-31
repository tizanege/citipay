/**
 * CitiPay Email Notification Service (Powered by Resend)
 */

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

/**
 * Dispatch an email through the CitiPay Resend Mailer service
 */
export async function sendEmailNotification({ to, subject, html, text, fromName }) {
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
        fromName
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
 * Format and send official Player Login Credentials Email
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
 * Format and send ISL Cup Finals 2026 Team Entry Confirmation Email
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
