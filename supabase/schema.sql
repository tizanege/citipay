-- =========================================================
-- CITI FOOTBALL — CLUB PAYMENT PORTAL (CitiPay)
-- Production Supabase PostgreSQL Database Schema
-- Multi-Club, Member ID, Configurable Eligibility, Audit Logs,
-- Installment Schedules, Social Dues & Matchday Availability
-- =========================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop existing tables in reverse dependency order
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.payment_reminders cascade;
drop table if exists public.match_availabilities cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.eligibility_overrides cascade;
drop table if exists public.payments cascade;
drop table if exists public.installments cascade;
drop table if exists public.payment_plans cascade;
drop table if exists public.social_dues cascade;
drop table if exists public.club_eligibility_rules cascade;
drop table if exists public.club_memberships cascade;
drop table if exists public.players cascade;
drop table if exists public.profiles cascade;
drop table if exists public.clubs cascade;
drop table if exists public.notifications cascade;

-- =========================================================
-- 1. CLUBS (Sunday League FC & Citi Football Affiliated Clubs)
-- =========================================================
create table public.clubs (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  code text unique not null,
  logo_url text,
  primary_color text default '#2563EB',
  secondary_color text default '#DC2626',
  accent_color text default '#FFFFFF',
  stadium text,
  city text default 'Lagos',
  country text default 'Nigeria',
  founded_year integer default 2020,
  membership_fee numeric(12, 2) default 100000.00 not null,
  monthly_social_dues numeric(12, 2) default 5000.00 not null,
  installment_allowed boolean default true,
  max_installments integer default 4,
  status text default 'active' check (status in ('active', 'inactive', 'pending_approval')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================
-- 2. PROFILES (Extends auth.users with unique Member ID)
-- =========================================================
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  member_id text unique not null, -- E.g. SL0011, SL0012
  email text unique not null,
  phone text unique,
  pin_hash text,
  full_name text not null,
  nickname text,
  avatar_url text default '/avatar-fallback.svg',
  role text not null default 'member' check (role in ('member', 'club_admin', 'president', 'super_admin')),
  club_id uuid references public.clubs(id) on delete set null,
  
  -- Dynamic 3-Color Eligibility Status: green (eligible), yellow (due_soon), red (not_eligible)
  eligibility_status text not null default 'green' check (eligibility_status in ('green', 'yellow', 'red')),
  eligibility_override_reason text,
  eligibility_override_by uuid,
  eligibility_override_at timestamptz,
  
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'pending')),
  date_joined date default current_date not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Index for fast lookup by member ID & email
create index if not exists idx_profiles_member_id on public.profiles(member_id);
create index if not exists idx_profiles_club_id on public.profiles(club_id);

