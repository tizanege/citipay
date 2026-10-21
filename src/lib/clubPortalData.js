// =========================================================
// Citi Football — Club Payment Portal Data Store
// Base configuration and types
// =========================================================

export const initialClubs = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Sunday League FC',
    slug: 'sunday-league-fc',
    code: 'SLFC',
    tagline: 'Premier Recreational & Competitive Football Club',
    logo_url: '/crests/sunday-league-fc.svg',
    primary_color: '#2563EB',
    secondary_color: '#DC2626',
    accent_color: '#FFFFFF',
    stadium: 'Campos Memorial Mini Stadium, Lagos Island',
    city: 'Lagos',
    country: 'Nigeria',
    founded_year: 2021,
    membership_fee: 100000,
    monthly_social_dues: 5000,
    max_installments: 2,
    status: 'active'
  }
]

export const initialClubRules = {
  club_id: '11111111-1111-1111-1111-111111111111',
  green_max_balance: 0,
  yellow_max_balance: 20000,
  yellow_due_days_window: 14,
  red_min_balance: 20001,
  red_overdue_days_threshold: 14,
  require_social_dues_current: true,
  last_updated: new Date().toISOString(),
  updated_by: 'President'
}

export const CORE_MEMBER_IDS = {}

// Emptied mock data arrays - Populated dynamically from Supabase
export const initialMembers = []
export const initialTransactions = []
export const initialAuditLogs = []

// Matchday Availability Template
export const initialAvailability = {
  gameweek: 'GAMEWEEK 14',
  fixture: 'Sunday League FC vs Scheduled Opponent',
  date: 'Saturday, 04 Oct 2026 · 16:00 WAT',
  venue: 'Campos Memorial Mini Stadium, Lagos Island',
  user_vote: null, // 'yes' | 'maybe' | 'no'
  roster: {
    yes: 0,
    maybe: 0,
    no: 0
  }
}

// Global League & Apparel Settings
export const initialLeagueSettings = {
  current_matchday: 14,
  total_matchdays: 38,
  season_title: 'Championship 2026/27',
  competition_name: 'Citi Football Premier Championship',
  jersey_price: 18000,
  bib_price: 6500,
  currency: 'NGN',
  last_updated: new Date().toISOString(),
  updated_by: 'Super Admin'
}
