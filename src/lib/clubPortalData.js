// =========================================================
// Citi Football — Club Payment Portal Data Store
// Primary Club: Sunday League FC (Multi-Club Ready)
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
    max_installments: 4,
    status: 'active'
  },
  {
    id: 'club-victoria-island',
    name: 'Victoria Island FC',
    slug: 'victoria-island-fc',
    code: 'VIFC',
    tagline: 'Island Elite Football Collective',
    logo_url: '/crests/victoria-island-fc.svg',
    primary_color: '#2563EB',
    secondary_color: '#1E293B',
    accent_color: '#2563EB',
    stadium: 'Onikan Arena, Lagos',
    city: 'Lagos',
    country: 'Nigeria',
    founded_year: 2018,
    membership_fee: 100000,
    monthly_social_dues: 5000,
    max_installments: 4,
    status: 'active'
  },
  {
    id: 'club-ikoyi-royals',
    name: 'Ikoyi Royals SC',
    slug: 'ikoyi-royals-sc',
    code: 'IRSC',
    tagline: 'Legacy & Honor on the Turf',
    logo_url: '/crests/ikoyi-royals-sc.svg',
    primary_color: '#D97706',
    secondary_color: '#0F172A',
    accent_color: '#3B82F6',
    stadium: 'Legacy Stadium, Surulere',
    city: 'Lagos',
    country: 'Nigeria',
    founded_year: 2015,
    membership_fee: 100000,
    monthly_social_dues: 5000,
    max_installments: 4,
    status: 'active'
  }
]

export const initialClubRules = {
  club_id: 'club-sunday-league',
  green_max_balance: 0,
  yellow_max_balance: 20000,
  yellow_due_days_window: 14,
  red_min_balance: 20001,
  red_overdue_days_threshold: 14,
  require_social_dues_current: true,
  last_updated: '2026-09-28T10:00:00Z',
  updated_by: 'President'
}