-- =========================================================
-- 3. PLAYERS (Member Football Dossier & Tactical Spec)
-- =========================================================
create table public.players (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  jersey_number integer,
  primary_position text check (primary_position in ('GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF')),
  secondary_position text,
  preferred_foot text check (preferred_foot in ('Left', 'Right', 'Both')),
  height_cm numeric(5, 1),
  weight_kg numeric(5, 1),
  date_of_birth date,
  nationality text default 'Nigeria',
  overall_rating integer default 78,
  form text default 'Good',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================
-- 4. CLUB ELIGIBILITY RULES (Configurable Thresholds)
-- =========================================================
create table public.club_eligibility_rules (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade unique not null,
  green_max_balance numeric(12, 2) default 0.00 not null,
  yellow_max_balance numeric(12, 2) default 20000.00 not null,
  yellow_due_days_window integer default 14 not null,
  red_min_balance numeric(12, 2) default 20001.00 not null,
  red_overdue_days_threshold integer default 14 not null,
  require_social_dues_current boolean default true not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================
-- 5. PAYMENT PLANS (Membership Fee Obligations & Balances)
-- =========================================================
create table public.payment_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  club_id uuid references public.clubs(id) on delete cascade not null,
  season text default '2026/2027' not null,
  title text not null,
  total_amount numeric(12, 2) not null,
  amount_paid numeric(12, 2) default 0.00 not null,
  installment_count integer default 4,
  completed_installments integer default 0,
  status text default 'partially_paid' check (status in ('unpaid', 'partially_paid', 'fully_paid', 'overdue')),
  next_due_date date,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================
-- 6. INSTALLMENTS (Detailed Milestone Breakdown)
-- =========================================================
create table public.installments (
  id uuid default gen_random_uuid() primary key,
  payment_plan_id uuid references public.payment_plans(id) on delete cascade not null,
  installment_number integer not null,
  amount numeric(12, 2) not null,
  amount_paid numeric(12, 2) default 0.00 not null,
  due_date date not null,
  status text default 'pending' check (status in ('pending', 'paid', 'partially_paid', 'overdue')),
  paid_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================
-- 7. SOCIAL DUES (Monthly Clubhouse & Matchday Dues)
-- =========================================================
create table public.social_dues (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  club_id uuid references public.clubs(id) on delete cascade not null,
  month_year text not null, -- E.g. '2026-09'
  amount numeric(12, 2) default 5000.00 not null,
  amount_paid numeric(12, 2) default 0.00 not null,
  status text default 'paid' check (status in ('pending', 'paid', 'overdue')),
  paid_at timestamptz,
  due_date date not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, club_id, month_year)
);

-- =========================================================
-- 8. PAYMENTS & TRANSACTIONS (Online Paystack + Manual Bank)
-- =========================================================
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  club_id uuid references public.clubs(id) on delete cascade not null,
  payment_plan_id uuid references public.payment_plans(id) on delete set null,
  installment_id uuid references public.installments(id) on delete set null,
  
  payment_type text not null check (
    payment_type in ('membership', 'membership_installment', 'social_dues', 'merchandise', 'other_approved')
  ),
  
  amount numeric(12, 2) not null,
  currency text default 'NGN' not null,
  payment_method text not null, -- 'paystack_card', 'bank_transfer', 'ussd', 'cash', 'pos'
  payment_channel text default 'online' check (payment_channel in ('online', 'admin_manual', 'bank_deposit')),
  
  reference text unique not null,
  gateway_reference text,
  status text default 'success' check (status in ('pending', 'success', 'failed', 'refunded')),
  description text not null,
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null,
  paid_at timestamptz default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_club_id on public.payments(club_id);
create index if not exists idx_payments_paid_at on public.payments(paid_at desc);

-- =========================================================
-- 9. AUDIT LOGS (Compliance Tracking & Status Overrides)
-- =========================================================
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null,
  actor_role text not null,
  action text not null, -- 'STATUS_OVERRIDE', 'MANUAL_PAYMENT', 'CONFIG_RULES_UPDATED', 'REMINDER_DISPATCHED'
  target_user_id uuid references public.profiles(id) on delete set null,
  target_member_id text,
  target_name text,
  old_value text,
  new_value text,
  reason text not null,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- =========================================================
-- 10. MATCHDAY PLAYER AVAILABILITY (Gameweek Voting)
-- =========================================================
create table public.match_availabilities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  club_id uuid references public.clubs(id) on delete cascade not null,
  gameweek text not null, -- E.g. 'Gameweek 14'
  match_date date not null,
  opponent text not null,
  status text not null check (status in ('yes', 'maybe', 'no')),
  notes text,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, gameweek)
);

-- =========================================================
-- 11. PAYMENT REMINDERS (Email / WhatsApp Dispatch Logs)
-- =========================================================
create table public.payment_reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  club_id uuid references public.clubs(id) on delete cascade not null,
  channel text not null check (channel in ('whatsapp', 'email', 'sms', 'in_app')),
  reminder_type text not null check (reminder_type in ('yellow_due_soon', 'red_ineligible', 'monthly_social_dues')),
  message text not null,
  sent_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz default timezone('utc'::text, now()) not null,
  delivery_status text default 'sent' check (delivery_status in ('sent', 'delivered', 'failed'))
);

-- =========================================================
-- 12. NOTIFICATIONS
-- =========================================================
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'payment', 'eligibility', 'match', 'reminder')),
  read boolean default false,
  link text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
alter table public.clubs enable row level security;
alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.club_eligibility_rules enable row level security;
alter table public.payment_plans enable row level security;
alter table public.installments enable row level security;
alter table public.social_dues enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;
alter table public.match_availabilities enable row level security;
alter table public.payment_reminders enable row level security;
alter table public.notifications enable row level security;

-- Clubs: Public Read, Authenticated Write
create policy "clubs_select_policy" on public.clubs for select using (true);
create policy "clubs_insert_update_policy" on public.clubs for all using (true);

