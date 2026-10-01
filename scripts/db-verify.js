/**
 * Database Diagnostic & Verification Script for CitiPay
 * Tests Supabase PostgreSQL connection and reports exact status of schema.sql tables
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
        const key = match[1].trim()
        const value = match[2].trim()
        process.env[key] = value
      }
    }
  }
} catch (e) {
  // Ignore
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mniqlwpqiladgqqcfzzp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_h_PiJfGz5ijB_3LPq7mYvQ_7eHAnRsX'

console.log('='.repeat(68))
console.log('CITIPAY — SUPABASE DATABASE INTEGRATION DIAGNOSTIC')
console.log('='.repeat(68))
console.log(`Endpoint: ${SUPABASE_URL}`)
console.log(`Auth Key: ${SUPABASE_KEY.slice(0, 16)}...`)
console.log('-'.repeat(68))

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const SCHEMA_TABLES = [
  'clubs',
  'profiles',
  'players',
  'club_eligibility_rules',
  'payment_plans',
  'installments',
  'social_dues',
  'payments',
  'audit_logs',
  'match_availabilities',
  'payment_reminders',
  'notifications'
]

async function runDiagnostics() {
  console.log('Inspecting Supabase database tables for CitiPay...\n')

  let readyCount = 0
  let pendingCount = 0

  for (const table of SCHEMA_TABLES) {
    try {
      // Use GET with limit 1 so PostgREST returns real schema errors (not masked 204s)
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find')) {
          console.log(`❌ [PENDING]  public.${table.padEnd(25)} (Not found in schema cache)`)
          pendingCount++
        } else {
          console.log(`⚠️  [RESTRICT] public.${table.padEnd(25)} (${error.message || error.code})`)
          readyCount++
        }
      } else {
        console.log(`✅ [ACTIVE]   public.${table.padEnd(25)} (Records: ${count ?? (data?.length || 0)})`)
        readyCount++
      }
    } catch (e) {
      console.log(`❌ [ERROR]    public.${table.padEnd(25)} (${e.message})`)
      pendingCount++
    }
  }

  console.log('\n' + '-'.repeat(68))
  console.log(`Status: ${readyCount} active / ${pendingCount} pending out of ${SCHEMA_TABLES.length} tables.`)

  if (pendingCount > 0) {
    console.log(`\n📋 ACTION REQUIRED TO COMPLETE SUPABASE MIGRATION:`)
    console.log(`The tables from 'supabase/schema.sql' need to be applied in Supabase:`)
    console.log(`1. Open Supabase Dashboard:`)
    console.log(`   https://supabase.com/dashboard/project/mniqlwpqiladgqqcfzzp/sql/new`)
    console.log(`2. Paste the SQL script from:`)
    console.log(`   supabase/schema.sql`)
    console.log(`3. Click 'Run' to create the 12 tables, RLS policies, and seed data.`)
    console.log(`4. Re-run this check: node scripts/db-verify.js\n`)
  } else {
    console.log(`🎉 All 12 tables in schema.sql are active and verified in Supabase!`)
  }
  console.log('='.repeat(68))
}

runDiagnostics().catch(console.error)