// 30 Sunday League FC Club Members (22 Green, 5 Yellow, 3 Red)
export const initialMembers = [
  {
    id: 'mem-001',
    member_id: 'SL20260011',
    display_id: 'SL0011',
    full_name: 'Michael Esu',
    nickname: 'The Architect',
    email: 'michael.esu@sundayleague.ng',
    phone: '+234 802 345 6789',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
    role: 'member',
    club_id: 'club-sunday-league',
    jersey_number: 10,
    position: 'CAM',
    date_joined: 'September 15, 2024',
    rating: 85,
    
    // Status & Financials
    status: 'green', // 'green' | 'yellow' | 'red'
    membership_fee: 100000,
    membership_paid: 100000,
    membership_outstanding: 0,
    membership_status: 'paid', // 'paid' | 'partial' | 'unpaid'
    
    social_dues_current_month: 5000,
    social_dues_paid: 5000,
    social_dues_status: 'paid', // 'paid' | 'due'
    
    next_payment_label: 'No payment currently due.',
    next_payment_amount: 0,
    next_payment_date: null,
    last_payment_date: 'Sept 28, 2026',
    
    installments: [
      { id: 'inst-1', number: 1, label: 'Installment 1', amount: 25000, status: 'paid', paid_at: '2026-06-15', ref: 'SL00101' },
      { id: 'inst-2', number: 2, label: 'Installment 2', amount: 25000, status: 'paid', paid_at: '2026-07-20', ref: 'SL00115' },
      { id: 'inst-3', number: 3, label: 'Installment 3', amount: 25000, status: 'paid', paid_at: '2026-08-25', ref: 'SL00124' },
      { id: 'inst-4', number: 4, label: 'Installment 4', amount: 25000, status: 'paid', paid_at: '2026-09-28', ref: 'SL00130' }
    ]
  },
  {
    id: 'mem-002',
    member_id: 'SL20260012',
    display_id: 'SL0012',
    full_name: 'Player B (David Adeleke)',
    nickname: 'Flash',
    email: 'david.adeleke@sundayleague.ng',
    phone: '+234 803 112 4455',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
    role: 'member',
    club_id: 'club-sunday-league',
    jersey_number: 7,
    position: 'RW',
    date_joined: 'January 10, 2025',
    rating: 81,
    
    status: 'yellow',
    membership_fee: 100000,
    membership_paid: 90000,
    membership_outstanding: 10000,
    membership_status: 'partial',
    
    social_dues_current_month: 5000,
    social_dues_paid: 5000,
    social_dues_status: 'paid',
    
    next_payment_label: '₦10,000 outstanding due in 7 days',
    next_payment_amount: 10000,
    next_payment_date: '2026-10-07',
    last_payment_date: 'Sept 20, 2026',
    
    installments: [
      { id: 'inst-1', number: 1, label: 'Installment 1', amount: 25000, status: 'paid', paid_at: '2026-06-15', ref: 'SL00102' },
      { id: 'inst-2', number: 2, label: 'Installment 2', amount: 25000, status: 'paid', paid_at: '2026-07-20', ref: 'SL00116' },
      { id: 'inst-3', number: 3, label: 'Installment 3', amount: 25000, status: 'paid', paid_at: '2026-08-25', ref: 'SL00125' },
      { id: 'inst-4', number: 4, label: 'Installment 4', amount: 25000, amount_paid: 15000, status: 'pending', paid_at: null, ref: null }
    ]
  },
  {
    id: 'mem-003',
    member_id: 'SL20260013',
    display_id: 'SL0013',
    full_name: 'Player C (Chukwudi Eze)',
    nickname: 'The Rock',
    email: 'chukwudi.eze@sundayleague.ng',
    phone: '+234 809 998 7766',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
    role: 'member',
    club_id: 'club-sunday-league',
    jersey_number: 4,
    position: 'CB',
    date_joined: 'March 04, 2024',
    rating: 79,
    
    status: 'red',
    membership_fee: 100000,
    membership_paid: 65000,
    membership_outstanding: 35000,
    membership_status: 'partial',
    
    social_dues_current_month: 5000,
    social_dues_paid: 0,
    social_dues_status: 'due',
    
    next_payment_label: 'Your account has an outstanding balance of ₦35,000.',
    next_payment_amount: 35000,
    next_payment_date: '2026-08-31',
    last_payment_date: 'Aug 12, 2026',
    
    installments: [
      { id: 'inst-1', number: 1, label: 'Installment 1', amount: 25000, status: 'paid', paid_at: '2026-06-15', ref: 'SL00103' },
      { id: 'inst-2', number: 2, label: 'Installment 2', amount: 25000, status: 'paid', paid_at: '2026-07-20', ref: 'SL00117' },
      { id: 'inst-3', number: 3, label: 'Installment 3', amount: 25000, amount_paid: 15000, status: 'pending', paid_at: null, ref: null },
      { id: 'inst-4', number: 4, label: 'Installment 4', amount: 25000, amount_paid: 0, status: 'pending', paid_at: null, ref: null }
    ]
  },
  // Additional Members to total 30
  {
    id: 'mem-004', member_id: 'SL20260014', display_id: 'SL0014', full_name: 'Femi Balogun', nickname: 'Sniper',
    email: 'femi.b@sundayleague.ng', phone: '+234 814 111 2233', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&auto=format&fit=crop&q=80',
    role: 'member', club_id: 'club-sunday-league', jersey_number: 9, position: 'ST', date_joined: 'Jan 2024', rating: 83,
    status: 'green', membership_fee: 100000, membership_paid: 100000, membership_outstanding: 0, membership_status: 'paid',
    social_dues_current_month: 5000, social_dues_paid: 5000, social_dues_status: 'paid',
    next_payment_label: 'No payment currently due.', next_payment_amount: 0, last_payment_date: 'Sept 26, 2026'
  },
  {
    id: 'mem-005', member_id: 'SL20260015', display_id: 'SL0015', full_name: 'Emeka Nwosu', nickname: 'General',
    email: 'emeka.n@sundayleague.ng', phone: '+234 803 222 3344', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80',
    role: 'member', club_id: 'club-sunday-league', jersey_number: 5, position: 'CB', date_joined: 'Feb 2024', rating: 82,
    status: 'green', membership_fee: 100000, membership_paid: 100000, membership_outstanding: 0, membership_status: 'paid',
    social_dues_current_month: 5000, social_dues_paid: 5000, social_dues_status: 'paid',
    next_payment_label: 'No payment currently due.', next_payment_amount: 0, last_payment_date: 'Sept 25, 2026'
  },
  {
    id: 'mem-006', member_id: 'SL20260016', display_id: 'SL0016', full_name: 'Kelechi Okocha', nickname: 'Jay',
    email: 'kelechi.o@sundayleague.ng', phone: '+234 805 333 4455', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&auto=format&fit=crop&q=80',
    role: 'member', club_id: 'club-sunday-league', jersey_number: 8, position: 'CM', date_joined: 'May 2024', rating: 80,
    status: 'yellow', membership_fee: 100000, membership_paid: 85000, membership_outstanding: 15000, membership_status: 'partial',
    social_dues_current_month: 5000, social_dues_paid: 5000, social_dues_status: 'paid',
    next_payment_label: '₦15,000 outstanding due in 9 days', next_payment_amount: 15000, last_payment_date: 'Sept 18, 2026'
  },
  {
    id: 'mem-007', member_id: 'SL20260017', display_id: 'SL0017', full_name: 'Daniel Oladipo', nickname: 'Safe Hands',
    email: 'daniel.o@sundayleague.ng', phone: '+234 818 444 5566', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&auto=format&fit=crop&q=80',
    role: 'member', club_id: 'club-sunday-league', jersey_number: 1, position: 'GK', date_joined: 'Jan 2024', rating: 82,
    status: 'green', membership_fee: 100000, membership_paid: 100000, membership_outstanding: 0, membership_status: 'paid',
    social_dues_current_month: 5000, social_dues_paid: 5000, social_dues_status: 'paid',
    next_payment_label: 'No payment currently due.', next_payment_amount: 0, last_payment_date: 'Sept 27, 2026'
  },
  {
    id: 'mem-008', member_id: 'SL20260018', display_id: 'SL0018', full_name: 'Ahmed Lawal', nickname: 'Turbo',
    email: 'ahmed.l@sundayleague.ng', phone: '+234 802 555 6677', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80',
    role: 'member', club_id: 'club-sunday-league', jersey_number: 11, position: 'LW', date_joined: 'Apr 2024', rating: 79,
    status: 'red', membership_fee: 100000, membership_paid: 60000, membership_outstanding: 40000, membership_status: 'partial',
    social_dues_current_month: 5000, social_dues_paid: 0, social_dues_status: 'due',
    next_payment_label: 'Your account has an outstanding balance of ₦40,000.', next_payment_amount: 40000, last_payment_date: 'Aug 05, 2026'
  },
  {
    id: 'mem-009', member_id: 'SL20260019', display_id: 'SL0019', full_name: 'Suleiman Garba', nickname: 'Tank',
    email: 'suleiman.g@sundayleague.ng', phone: '+234 809 666 7788', avatar_url: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=256&auto=format&fit=crop&q=80',
    role: 'member', club_id: 'club-sunday-league', jersey_number: 6, position: 'CDM', date_joined: 'Jun 2024', rating: 78,
    status: 'yellow', membership_fee: 100000, membership_paid: 80000, membership_outstanding: 20000, membership_status: 'partial',
    social_dues_current_month: 5000, social_dues_paid: 5000, social_dues_status: 'paid',
    next_payment_label: '₦20,000 outstanding due in 5 days', next_payment_amount: 20000, last_payment_date: 'Sept 14, 2026'
  },
  {
    id: 'mem-010', member_id: 'SL20260020', display_id: 'SL0020', full_name: 'Tobi Bakare', nickname: 'Baks',
    email: 'tobi.b@sundayleague.ng', phone: '+234 812 777 8899', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&auto=format&fit=crop&q=80',
    role: 'member', club_id: 'club-sunday-league', jersey_number: 2, position: 'RB', date_joined: 'Feb 2024', rating: 77,
    status: 'green', membership_fee: 100000, membership_paid: 100000, membership_outstanding: 0, membership_status: 'paid',
    social_dues_current_month: 5000, social_dues_paid: 5000, social_dues_status: 'paid',
    next_payment_label: 'No payment currently due.', next_payment_amount: 0, last_payment_date: 'Sept 24, 2026'
  },
  // Generate remaining 20 members (18 Green, 1 Yellow, 1 Red)
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 21
    const pad = String(num).padStart(2, '0')
    const isYellow = i === 5 || i === 12
    const isRed = i === 18
    const status = isRed ? 'red' : isYellow ? 'yellow' : 'green'
    const fee = 100000
    const paid = isRed ? 70000 : isYellow ? 85000 : 100000
    const out = fee - paid

    return {
      id: `mem-0${num}`,
      member_id: `SL202600${pad}`,
      display_id: `SL00${pad}`,
      full_name: `Squad Member ${num}`,
      nickname: `Player ${num}`,
      email: `member${num}@sundayleague.ng`,
      phone: `+234 80${(num * 111111).toString().slice(0, 8)}`,
      avatar_url: `https://images.unsplash.com/photo-${1500000000000 + (num * 1000000)}?w=256&auto=format&fit=crop&q=80`,
      role: 'member',
      club_id: 'club-sunday-league',
      jersey_number: num,
      position: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'][num % 10],
      date_joined: 'Jan 2024',
      rating: 74 + (num % 8),
      status,
      membership_fee: fee,
      membership_paid: paid,
      membership_outstanding: out,
      membership_status: out === 0 ? 'paid' : 'partial',
      social_dues_current_month: 5000,
      social_dues_paid: isRed ? 0 : 5000,
      social_dues_status: isRed ? 'due' : 'paid',
      next_payment_label: out === 0 ? 'No payment currently due.' : `₦${out.toLocaleString()} outstanding due soon`,
      next_payment_amount: out,
      last_payment_date: isRed ? 'Aug 02, 2026' : isYellow ? 'Sept 19, 2026' : 'Sept 28, 2026'
    }
  })
]

