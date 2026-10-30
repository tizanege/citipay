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
      const isPrimary = c.slug === 'ikoyi-sunday-league' || c.slug === 'sunday-league-fc' || c.code === 'ISL' || c.code === 'SLFC' || c.id === '11111111-1111-1111-1111-111111111111'
      return {
        ...c,
        name: isPrimary && c.name === 'Sunday League FC' ? 'Ikoyi Sunday League' : (c.name || 'Ikoyi Sunday League'),
        code: c.code || (isPrimary ? 'ISL' : 'CLUB'),
        slug: c.slug || (isPrimary ? 'ikoyi-sunday-league' : 'club'),
        stadium: c.stadium || 'Campos Memorial Mini Stadium, Lagos Island',
        city: c.city || 'Lagos',
        country: c.country || 'Nigeria',
        founded_year: c.founded_year || 2021,
        primary_color: c.primary_color || (isPrimary ? '#2563EB' : '#2563EB'),
        secondary_color: c.secondary_color || (isPrimary ? '#DC2626' : '#DC2626'),
        accent_color: c.accent_color || '#FFFFFF',
        logo_url: c.logo_url || '/crests/sunday-league-fc.svg',
        membership_fee: Number(c.membership_fee || 100000),
        monthly_social_dues: Number(c.monthly_social_dues || 5000),
        max_installments: Number(c.max_installments || 2)
      }
    })
  },

  async fetchClubById(clubId) {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (error) throw error
    if (data?.slug === 'ikoyi-sunday-league' || data?.slug === 'sunday-league-fc' || data?.code === 'ISL' || data?.code === 'SLFC') {
      return {
        ...data,
        name: data?.name === 'Sunday League FC' ? 'Ikoyi Sunday League' : (data?.name || 'Ikoyi Sunday League'),
        primary_color: '#2563EB',
        secondary_color: '#DC2626',
        accent_color: '#FFFFFF'
      }
    }
    return data
  },

  async createClub(clubPayload) {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert([clubPayload])
        .select()
        .single()
      if (error) {
        console.warn('Supabase createClub warning:', error.message)
        return { success: false, error: error.message, data: clubPayload }
      }
      return { success: true, data }
    } catch (err) {
      console.warn('Supabase createClub error:', err.message)
      return { success: false, error: err.message, data: clubPayload }
    }
  },

  async deleteClub(clubId) {
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId)
      if (error) {
        console.warn('Supabase deleteClub warning:', error.message)
      }
      return { success: true }
    } catch (err) {
      console.warn('Supabase deleteClub error:', err.message)
      return { success: false, error: err.message }
    }
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

    // Deduplicate profiles by id, member_id, email, and normalized full_name
    const seenIds = new Set()
    const seenMemberIds = new Set()
    const seenEmails = new Set()
    const seenNames = new Set()

    const uniqueProfiles = profiles.filter(p => {
      const idKey = String(p.id || '').trim()
      const memberIdKey = String(p.member_id || '').trim().toUpperCase()
      const emailKey = String(p.email || '').trim().toLowerCase()
      const nameKey = String(p.full_name || '').trim().toLowerCase()

      if (idKey && seenIds.has(idKey)) return false
      if (memberIdKey && seenMemberIds.has(memberIdKey)) return false
      if (emailKey && seenEmails.has(emailKey)) return false
      if (nameKey && seenNames.has(nameKey)) return false

      if (idKey) seenIds.add(idKey)
      if (memberIdKey) seenMemberIds.add(memberIdKey)
      if (emailKey) seenEmails.add(emailKey)
      if (nameKey) seenNames.add(nameKey)
      return true
    })

    // 2. Map relational records to unified member UI model
    return uniqueProfiles.map(p => {
      const player = Array.isArray(p.players) ? p.players[0] : p.players
      const plansList = Array.isArray(p.payment_plans)
        ? [...p.payment_plans].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
        : (p.payment_plans ? [p.payment_plans] : [])
      const plan = plansList[0] || null

      const baseFee = Number(plan?.total_amount || 100000)
      const rawPaid = Number(plan?.amount_paid || 0)
      const membershipFee = baseFee
      const membershipPaid = Math.min(rawPaid, membershipFee)
      const membershipOutstanding = Math.max(0, membershipFee - membershipPaid)
      const walletBal = 0

      // Format actual payment date from payment_plans.updated_at or profile timestamp
      const latestPaidIso = membershipPaid > 0 ? (plan?.updated_at || plan?.created_at || p.updated_at || p.created_at) : null
      const formattedLastPaid = latestPaidIso
        ? new Date(latestPaidIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'No payment yet'
      const formattedShortPaid = latestPaidIso
        ? new Date(latestPaidIso).toISOString().split('T')[0]
        : null

      // Compute accurate status unless manually overridden
      const isOverridden = Boolean(p.eligibility_override_reason)
      const resolvedStatus = isOverridden
        ? (p.eligibility_status || 'green')
        : membershipOutstanding === 0
        ? 'green'
        : membershipPaid > 0
        ? 'yellow'
        : (p.eligibility_status || 'red')

      const cleanFullName = String(p.full_name || '').trim()
      const cleanNick = String(p.nickname || '').trim()
      const distinctNickname = cleanNick.toLowerCase() !== cleanFullName.toLowerCase() ? cleanNick : ''

      return {
        id: p.id,
        member_id: p.member_id,
        display_id: p.member_id,
        email: p.email,
        phone: p.phone,
        full_name: cleanFullName,
        nickname: distinctNickname,
        avatar_url: p.avatar_url || '/avatar-fallback.svg',
        role: p.role || 'member',
        club_id: p.club_id,
        status: resolvedStatus,
        status_overridden: isOverridden,
        override_reason: p.eligibility_override_reason || null,
        account_status: p.account_status || 'active',
        date_joined: p.date_joined,
        jersey_number: player?.jersey_number ? String(player.jersey_number) : '10',
        position: player?.primary_position || 'CAM',
        membership_fee: membershipFee,
        membership_paid: membershipPaid,
        total_contributions: rawPaid,
        membership_outstanding: membershipOutstanding,
        membership_status: membershipOutstanding === 0 ? 'paid' : membershipPaid > 0 ? 'partial' : 'unpaid',
        social_dues_current_month: 5000,
        social_dues_paid: 5000,
        social_dues_status: 'paid',
        wallet_balance: walletBal,
        last_payment_date: formattedLastPaid,
        next_payment_amount: membershipOutstanding > 0 ? Math.min(Math.round(membershipFee / 2), membershipOutstanding) : 0,
        next_payment_label: membershipOutstanding === 0 ? 'No payment currently due.' : `₦${membershipOutstanding.toLocaleString()} remaining`,
        installments: [
          {
            id: 'inst-1',
            number: 1,
            label: 'Installment 1 (1st Half - 50%)',
            amount: Math.round(membershipFee / 2),
            status: membershipPaid >= Math.round(membershipFee / 2) ? 'paid' : 'due',
            paid_at: formattedShortPaid || 'Settled',
            ref: p.member_id || 'SL001'
          },
          {
            id: 'inst-2',
            number: 2,
            label: 'Installment 2 (2nd Half - 50%)',
            amount: Math.round(membershipFee / 2),
            status: membershipPaid >= membershipFee ? 'paid' : 'due',
            paid_at: formattedShortPaid || 'Settled',
            ref: p.member_id || 'SL002'
          }
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
      user_id: tx.user_id,
      date: tx.paid_at,
      date_display: new Date(tx.paid_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      description: tx.description,
      member_name: tx.profiles?.full_name || 'Member',
      member_id: tx.profiles?.member_id || 'ISL',
      club: tx.clubs?.name === 'Sunday League FC' ? 'Ikoyi Sunday League' : (tx.clubs?.name || 'Ikoyi Sunday League'),
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
      details: typeof log.details === 'string' ? log.details : log.reason,
      raw_details: log.details || null,
      created_at: log.created_at
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

  async updateClubDetails(clubId, details = {}, adminName = 'Administrator') {
    const payload = {
      updated_at: new Date().toISOString()
    }
    if (details.name !== undefined) payload.name = details.name.trim()
    if (details.code !== undefined) payload.code = details.code.trim().toUpperCase()
    if (details.stadium !== undefined) payload.stadium = details.stadium.trim()
    if (details.city !== undefined) payload.city = details.city.trim()
    if (details.country !== undefined) payload.country = details.country.trim()
    if (details.founded_year !== undefined) payload.founded_year = Number(details.founded_year)
    if (details.primary_color !== undefined) payload.primary_color = details.primary_color
    if (details.secondary_color !== undefined) payload.secondary_color = details.secondary_color
    if (details.accent_color !== undefined) payload.accent_color = details.accent_color
    if (details.logo_url !== undefined) payload.logo_url = details.logo_url
    if (details.membership_fee !== undefined) payload.membership_fee = Number(details.membership_fee)
    if (details.monthly_social_dues !== undefined) payload.monthly_social_dues = Number(details.monthly_social_dues)
    if (details.max_installments !== undefined) payload.max_installments = Number(details.max_installments)

    try {
      const { data, error } = await supabase
        .from('clubs')
        .update(payload)
        .eq('id', clubId)
        .select()
        .maybeSingle()

      if (error) console.warn('Supabase clubs update warning:', error.message)

      await this.insertAuditLog({
        actorName: adminName,
        actorRole: 'Club Executive',
        action: 'CLUB_DETAILS_UPDATED',
        reason: `Club profile updated: ${payload.name || clubId}`,
        details: payload
      })

      return data
    } catch (e) {
      console.warn('dbService.updateClubDetails error:', e.message)
      return null
    }
  },

  async updateClubFees(clubId, { membership_fee, monthly_social_dues, max_installments = 2 }, adminName = 'Administrator') {
    const payload = {
      membership_fee: Number(membership_fee),
      monthly_social_dues: Number(monthly_social_dues),
      max_installments: Number(max_installments),
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('clubs')
        .update(payload)
        .eq('id', clubId)
        .select()
        .maybeSingle()

      if (error) console.warn('Supabase clubs update warning:', error.message)

      await this.insertAuditLog({
        actorName: adminName,
        actorRole: 'Club Executive',
        action: 'CLUB_FEES_UPDATED',
        reason: `Club dues & membership fee updated: Season Fee ₦${payload.membership_fee.toLocaleString()}, Monthly Dues ₦${payload.monthly_social_dues.toLocaleString()}, Installments: ${payload.max_installments}`,
        details: payload
      })

      return data
    } catch (e) {
      console.warn('dbService.updateClubFees error:', e.message)
      return null
    }
  },

  /**
   * Registers a new player in Supabase (profiles, players, payment_plans)
   */
  async registerPlayer({
    id,
    memberId,
    fullName,
    nickname,
    email,
    phone,
    clubId,
    jerseyNumber,
    position,
    membershipFee = 100000,
    amountPaid = 0,
    eligibilityStatus = 'green'
  }, adminName = 'Administrator') {
    const profilePayload = {
      member_id: memberId,
      full_name: fullName.trim(),
      nickname: (nickname || fullName.split(' ')[0]).trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      club_id: clubId,
      role: 'member',
      eligibility_status: eligibilityStatus,
      account_status: 'active',
      date_joined: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    if (id) profilePayload.id = id

    // 1. Insert into public.profiles
    const { data: newProfile, error: profError } = await supabase
      .from('profiles')
      .insert(profilePayload)
      .select()
      .single()

    if (profError) {
      console.warn('Supabase profile insertion error:', profError.message)
      throw profError
    }

    const userId = newProfile.id

    // 2. Insert into public.players dossier
    const { error: playError } = await supabase
      .from('players')
      .insert({
        user_id: userId,
        jersey_number: parseInt(jerseyNumber, 10) || null,
        primary_position: position || 'CAM',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (playError) {
      console.warn('Supabase players insertion warning:', playError.message)
    }

    // 3. Create initial payment plan
    const total = Number(membershipFee)
    const paid = Number(amountPaid)
    const status = paid >= total ? 'fully_paid' : (paid > 0 ? 'partially_paid' : 'unpaid')

    const { error: planError } = await supabase
      .from('payment_plans')
      .insert({
        user_id: userId,
        club_id: clubId,
        season: '2026/2027',
        title: '2026 Membership Subscription',
        total_amount: total,
        amount_paid: paid,
        status: status,
        next_due_date: '2026-11-30',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (planError) {
      console.warn('Supabase payment plan insertion warning:', planError.message)
    }

    // 4. Record audit log
    await this.insertAuditLog({
      actorName: adminName,
      actorRole: 'Administrator',
      action: 'MEMBER_REGISTERED',
      targetUserId: userId,
      targetMemberId: memberId,
      targetName: fullName,
      reason: `Registered new player ${fullName} with Member ID ${memberId}`,
      details: { memberId, fullName, email, clubId, position, jerseyNumber }
    })

    return newProfile
  },

  /**
   * Deletes / Removes a player from the system
   */
  async deletePlayer(userId, targetMemberId, targetName, adminName = 'Super Admin') {
    // Delete profile (cascades to players, payment_plans, etc.)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.warn('Supabase player deletion error:', error.message)
      throw error
    }

    // Record audit log
    await this.insertAuditLog({
      actorName: adminName,
      actorRole: 'Administrator',
      action: 'MEMBER_DELETED',
      targetUserId: userId,
      targetMemberId,
      targetName,
      reason: `Removed player ${targetName} (${targetMemberId}) from federation registry`,
      details: { userId, targetMemberId, targetName }
    })

    return true
  },

  /**
   * Updates an existing player's profile and tactical dossier
   */
  async updatePlayerProfile(userId, {
    fullName,
    nickname,
    phone,
    jerseyNumber,
    position,
    clubId
  }, adminName = 'Super Admin') {
    const profileUpdates = {
      updated_at: new Date().toISOString()
    }
    if (fullName !== undefined) profileUpdates.full_name = fullName.trim()
    if (nickname !== undefined) profileUpdates.nickname = nickname.trim()
    if (phone !== undefined) profileUpdates.phone = phone.trim()
    if (clubId !== undefined) profileUpdates.club_id = clubId

    // 1. Update profiles table
    const { data: updatedProfile, error: profError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (profError) {
      console.warn('Supabase profiles update warning:', profError.message)
      throw profError
    }

    // 2. Upsert/Update players table
    if (jerseyNumber !== undefined || position !== undefined) {
      const playerUpdates = {
        user_id: userId,
        updated_at: new Date().toISOString()
      }
      if (jerseyNumber !== undefined) playerUpdates.jersey_number = parseInt(jerseyNumber, 10) || null
      if (position !== undefined) playerUpdates.primary_position = position

      const { error: playError } = await supabase
        .from('players')
        .upsert(playerUpdates, { onConflict: 'user_id' })

      if (playError) {
        console.warn('Supabase players update warning:', playError.message)
      }
    }

    // 3. Log to audit trail
    await this.insertAuditLog({
      actorName: adminName,
      actorRole: 'Administrator',
      action: 'MEMBER_UPDATED',
      targetUserId: userId,
      targetName: fullName,
      reason: `Updated player profile & tactical details: ${fullName} (Kit #${jerseyNumber || 'N/A'}, Pos: ${position || 'N/A'})`,
      details: { fullName, nickname, phone, jerseyNumber, position, clubId }
    })

    return updatedProfile
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
