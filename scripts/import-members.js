/**
 * Batch Member & Payment Importer for CitiPay
 * Imports members parsed from 'Members payment.xlsx' into Supabase
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env manually
try {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        process.env[match[1].trim()] = match[2].trim()
      }
    }
  }
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mniqlwpqiladgqqcfzzp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_KEY) {
  console.error('Error: Supabase API Key is missing in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const CLUB_ID = '11111111-1111-1111-1111-111111111111'

async function runImport() {
  console.log('='.repeat(65))
  console.log('CITIPAY — IMPORTING EXCEL ROSTER & PAYMENTS INTO SUPABASE')
  console.log('='.repeat(65))

  const dataPath = path.resolve(process.cwd(), 'supabase/members_data.json')
  if (!fs.existsSync(dataPath)) {
    console.error('Missing supabase/members_data.json')
    process.exit(1)
  }

  const members = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  console.log(`Loaded ${members.length} members from JSON extraction.`)

  // 1. Ensure Ikoyi Sunday League exists
  console.log('\n[1/5] Ensuring Ikoyi Sunday League exists...')
  const { error: clubErr } = await supabase.from('clubs').upsert({
    id: CLUB_ID,
    name: 'Ikoyi Sunday League',
    slug: 'ikoyi-sunday-league',
    code: 'ISL',
    logo_url: '/crests/sunday-league-fc.svg',
    primary_color: '#2563EB',
    secondary_color: '#DC2626',
    membership_fee: 80000.00,
    monthly_social_dues: 5000.00
  }, { onConflict: 'id' })

  if (clubErr) console.warn('Club upsert note:', clubErr.message)
  else console.log('✅ Ikoyi Sunday League club record verified.')

  // 2. Insert Profiles
  console.log('\n[2/5] Upserting Profiles...')
  let profileSuccess = 0
  for (const m of members) {
    // Generate simple deterministic code
    const clean = m.name.toUpperCase().replace(/[^A-Z]/g, '')
    const code = (clean.padEnd(5, 'X')).slice(0, 5)
    const memberId = m.name.toLowerCase() === 'esu' ? 'SL-8K4P2' : (m.name.toLowerCase() === 'david' ? 'SL-3M7R9' : `SL-${code}`)

    const { error: pErr } = await supabase.from('profiles').upsert({
      member_id: memberId,
      email: m.email,
      full_name: m.name,
      nickname: m.name,
      role: 'member',
      club_id: CLUB_ID,
      eligibility_status: m.eligibility_status,
      account_status: 'active'
    }, { onConflict: 'member_id' })

    if (pErr) {
      console.warn(`  ⚠️ Profile ${m.name}:`, pErr.message)
    } else {
      profileSuccess++
    }
  }
  console.log(`✅ ${profileSuccess}/${members.length} profiles upserted successfully.`)

  // 3. Insert Payment Plans
  console.log('\n[3/5] Syncing Payment Plans...')
  let planSuccess = 0
  for (const m of members) {
    const clean = m.name.toUpperCase().replace(/[^A-Z]/g, '')
    const code = (clean.padEnd(5, 'X')).slice(0, 5)
    const memberId = m.name.toLowerCase() === 'esu' ? 'SL-8K4P2' : (m.name.toLowerCase() === 'david' ? 'SL-3M7R9' : `SL-${code}`)

    const { data: prof } = await supabase.from('profiles').select('id').eq('member_id', memberId).single()
    if (!prof) continue

    const total = m.quarterly_fee
    const paid = Math.max(0, total - m.debt)
    const status = m.debt >= total ? 'unpaid' : (m.debt > 0 ? 'partially_paid' : 'fully_paid')

    const { error: plErr } = await supabase.from('payment_plans').upsert({
      user_id: prof.id,
      club_id: CLUB_ID,
      season: '2026/2027',
      title: '2026 Membership Subscription',
      total_amount: total,
      amount_paid: paid,
      status: status,
      next_due_date: '2026-10-30'
    })

    if (!plErr) planSuccess++
  }
  console.log(`✅ ${planSuccess} payment plans synced.`)

  // 4. Record Audit Log
  console.log('\n[4/5] Logging Audit Entry...')
  await supabase.from('audit_logs').insert({
    actor_name: 'Database Importer',
    actor_role: 'Super Admin',
    action: 'BULK_IMPORT',
    reason: `Imported ${members.length} members from Members payment.xlsx into Sunday League FC`,
    details: { total_members: members.length, source: 'Members payment.xlsx' }
  })
  console.log('✅ Audit trail recorded.')

  console.log('\n' + '='.repeat(65))
  console.log('🎉 EXCEL ROSTER IMPORT COMPLETE!')
  console.log('='.repeat(65))
}

runImport().catch(console.error)