// Transactions (Sunday League FC)
export const initialTransactions = [
  {
    id: 'tx-001',
    date: '2026-09-28T14:30:00Z',
    date_display: 'Sep 28, 2026',
    description: 'Membership installment',
    member_name: 'Michael Esu',
    member_id: 'SL20260011',
    club: 'Sunday League FC',
    amount: 50000,
    currency: 'NGN',
    payment_type: 'membership_installment',
    method: 'Paystack (Card)',
    channel: 'online',
    status: 'Paid',
    reference: 'SL00124',
    receipt_no: 'SL-2026-000124',
    notes: 'Installment settlement for 2026/27 Championship'
  },
  {
    id: 'tx-002',
    date: '2026-09-15T10:15:00Z',
    date_display: 'Sep 15, 2026',
    description: 'Membership',
    member_name: 'Michael Esu',
    member_id: 'SL20260011',
    club: 'Sunday League FC',
    amount: 25000,
    currency: 'NGN',
    payment_type: 'membership',
    method: 'Paystack (Bank Transfer)',
    channel: 'online',
    status: 'Paid',
    reference: 'SL00115',
    receipt_no: 'SL-2026-000115',
    notes: 'Q3 Membership obligation'
  },
  {
    id: 'tx-003',
    date: '2026-09-01T09:00:00Z',
    date_display: 'Sep 01, 2026',
    description: 'Social Dues',
    member_name: 'Michael Esu',
    member_id: 'SL20260011',
    club: 'Sunday League FC',
    amount: 5000,
    currency: 'NGN',
    payment_type: 'social_dues',
    method: 'Paystack (USSD)',
    channel: 'online',
    status: 'Paid',
    reference: 'SL00101',
    receipt_no: 'SL-2026-000101',
    notes: 'Monthly Sunday social dues & refreshments'
  },
  {
    id: 'tx-004',
    date: '2026-08-20T16:45:00Z',
    date_display: 'Aug 20, 2026',
    description: 'Club Official Matchday Jersey (Home & Away)',
    member_name: 'Michael Esu',
    member_id: 'SL20260011',
    club: 'Sunday League FC',
    amount: 18000,
    currency: 'NGN',
    payment_type: 'merchandise',
    method: 'Paystack (Card)',
    channel: 'online',
    status: 'Paid',
    reference: 'SL00098',
    receipt_no: 'SL-2026-000098',
    notes: 'Numbered jersey #10 kit pack'
  }
]