-- Profiles: Public Read for rosters, Authenticated Write
create policy "profiles_select_policy" on public.profiles for select using (true);
create policy "profiles_insert_policy" on public.profiles for insert with check (true);
create policy "profiles_update_policy" on public.profiles for update using (true);

-- Players: Public Read, Authenticated Write
create policy "players_all_policy" on public.players for all using (true);

-- Rules: Public Read, Admin Write
create policy "rules_select_policy" on public.club_eligibility_rules for select using (true);
create policy "rules_manage_policy" on public.club_eligibility_rules for all using (true);

-- Payments: Public Read & Insert
create policy "payments_select_policy" on public.payments for select using (true);
create policy "payments_insert_policy" on public.payments for insert with check (true);

-- Audit Logs: Public Read & Insert
create policy "audit_select_policy" on public.audit_logs for select using (true);
create policy "audit_insert_policy" on public.audit_logs for insert with check (true);

-- Match Availability: Public Read & Insert
create policy "availability_all_policy" on public.match_availabilities for all using (true);

-- Reminders & Notifications: Public Read & Insert
create policy "reminders_all_policy" on public.payment_reminders for all using (true);
create policy "notifications_all_policy" on public.notifications for all using (true);

-- Payment Plans & Installments: Public Read & Write
create policy "plans_all_policy" on public.payment_plans for all using (true);
create policy "installments_all_policy" on public.installments for all using (true);
create policy "social_dues_all_policy" on public.social_dues for all using (true);

-- =========================================================
-- AUTH TRIGGER: Synchronize auth.users with public.profiles
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    user_id,
    email,
    full_name,
    member_id,
    role,
    club_id,
    eligibility_status
  ) values (
    new.id,
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'member_id', 'SL' || substr(replace(new.id::text, '-', ''), 1, 5)),
    coalesce(new.raw_user_meta_data->>'role', 'member'),
    '11111111-1111-1111-1111-111111111111',
    'green'
  )
  on conflict (id) do update set user_id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- SEED DATA: CLUBS, ELIGIBILITY RULES & CORE MEMBERS
-- =========================================================

-- 1. Clubs
insert into public.clubs (
  id, name, slug, code, logo_url, primary_color, secondary_color, accent_color,
  stadium, city, founded_year, membership_fee, monthly_social_dues, max_installments
) values (
  '11111111-1111-1111-1111-111111111111',
  'Sunday League FC',
  'sunday-league-fc',
  'SLFC',
  '/crests/sunday-league-fc.svg',
  '#2563EB',
  '#DC2626',
  '#FFFFFF',
  'Campos Memorial Mini Stadium, Lagos Island',
  'Lagos',
  2021,
  100000.00,
  5000.00,
  4
) on conflict (slug) do update set
  code = excluded.code,
  logo_url = excluded.logo_url,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  accent_color = excluded.accent_color;

insert into public.clubs (name, slug, code, logo_url, primary_color, secondary_color, stadium, city, founded_year, membership_fee)
values
  ('Victoria Island FC', 'victoria-island-fc', 'VIFC', '/crests/victoria-island-fc.svg', '#2563EB', '#1E293B', 'Onikan Arena, Lagos', 'Lagos', 2018, 100000.00),
  ('Ikoyi Royals SC', 'ikoyi-royals-sc', 'IRSC', '/crests/ikoyi-royals-sc.svg', '#D97706', '#0F172A', 'Legacy Stadium, Surulere', 'Lagos', 2015, 100000.00)
on conflict (slug) do nothing;

-- 2. Rules
insert into public.club_eligibility_rules (
  club_id, green_max_balance, yellow_max_balance, yellow_due_days_window,
  red_min_balance, red_overdue_days_threshold, require_social_dues_current
) values (
  '11111111-1111-1111-1111-111111111111',
  0.00,       -- Green: ₦0
  20000.00,   -- Yellow: ₦1 - ₦20,000
  14,         -- Yellow: within 14 days
  20001.00,   -- Red: > ₦20,000
  14,
  true
) on conflict (club_id) do nothing;

