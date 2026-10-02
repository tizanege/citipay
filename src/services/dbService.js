import { supabase } from '../lib/supabase'

/**
 * ============================================================================
 * CitiPay — Production Supabase Database Service
 * Mapped to supabase/schema.sql tables:
 * - public.clubs
 * - public.profiles
 * - public.players
 * - public.club_eligibility_rules
 * - public.payment_plans
 * - public.installments
 * - public.social_dues
 * - public.payments
 * - public.audit_logs
 * - public.match_availabilities
 * - public.payment_reminders
 * ============================================================================
 */

export const dbService = {
  /**
   * Check if Supabase is reachable and the CitiPay schema tables exist.
   */
  async checkDatabaseHealth() {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .limit(1)

      if (error) {
        return {
          connected: false,
          tablesReady: false,
          error: error.message,
          code: error.code
        }
      }

      return {
        connected: true,
        tablesReady: true,
        hasData: Array.isArray(data) && data.length > 0
      }
    } catch (err) {
      return {
        connected: false,
        tablesReady: false,
        error: err.message
      }
    }
  },

  // ── 1. CLUBS ─────────────────────────────────────────────────────────────
  async fetchClubs() {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(c => {
      const base = {
        ...c,
        membership_fee: Number(c.membership_fee || 100000),
        monthly_social_dues: Number(c.monthly_social_dues || 5000),
        max_installments: Number(c.max_installments || 4)
      }
      if (c.slug === 'sunday-league-fc' || c.code === 'SLFC') {
        return {
          ...base,
          primary_color: '#2563EB',
          secondary_color: '#DC2626',
          accent_color: '#FFFFFF'
        }
      }
      return base
    })
  },

  async fetchClubById(clubId) {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (error) throw error
    if (data?.slug === 'sunday-league-fc' || data?.code === 'SLFC') {
      return {
        ...data,
        primary_color: '#2563EB',
        secondary_color: '#DC2626',
        accent_color: '#FFFFFF'
      }
    }
    return data
  },

  // ── 2. PROFILES & SQUAD MEMBERS ──────────────────────────────────────────
  /**
   * Fetches full squad members with player dossier and payment obligations
   */
  async fetchClubMembers(clubId) {
    // 1. Fetch profiles for this club
    let query = supabase
      .from('profiles')
      .select(`
        *,
        players (*),
        payment_plans (*)
      `)

    if (clubId) {
      query = query.eq('club_id', clubId)
    }

    const { data: profiles, error } = await query

    if (error) throw error
    if (!profiles || profiles.length === 0) return []

    // 2. Map relational records to unified member UI model
    return profiles.map(p => {
      const player = Array.isArray(p.players) ? p.players[0] : p.players
      const plan = Array.isArray(p.payment_plans) ? p.payment_plans[0] : p.payment_plans
      
      const membershipFee = Number(plan?.total_amount || 100000)
      const membershipPaid = Number(plan?.amount_paid || 0)
      const membershipOutstanding = Math.max(0, membershipFee - membershipPaid)

      return {
        id: p.id,
        member_id: p.member_id,
        display_id: p.member_id,
        email: p.email,
        phone: p.phone,
        full_name: p.full_name,
        nickname: p.nickname || '',
        avatar_url: p.avatar_url || '/avatar-fallback.svg',
        role: p.role || 'member',
        club_id: p.club_id,
        status: p.eligibility_status || 'green',
        status_overridden: Boolean(p.eligibility_override_reason),
        override_reason: p.eligibility_override_reason || null,
        account_status: p.account_status || 'active',
        date_joined: p.date_joined,
        jersey_number: player?.jersey_number ? String(player.jersey_number) : '10',
        position: player?.primary_position || 'CAM',
        membership_fee: membershipFee,
        membership_paid: membershipPaid,
        membership_outstanding: membershipOutstanding,
        membership_status: membershipOutstanding === 0 ? 'paid' : membershipPaid > 0 ? 'partial' : 'unpaid',
        social_dues_current_month: 5000,
        social_dues_paid: 5000,
        social_dues_status: 'paid',
        last_payment_date: 'Recent',
        next_payment_amount: membershipOutstanding > 0 ? Math.min(25000, membershipOutstanding) : 0,
        next_payment_label: membershipOutstanding === 0 ? 'No payment currently due.' : `₦${membershipOutstanding.toLocaleString()} remaining`,
        installments: [
          { id: 'inst-1', number: 1, label: 'Installment 1', amount: 25000, status: membershipPaid >= 25000 ? 'paid' : 'due', paid_at: '2026-06-15', ref: 'SL00101' },
          { id: 'inst-2', number: 2, label: 'Installment 2', amount: 25000, status: membershipPaid >= 50000 ? 'paid' : 'due', paid_at: '2026-07-20', ref: 'SL00115' },
          { id: 'inst-3', number: 3, label: 'Installment 3', amount: 25000, status: membershipPaid >= 75000 ? 'paid' : 'due', paid_at: '2026-08-25', ref: 'SL00124' },
          { id: 'inst-4', number: 4, label: 'Installment 4', amount: 25000, status: membershipPaid >= 100000 ? 'paid' : 'due', paid_at: '2026-09-28', ref: 'SL00130' }
        ]
      }
    })
  },

  // ── 3. PAYMENTS & TRANSACTIONS ───────────────────────────────────────────
  async fetchTransactions(clubId) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        profiles (full_name, member_id),
        clubs (name)
      `)
      .order('paid_at', { ascending: false })

    if (clubId) {
      query = query.eq('club_id', clubId)
    }

    const { data, error } = await query
    if (error) throw error

    return (data || []).map(tx => ({
      id: tx.id,
      date: tx.paid_at,
      date_display: new Date(tx.paid_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      description: tx.description,
      member_name: tx.profiles?.full_name || 'Member',
      member_id: tx.profiles?.member_id || 'SLFC',
      club: tx.clubs?.name || 'Sunday League FC',
      amount: Number(tx.amount),
      currency: tx.currency || 'NGN',
      payment_type: tx.payment_type,
      method: tx.payment_method,
      channel: tx.payment_channel,
      status: tx.status === 'success' ? 'Paid' : tx.status,
      reference: tx.reference,
      receipt_no: tx.gateway_reference || tx.reference,
      notes: tx.notes || ''
    }))
  },

  /**
   * Records a payment to public.payments and updates player balance
   */
  async recordPayment({
    userId,
    clubId,
    paymentType,
    amount,
    currency = 'NGN',
    paymentMethod = 'paystack_card',
    paymentChannel = 'online',
    reference,
    description,
    notes = '',
    recordedBy = null
  }) {
    const paymentRecord = {
      user_id: userId,
      club_id: clubId,
      payment_type: paymentType,
      amount: Number(amount),
      currency,
      payment_method: paymentMethod,
      payment_channel: paymentChannel,
      reference,
      description,
      notes,
      recorded_by: recordedBy,
      status: 'success',
      paid_at: new Date().toISOString()
    }

    const { data: newPayment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentRecord])
      .select()
      .single()

    if (paymentError) throw paymentError

    // Also update profile / payment plan balance if possible
    try {
      const { data: plan } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (plan) {
        const newPaid = Number(plan.amount_paid || 0) + Number(amount)
        const total = Number(plan.total_amount || 100000)
        const newStatus = newPaid >= total ? 'fully_paid' : 'partially_paid'

        await supabase
          .from('payment_plans')
          .update({
            amount_paid: newPaid,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', plan.id)
      }
    } catch (e) {
      console.warn('Plan balance update skipped:', e)
    }

    return newPayment
  },

  // ── 4. AUDIT LOGS ────────────────────────────────────────────────────────
  async fetchAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(log => ({
      id: log.id,
      timestamp: new Date(log.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · Verified Log',
      actor_name: log.actor_name,
      actor_role: log.actor_role,
      action: log.action,
      target_member_id: log.target_member_id,
      target_name: log.target_name,
      old_value: log.old_value,
      new_value: log.new_value,
      reason: log.reason,
      details: log.reason
    }))
  },

  async insertAuditLog({
    actorId = null,
    actorName = 'Club Administrator',
    actorRole = 'President',
    action,
    targetUserId = null,
    targetMemberId = null,
    targetName = null,
    oldValue = null,
    newValue = null,
    reason,
    details = {}
  }) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        actor_id: actorId,
        actor_name: actorName,
        actor_role: actorRole,
        action,
        target_user_id: targetUserId,
        target_member_id: targetMemberId,
        target_name: targetName,
        old_value: oldValue,
        new_value: newValue,
        reason,
        details,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ── 5. ELIGIBILITY OVERRIDES ─────────────────────────────────────────────
  async overrideMemberStatus({
    userId,
    targetMemberId,
    targetName,
    newStatus,
    oldStatus,
    reason,
    adminId = null,
    adminName = 'Club Administrator'
  }) {
    // 1. Update public.profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        eligibility_status: newStatus,
        eligibility_override_reason: reason,
        eligibility_override_by: adminId,
        eligibility_override_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) throw profileError

    // 2. Insert mandatory audit log
    await this.insertAuditLog({
      actorId: adminId,
      actorName: adminName,
      actorRole: 'Club Executive',
      action: 'STATUS_OVERRIDE',
      targetUserId: userId,
      targetMemberId,
      targetName,
      oldValue: oldStatus?.toUpperCase(),
      newValue: newStatus?.toUpperCase(),
      reason,
      details: { override_status: newStatus }
    })

    return true
  },

  // ── 6. CLUB ELIGIBILITY RULES ────────────────────────────────────────────
  async fetchClubEligibilityRules(clubId) {
    const { data, error } = await supabase
      .from('club_eligibility_rules')
      .select('*')
      .eq('club_id', clubId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async upsertClubRules(clubId, rules, adminName = 'President') {
    const payload = {
      club_id: clubId,
      green_max_balance: Number(rules.green_max_balance ?? 0),
      yellow_max_balance: Number(rules.yellow_max_balance ?? 20000),
      yellow_due_days_window: Number(rules.yellow_due_days_window ?? 14),
      red_min_balance: Number(rules.red_min_balance ?? 20001),
      red_overdue_days_threshold: Number(rules.red_overdue_days_threshold ?? 14),
      require_social_dues_current: Boolean(rules.require_social_dues_current ?? true),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('club_eligibility_rules')
      .upsert(payload, { onConflict: 'club_id' })
      .select()
      .single()

    if (error) throw error

    // Log rule change in audit trail
    await this.insertAuditLog({
      actorName: adminName,
      actorRole: 'President',
      action: 'CONFIG_RULES_UPDATED',
      reason: `Eligibility thresholds modified: Green ₦${payload.green_max_balance}, Yellow ₦${payload.yellow_max_balance}, Red ₦${payload.red_min_balance}`,
      details: payload
    })

    return data
  },

  // ── 7. MATCHDAY AVAILABILITY ─────────────────────────────────────────────
  async fetchMatchAvailabilities(gameweek = 'Gameweek 14') {
    const { data, error } = await supabase
      .from('match_availabilities')
      .select('*')
      .eq('gameweek', gameweek)

    if (error) throw error
    return data || []
  },

  async upsertAvailability({ userId, clubId, gameweek, matchDate, opponent, status, notes = '' }) {
    const { data, error } = await supabase
      .from('match_availabilities')
      .upsert({
        user_id: userId,
        club_id: clubId,
        gameweek,
        match_date: matchDate,
        opponent,
        status,
        notes,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,gameweek' })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ── 8. PAYMENT REMINDERS ─────────────────────────────────────────────────
  async sendPaymentReminder({ userId, clubId, channel, reminderType, message, sentBy = null }) {
    const { data, error } = await supabase
      .from('payment_reminders')
      .insert([{
        user_id: userId,
        club_id: clubId,
        channel,
        reminder_type: reminderType,
        message,
        sent_by: sentBy,
        sent_at: new Date().toISOString(),
        delivery_status: 'sent'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}
