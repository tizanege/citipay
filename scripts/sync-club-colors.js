import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function syncColors() {
  console.log('Syncing Sunday League FC brand colors in Supabase...')
  const { data, error } = await supabase
    .from('clubs')
    .update({
      primary_color: '#2563EB',
      secondary_color: '#DC2626',
      accent_color: '#FFFFFF'
    })
    .eq('slug', 'sunday-league-fc')
    .select()

  if (error) {
    console.error('Error updating club colors in Supabase:', error.message)
  } else {
    console.log('Successfully updated Sunday League FC in Supabase:', data)
  }
}

syncColors()