-- 3. Core Profiles (Member 1: Michael Esu, Member 2: David Adeleke, Member 3: Chidi Okafor)
insert into public.profiles (
  id, member_id, email, full_name, nickname, role, club_id, eligibility_status, account_status
) values
  ('aaaaaaaa-0001-0001-0001-000000000001', 'SL0011', 'michael.esu@sundayleaguefc.ng', 'Michael Esu', 'M-Esu', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('aaaaaaaa-0001-0001-0001-000000000002', 'SL0012', 'david.adeleke@sundayleaguefc.ng', 'Player B (David Adeleke)', 'Davido', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('aaaaaaaa-0001-0001-0001-000000000003', 'SL0013', 'chidi.okafor@sundayleaguefc.ng', 'Player C (Chidi Okafor)', 'Chi-Chi', 'member', '11111111-1111-1111-1111-111111111111', 'red', 'active'),
  ('aaaaaaaa-0001-0001-0001-000000000004', 'SL0014', 'emeka.nwosu@sundayleaguefc.ng', 'Emeka Nwosu', 'Emzy', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('aaaaaaaa-0001-0001-0001-000000000005', 'SL0015', 'tunde.balogun@sundayleaguefc.ng', 'Tunde Balogun', 'T-Bal', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active')
on conflict (member_id) do nothing;

-- 4. Players Dossier
insert into public.players (user_id, jersey_number, primary_position, overall_rating)
values
  ('aaaaaaaa-0001-0001-0001-000000000001', 10, 'CAM', 86),
  ('aaaaaaaa-0001-0001-0001-000000000002', 7, 'RW', 82),
  ('aaaaaaaa-0001-0001-0001-000000000003', 9, 'ST', 79),
  ('aaaaaaaa-0001-0001-0001-000000000004', 8, 'CM', 84),
  ('aaaaaaaa-0001-0001-0001-000000000005', 4, 'CB', 85)
on conflict (user_id) do nothing;

-- 5. Payment Plans
insert into public.payment_plans (user_id, club_id, title, total_amount, amount_paid, status)
values
  ('aaaaaaaa-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'Season 2026/27 Dues', 100000.00, 100000.00, 'fully_paid'),
  ('aaaaaaaa-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Season 2026/27 Dues', 100000.00, 90000.00, 'partially_paid'),
  ('aaaaaaaa-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'Season 2026/27 Dues', 100000.00, 60000.00, 'partially_paid'),
  ('aaaaaaaa-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'Season 2026/27 Dues', 100000.00, 100000.00, 'fully_paid'),
  ('aaaaaaaa-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'Season 2026/27 Dues', 100000.00, 100000.00, 'fully_paid');

-- 6. Initial Seed Payments
insert into public.payments (
  user_id, club_id, payment_type, amount, payment_method, payment_channel, reference, description
) values
  ('aaaaaaaa-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'membership', 100000.00, 'paystack_card', 'online', 'SL-2026-000101', 'Full Season 2026/27 Membership Fee Clearance'),
  ('aaaaaaaa-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'membership_installment', 50000.00, 'bank_transfer', 'admin_manual', 'BANK-99211', 'Membership Installment 1 of 2'),
  ('aaaaaaaa-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'membership_installment', 40000.00, 'paystack_card', 'online', 'SL-2026-000103', 'Membership Installment 2 (Part)'),
  ('aaaaaaaa-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'membership', 100000.00, 'paystack_card', 'online', 'SL-2026-000104', 'Full Season Membership Dues'),
  ('aaaaaaaa-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'membership', 100000.00, 'paystack_card', 'online', 'SL-2026-000105', 'Full Season Membership Dues');

-- 7. Initial Audit Trail
insert into public.audit_logs (
  actor_name, actor_role, action, target_member_id, target_name, old_value, new_value, reason
) values
  ('President / Admin', 'Club Administrator', 'MANUAL_PAYMENT', 'SL0012', 'Player B (David Adeleke)', '₦50,000 Outstanding', '₦10,000 Outstanding', 'Verified direct bank transfer to Sunday League FC Access Bank account. Reference: BANK-99211.'),
  ('President', 'Club President', 'STATUS_OVERRIDE', 'SL0012', 'Player B (David Adeleke)', 'RED', 'YELLOW', 'Granted 14-day grace extension for balance reconciliation before Gameweek 14.'),
  ('Citi Football Federation', 'League HQ', 'CONFIG_RULES_UPDATED', 'ALL_CLUBS', 'Sunday League FC Rules', 'Default Rules', 'Custom Thresholds', 'Configured 2026/27 Championship financial clearance thresholds.');