// Live Audit Logs for Administrative Actions
export const initialAuditLogs = [
  {
    id: 'log-001',
    timestamp: 'September 28, 2026 · 16:40 WAT',
    actor_name: 'President',
    actor_role: 'Club President',
    action: 'STATUS_OVERRIDE',
    target_member_id: 'SL20260011',
    target_name: 'Michael Esu',
    old_value: 'RED',
    new_value: 'GREEN',
    reason: 'Payment confirmed via manual bank transfer reconciliation.',
    details: 'Status changed from RED → GREEN. Administrator: President. Reason: Payment confirmed. Date: September 28, 2026'
  },
  {
    id: 'log-002',
    timestamp: 'September 20, 2026 · 11:20 WAT',
    actor_name: 'Club Treasurer',
    actor_role: 'Administrator',
    action: 'MANUAL_PAYMENT',
    target_member_id: 'SL20260012',
    target_name: 'David Adeleke',
    old_value: '₦25,000 Outstanding',
    new_value: '₦10,000 Outstanding',
    reason: 'Direct bank transfer credited to Sunday League FC Guaranty Trust Bank account. Ref: BANK-12345.',
    details: 'Amount: ₦15,000. Type: Membership installment.'
  },
  {
    id: 'log-003',
    timestamp: 'September 15, 2026 · 09:00 WAT',
    actor_name: 'President',
    actor_role: 'Club President',
    action: 'CONFIG_RULES_UPDATED',
    target_member_id: 'ALL',
    target_name: 'Sunday League FC Rules',
    old_value: 'Yellow Threshold: ₦15,000',
    new_value: 'Yellow Threshold: ₦20,000 (14 Days)',
    reason: 'Executive committee resolution for Q3 payment flexibility.',
    details: 'Threshold updated to ₦20,000 max for Yellow status.'
  }
]

// Gameweek 14 Matchday Availability
export const initialAvailability = {
  gameweek: 'GAMEWEEK 14',
  fixture: 'Sunday League FC vs Ikoyi Royals SC',
  date: 'Saturday, 04 Oct 2026 · 16:00 WAT',
  venue: 'Campos Memorial Mini Stadium, Lagos Island',
  user_vote: 'yes', // 'yes' | 'maybe' | 'no'
  roster: {
    yes: 18,
    maybe: 4,
    no: 2
  }
}
