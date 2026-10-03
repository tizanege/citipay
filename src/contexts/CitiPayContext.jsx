import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import {
  initialClubs,
  initialMembers,
  initialTransactions,
  initialClubRules,
  initialAuditLogs,
  initialAvailability,
  initialLeagueSettings
} from '../lib/clubPortalData'
import { dbService } from '../services/dbService'
import { supabase } from '../lib/supabase'
import {
  generateRandomMemberId,
  isMemberIdMatch,
  generateTempPassword,
  generateAccessPin
} from '../lib/memberIdGenerator'

const CitiPayContext = createContext(null)

export function CitiPayProvider({ children }) {
  // 1. Current Club & User State
  const [clubs, setClubs] = useState(initialClubs)
  const [selectedClubId, setSelectedClubId] = useState('11111111-1111-1111-1111-111111111111') // Sunday League FC UUID
  const [members, setMembers] = useState(initialMembers)
  const [currentMemberId, setCurrentMemberId] = useState('mem-001') // Michael Esu
  const [currentRole, setCurrentRole] = useState('member') // 'member' | 'club_admin' | 'president' | 'super_admin'
  
  // 2. Financials, Transactions & Rules
  const [transactions, setTransactions] = useState(initialTransactions)
  const [clubRules, setClubRules] = useState(initialClubRules)
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs)
  
  const [leagueSettings, setLeagueSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('citipay_league_settings')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to load saved league settings:', e)
    }
    return initialLeagueSettings
  })

  const [availability, setAvailability] = useState(() => {
    try {
      const saved = localStorage.getItem('citipay_league_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.current_matchday) {
          return {
            ...initialAvailability,
            gameweek: `GAMEWEEK ${parsed.current_matchday}`
          }
        }
      }
    } catch (e) {}
    return initialAvailability
  })

  // Persist league settings updates
  useEffect(() => {
    try {
      localStorage.setItem('citipay_league_settings', JSON.stringify(leagueSettings))
    } catch (e) {
      console.warn('Failed to save league settings to localStorage:', e)
    }
  }, [leagueSettings])

  // 3. Database Sync & Connectivity State
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    isLive: false,
    checking: true,
    message: 'Connecting to Supabase...'
  })

  // 4. Modal UI States
  const [paymentModalState, setPaymentModalState] = useState({ isOpen: false, type: 'membership_installment', defaultAmount: 25000 })
  const [receiptModalState, setReceiptModalState] = useState({ isOpen: false, transaction: null })
  const [manualPaymentModalState, setManualPaymentModalState] = useState({ isOpen: false, member: null })
  const [statusOverrideModalState, setStatusOverrideModalState] = useState({ isOpen: false, member: null })
  const [rulesConfigModalState, setRulesConfigModalState] = useState({ isOpen: false })
  const [reminderModalState, setReminderModalState] = useState({ isOpen: false, member: null, channel: 'whatsapp' })
  const [otpModalState, setOtpModalState] = useState({ isOpen: false, memberId: '' })
  const [resetPassModalState, setResetPassModalState] = useState({ isOpen: false })
  const [addPlayerModalState, setAddPlayerModalState] = useState({ isOpen: false })
  const [sendCredentialsModalState, setSendCredentialsModalState] = useState({ isOpen: false, member: null })
  const [leagueSettingsModalState, setLeagueSettingsModalState] = useState({ isOpen: false })

  // Active Club Object
  const currentClub = useMemo(() => {
    return clubs.find(c => c.id === selectedClubId || c.slug === selectedClubId || c.code === selectedClubId) || clubs[0] || initialClubs[0]
  }, [clubs, selectedClubId])

  // Active Logged In Member Object
  const currentMember = useMemo(() => {
    return members.find(m => m.id === currentMemberId || isMemberIdMatch(m.member_id, currentMemberId)) || members[0] || initialMembers[0]
  }, [members, currentMemberId])

  // ── Database Hydration & Sync ─────────────────────────────────────────────
  const loadDatabaseData = useCallback(async () => {
    setDbStatus(prev => ({ ...prev, checking: true }))
    try {
      const health = await dbService.checkDatabaseHealth()

      if (health.tablesReady) {
        // Tables exist in Supabase! Fetch live data
        const [liveClubs, liveMembers, liveTxs, liveLogs, liveRules] = await Promise.allSettled([
          dbService.fetchClubs(),
          dbService.fetchClubMembers(selectedClubId),
          dbService.fetchTransactions(selectedClubId),
          dbService.fetchAuditLogs(),
          dbService.fetchClubEligibilityRules(selectedClubId)
        ])

        if (liveClubs.status === 'fulfilled' && liveClubs.value?.length > 0) {
          setClubs(liveClubs.value)
        }
        if (liveMembers.status === 'fulfilled' && liveMembers.value?.length > 0) {
          setMembers(liveMembers.value)
        }
        if (liveTxs.status === 'fulfilled' && liveTxs.value?.length > 0) {
          setTransactions(liveTxs.value)
        }
        if (liveLogs.status === 'fulfilled' && liveLogs.value?.length > 0) {
          setAuditLogs(liveLogs.value)
        }
        if (liveRules.status === 'fulfilled' && liveRules.value) {
          setClubRules(liveRules.value)
        }

        setDbStatus({
          connected: true,
          isLive: true,
          checking: false,
          message: 'Supabase PostgreSQL Live'
        })
      } else {
        // Tables not migrated yet — keep rich offline seed dataset
        setDbStatus({
          connected: true,
          isLive: false,
          checking: false,
          message: 'Supabase Connected (Pending schema.sql migration)'
        })
      }
    } catch (err) {
      console.warn('Database hydration warning:', err)
      setDbStatus({
        connected: false,
        isLive: false,
        checking: false,
        message: 'Offline / Mock Seed Mode'
      })
    }
  }, [selectedClubId])

  useEffect(() => {
    loadDatabaseData()
  }, [loadDatabaseData])

  // ── Realtime Subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('citipay-live-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, (payload) => {
        const newRecord = payload.new
        if (newRecord) {
          setTransactions(prev => {
            if (prev.some(t => t.reference === newRecord.reference || t.id === newRecord.id)) return prev
            return [{
              id: newRecord.id,
              date: newRecord.paid_at,
              date_display: new Date(newRecord.paid_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              description: newRecord.description,
              member_name: 'Member Payment',
              member_id: newRecord.reference,
              club: currentClub.name,
              amount: Number(newRecord.amount),
              currency: newRecord.currency,
              payment_type: newRecord.payment_type,
              method: newRecord.payment_method,
              channel: newRecord.payment_channel,
              status: 'Paid',
              reference: newRecord.reference,
              receipt_no: newRecord.gateway_reference || newRecord.reference,
              notes: newRecord.notes || ''
            }, ...prev]
          })
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        const newLog = payload.new
        if (newLog) {
          setAuditLogs(prev => {
            if (prev.some(l => l.id === newLog.id)) return prev
            return [{
              id: newLog.id,
              timestamp: new Date(newLog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · Verified Log',
              actor_name: newLog.actor_name,
              actor_role: newLog.actor_role,
              action: newLog.action,
              target_member_id: newLog.target_member_id,
              target_name: newLog.target_name,
              old_value: newLog.old_value,
              new_value: newLog.new_value,
              reason: newLog.reason,
              details: newLog.reason
            }, ...prev]
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentClub])

  // Recalculate Member Eligibility Status Based on Current Club Rules
  const evaluateMemberStatus = useCallback((outstanding, socialDuesPaid, isOverridden = false, overrideStatus = null) => {
    if (isOverridden && overrideStatus) return overrideStatus
    
    // Check Red threshold
    if (outstanding > clubRules.yellow_max_balance || !socialDuesPaid) {
      return 'red'
    }
    // Check Yellow threshold
    if (outstanding > clubRules.green_max_balance && outstanding <= clubRules.yellow_max_balance) {
      return 'yellow'
    }
    // Green
    return 'green'
  }, [clubRules])

  // Overview Metrics for Club Admin Dashboard
  const adminMetrics = useMemo(() => {
    const clubMembers = members.filter(m => m.club_id === selectedClubId || !m.club_id || m.club_id === 'club-sunday-league')
    const totalCount = clubMembers.length || members.length
    
    const greenCount = clubMembers.filter(m => m.status === 'green').length
    const yellowCount = clubMembers.filter(m => m.status === 'yellow').length
    const redCount = clubMembers.filter(m => m.status === 'red').length

    const expected = clubMembers.reduce((acc, m) => acc + (m.membership_fee || 100000), 0)
    const collected = clubMembers.reduce((acc, m) => acc + (m.membership_paid || 0), 0)
    const outstanding = expected - collected

    return {
      totalMembers: totalCount || 30,
      eligibleGreen: greenCount,
      dueSoonYellow: yellowCount,
      notEligibleRed: redCount,
      expectedRevenue: expected || 3000000,
      collectedRevenue: collected || 2450000,
      outstandingBalance: outstanding || 550000
    }
  }, [members, selectedClubId])

  // Action: Process Online Payment (Player Make Payment)
  const processOnlinePayment = useCallback(async ({ paymentType, amount, method = 'Paystack (Card)', notes = '' }) => {
    const refNum = Math.floor(100000 + Math.random() * 900000)
    const refCode = `SL${refNum}`
    const receiptRef = `SL-2026-000${refNum.toString().slice(-3)}`

    let typeDesc = 'Payment'
    if (paymentType === 'membership') typeDesc = 'Full Season Membership'
    else if (paymentType === 'membership_installment') typeDesc = 'Membership installment'
    else if (paymentType === 'social_dues') typeDesc = 'Monthly Social Dues (September 2026)'
    else if (paymentType === 'merchandise' || paymentType === 'merchandise_jersey') typeDesc = 'Official Matchday Jersey (Home & Away)'
    else if (paymentType === 'merchandise_bib') typeDesc = 'Official Training Bib Pack'
    else typeDesc = 'Other Club-Approved Payment'

    const newTx = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      date_display: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      description: typeDesc,
      member_name: currentMember.full_name,
      member_id: currentMember.member_id,
      club: currentClub.name,
      amount: Number(amount),
      currency: 'NGN',
      payment_type: paymentType,
      method,
      channel: 'online',
      status: 'Paid',
      reference: refCode,
      receipt_no: receiptRef,
      notes: notes || 'Online Paystack Payment Settled'
    }

    // 1. Optimistic UI update
    setTransactions(prev => [newTx, ...prev])

    setMembers(prev => prev.map(m => {
      if (m.id === currentMember.id) {
        let newPaid = m.membership_paid
        let newSocialPaid = m.social_dues_paid

        if (paymentType === 'membership' || paymentType === 'membership_installment') {
          newPaid = Math.min(m.membership_fee, m.membership_paid + Number(amount))
        } else if (paymentType === 'social_dues') {
          newSocialPaid = Number(currentClub.monthly_social_dues || 5000)
        }

        const newOut = Math.max(0, m.membership_fee - newPaid)
        const newStatus = newOut === 0 ? 'green' : newOut <= clubRules.yellow_max_balance ? 'yellow' : 'red'

        const updatedInstallments = m.installments?.map(inst => {
          if (inst.status === 'pending') {
            return { ...inst, status: 'paid', paid_at: new Date().toISOString().split('T')[0], ref: refCode }
          }
          return inst
        })

        return {
          ...m,
          membership_paid: newPaid,
          membership_outstanding: newOut,
          membership_status: newOut === 0 ? 'paid' : 'partial',
          social_dues_paid: newSocialPaid,
          social_dues_status: newSocialPaid >= Number(currentClub.monthly_social_dues || 5000) ? 'paid' : 'due',
          status: newStatus,
          last_payment_date: 'Today',
          next_payment_label: newOut === 0 ? 'No payment currently due.' : `₦${newOut.toLocaleString()} remaining`,
          installments: updatedInstallments || m.installments
        }
      }
      return m
    }))

    // 2. Persist to Supabase in background
    try {
      await dbService.recordPayment({
        userId: currentMember.id,
        clubId: currentClub.id,
        paymentType,
        amount,
        reference: refCode,
        description: typeDesc,
        notes: notes || 'Online Paystack payment',
        paymentMethod: 'paystack_card',
        paymentChannel: 'online'
      })
    } catch (e) {
      console.warn('Supabase online payment sync:', e.message)
    }

    return newTx
  }, [currentMember, currentClub, clubRules])

  // Action: Admin Record Manual Offline Payment
  const recordManualPayment = useCallback(async ({ memberId, amount, paymentType, reference, date, notes }) => {
    const target = members.find(m => m.id === memberId || m.member_id === memberId)
    if (!target) return false

    const refNum = reference || `BANK-${Math.floor(10000 + Math.random() * 90000)}`
    const receiptRef = `SL-2026-MANUAL-${Math.floor(100 + Math.random() * 900)}`

    let typeDesc = 'Manual Payment'
    if (paymentType === 'membership') typeDesc = 'Membership (Bank Transfer / Cash)'
    else if (paymentType === 'membership_installment') typeDesc = 'Membership installment (Manual)'
    else if (paymentType === 'social_dues') typeDesc = 'Social Dues (Cash / Direct Transfer)'
    else typeDesc = 'Club Approved Manual Payment'

    const newTx = {
      id: `tx-man-${Date.now()}`,
      date: new Date(date || Date.now()).toISOString(),
      date_display: date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      description: typeDesc,
      member_name: target.full_name,
      member_id: target.member_id,
      club: currentClub.name,
      amount: Number(amount),
      currency: 'NGN',
      payment_type: paymentType,
      method: 'Bank Transfer / Cash (Admin Recorded)',
      channel: 'admin_manual',
      status: 'Paid',
      reference: refNum,
      receipt_no: receiptRef,
      notes: notes || 'Admin manual offline payment verification'
    }

    setTransactions(prev => [newTx, ...prev])

    // Update target member
    setMembers(prev => prev.map(m => {
      if (m.id === target.id) {
        let newPaid = m.membership_paid
        let newSocialPaid = m.social_dues_paid

        if (paymentType === 'membership' || paymentType === 'membership_installment') {
          newPaid = Math.min(m.membership_fee, m.membership_paid + Number(amount))
        } else if (paymentType === 'social_dues') {
          newSocialPaid = Number(currentClub.monthly_social_dues || 5000)
        }

        const newOut = Math.max(0, m.membership_fee - newPaid)
        const newStatus = newOut === 0 ? 'green' : newOut <= clubRules.yellow_max_balance ? 'yellow' : 'red'

        return {
          ...m,
          membership_paid: newPaid,
          membership_outstanding: newOut,
          membership_status: newOut === 0 ? 'paid' : 'partial',
          social_dues_paid: newSocialPaid,
          social_dues_status: newSocialPaid >= Number(currentClub.monthly_social_dues || 5000) ? 'paid' : 'due',
          status: newStatus,
          last_payment_date: date || 'Today',
          next_payment_label: newOut === 0 ? 'No payment currently due.' : `₦${newOut.toLocaleString()} remaining`
        }
      }
      return m
    }))

    // Add Audit Log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · Manual Entry',
      actor_name: 'President / Admin',
      actor_role: 'Club Administrator',
      action: 'MANUAL_PAYMENT',
      target_member_id: target.member_id,
      target_name: target.full_name,
      old_value: `₦${target.membership_outstanding.toLocaleString()} Outstanding`,
      new_value: `₦${Math.max(0, target.membership_outstanding - Number(amount)).toLocaleString()} Outstanding`,
      reason: `Manual payment of ₦${Number(amount).toLocaleString()} recorded. Ref: ${refNum}. Notes: ${notes || 'N/A'}`,
      details: `Payment confirmed outside the portal (Bank transfer/Cash) by administrator.`
    }
    setAuditLogs(prev => [newLog, ...prev])

    // Background Supabase write
    try {
      await dbService.recordPayment({
        userId: target.id,
        clubId: currentClub.id,
        paymentType,
        amount,
        reference: refNum,
        description: typeDesc,
        notes: notes || 'Admin manual offline payment',
        paymentMethod: 'bank_transfer',
        paymentChannel: 'admin_manual'
      })
      await dbService.insertAuditLog({
        actorName: 'President / Admin',
        actorRole: 'Club Administrator',
        action: 'MANUAL_PAYMENT',
        targetMemberId: target.member_id,
        targetName: target.full_name,
        oldValue: `₦${target.membership_outstanding}`,
        newValue: `₦${Math.max(0, target.membership_outstanding - Number(amount))}`,
        reason: newLog.reason
      })
    } catch (e) {
      console.warn('Supabase manual payment sync:', e.message)
    }

    return newTx
  }, [members, currentClub, clubRules])

  // Action: Admin Manual Status Override (Item 6: Mandatory Reason)
  const overrideMemberStatus = useCallback(async ({ memberId, newStatus, reason, adminName = 'President' }) => {
    const target = members.find(m => m.id === memberId || m.member_id === memberId)
    if (!target) return false

    const oldStatusFormatted = target.status.toUpperCase()
    const newStatusFormatted = newStatus.toUpperCase()
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    // Update member
    setMembers(prev => prev.map(m => {
      if (m.id === target.id) {
        return {
          ...m,
          status: newStatus,
          status_overridden: true,
          override_reason: reason
        }
      }
      return m
    }))

    // Append to Audit Log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: `${formattedDate} · Status Override`,
      actor_name: adminName,
      actor_role: 'Club Administrator',
      action: 'STATUS_OVERRIDE',
      target_member_id: target.member_id,
      target_name: target.full_name,
      old_value: oldStatusFormatted,
      new_value: newStatusFormatted,
      reason,
      details: `Status changed from ${oldStatusFormatted} → ${newStatusFormatted}. Administrator: ${adminName}. Reason: ${reason}. Date: ${formattedDate}`
    }

    setAuditLogs(prev => [newLog, ...prev])

    // Background Supabase write
    try {
      await dbService.overrideMemberStatus({
        userId: target.id,
        targetMemberId: target.member_id,
        targetName: target.full_name,
        newStatus,
        oldStatus: target.status,
        reason,
        adminName
      })
    } catch (e) {
      console.warn('Supabase status override sync:', e.message)
    }

    return true
  }, [members])

  // Action: Admin Update Configurable Status Rules (Item 5)
  const updateClubRules = useCallback(async (newRules) => {
    setClubRules(prev => ({
      ...prev,
      ...newRules,
      last_updated: new Date().toISOString(),
      updated_by: 'President'
    }))

    // Add Audit Log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · Rule Update',
      actor_name: 'President',
      actor_role: 'Club President',
      action: 'CONFIG_RULES_UPDATED',
      target_member_id: 'ALL_MEMBERS',
      target_name: 'Sunday League FC Payment Rules',
      old_value: `Yellow Max: ₦${clubRules.yellow_max_balance.toLocaleString()}`,
      new_value: `Yellow Max: ₦${Number(newRules.yellow_max_balance || 20000).toLocaleString()}`,
      reason: 'Administrator updated club eligibility thresholds in system settings.',
      details: 'Eligibility thresholds recalculated across all member accounts.'
    }
    setAuditLogs(prev => [newLog, ...prev])

    // Background Supabase write
    try {
      await dbService.upsertClubRules(currentClub.id, newRules, 'President')
    } catch (e) {
      console.warn('Supabase rule update sync:', e.message)
    }
  }, [clubRules, currentClub])

  // Action: Admin Update Dues & Membership Fees
  const updateClubFees = useCallback(async ({ clubId, membership_fee, monthly_social_dues, max_installments = 2, adminName = 'President' }) => {
    const targetClubId = clubId || currentClub.id
    const newFee = Number(membership_fee || currentClub.membership_fee || 100000)
    const newDues = Number(monthly_social_dues || currentClub.monthly_social_dues || 5000)
    const newMaxInst = Number(max_installments || 2)

    // 1. Update clubs list
    setClubs(prev => prev.map(c => {
      if (c.id === targetClubId || c.slug === targetClubId || c.code === targetClubId) {
        return {
          ...c,
          membership_fee: newFee,
          monthly_social_dues: newDues,
          max_installments: newMaxInst
        }
      }
      return c
    }))

    // 2. Update members belonging to this club
    setMembers(prev => prev.map(m => {
      const isTarget = m.club_id === targetClubId || m.club_id === currentClub.id || (!targetClubId)
      if (isTarget) {
        const paid = Number(m.membership_paid || 0)
        const newOutstanding = Math.max(0, newFee - paid)
        const halfFee = Math.round(newFee / newMaxInst)

        const updatedInstallments = [
          {
            id: 'inst-1',
            number: 1,
            label: 'Installment 1 (1st Half - 50%)',
            amount: halfFee,
            status: paid >= halfFee ? 'paid' : 'due',
            paid_at: paid >= halfFee ? (m.installments?.[0]?.paid_at || '2026-06-15') : null,
            ref: m.installments?.[0]?.ref || 'SL00101'
          },
          {
            id: 'inst-2',
            number: 2,
            label: 'Installment 2 (2nd Half - 50%)',
            amount: halfFee,
            status: paid >= newFee ? 'paid' : 'due',
            paid_at: paid >= newFee ? (m.installments?.[1]?.paid_at || '2026-08-25') : null,
            ref: m.installments?.[1]?.ref || 'SL00124'
          }
        ]

        return {
          ...m,
          membership_fee: newFee,
          membership_outstanding: newOutstanding,
          membership_status: newOutstanding === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
          social_dues_current_month: newDues,
          next_payment_amount: newOutstanding > 0 ? Math.min(halfFee, newOutstanding) : 0,
          next_payment_label: newOutstanding === 0 ? 'No payment currently due.' : `₦${newOutstanding.toLocaleString()} remaining`,
          installments: updatedInstallments
        }
      }
      return m
    }))

    // 3. Add to Audit Trail
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · Fee Structure Update',
      actor_name: adminName,
      actor_role: 'Club Administrator',
      action: 'CLUB_FEES_UPDATED',
      target_member_id: 'ALL_MEMBERS',
      target_name: `${currentClub.name} Fee Structure`,
      old_value: `Fee: ₦${currentClub.membership_fee.toLocaleString()} / Dues: ₦${currentClub.monthly_social_dues.toLocaleString()}`,
      new_value: `Fee: ₦${newFee.toLocaleString()} / Dues: ₦${newDues.toLocaleString()}`,
      reason: `Administrator updated club dues and membership fee amount.`,
      details: `Membership fee adjusted to ₦${newFee.toLocaleString()} and monthly social dues to ₦${newDues.toLocaleString()} (${newMaxInst} installments).`
    }
    setAuditLogs(prev => [newLog, ...prev])

    // 4. Background Supabase sync
    try {
      await dbService.updateClubFees(targetClubId, {
        membership_fee: newFee,
        monthly_social_dues: newDues,
        max_installments: newMaxInst
      }, adminName)
    } catch (e) {
      console.warn('Supabase club fees update sync error:', e)
    }

    return true
  }, [currentClub])

  // Action: Super Admin update League Parameters (Matchday, Jersey price, Bib price)
  const updateLeagueSettings = useCallback(({ current_matchday, jersey_price, bib_price, season_title, competition_name, adminName = 'Chief Segun Adeleke (Super Admin)' }) => {
    setLeagueSettings(prev => {
      const nextMatchday = current_matchday !== undefined && current_matchday !== '' ? Math.max(1, Math.min(38, Number(current_matchday))) : prev.current_matchday
      const nextJerseyPrice = jersey_price !== undefined && jersey_price !== '' ? Math.max(0, Number(jersey_price)) : prev.jersey_price
      const nextBibPrice = bib_price !== undefined && bib_price !== '' ? Math.max(0, Number(bib_price)) : prev.bib_price

      const updated = {
        ...prev,
        current_matchday: nextMatchday,
        jersey_price: nextJerseyPrice,
        bib_price: nextBibPrice,
        season_title: season_title || prev.season_title,
        competition_name: competition_name || prev.competition_name,
        last_updated: new Date().toISOString(),
        updated_by: adminName
      }

      // Sync availability fixture gameweek string
      setAvailability(avail => ({
        ...avail,
        gameweek: `GAMEWEEK ${nextMatchday}`
      }))

      // Create live audit log
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WAT',
        actor_name: adminName,
        actor_role: 'Federation Super Admin',
        action: 'LEAGUE_SETTINGS_UPDATED',
        target_member_id: 'FED-HQ',
        target_name: 'League & Apparel Parameters',
        old_value: `GW${prev.current_matchday} · Jersey ₦${prev.jersey_price.toLocaleString()} · Bib ₦${prev.bib_price.toLocaleString()}`,
        new_value: `GW${updated.current_matchday} · Jersey ₦${updated.jersey_price.toLocaleString()} · Bib ₦${updated.bib_price.toLocaleString()}`,
        reason: `Matchday set to Gameweek ${updated.current_matchday}. Official Jersey set to ₦${updated.jersey_price.toLocaleString()}, Training Bib set to ₦${updated.bib_price.toLocaleString()}.`,
        details: `Updated by ${adminName}. Matchday ${updated.current_matchday} of ${updated.total_matchdays}. Live player store prices synced.`
      }
      setAuditLogs(logs => [newLog, ...logs])

      return updated
    })
    return true
  }, [])

  // Action: Player Availability Vote (Item 16)
  const setMemberAvailability = useCallback(async (vote) => {
    setAvailability(prev => {
      const oldVote = prev.user_vote
      const newRoster = { ...prev.roster }
      if (oldVote && newRoster[oldVote] > 0) newRoster[oldVote] -= 1
      newRoster[vote] = (newRoster[vote] || 0) + 1

      return {
        ...prev,
        user_vote: vote,
        roster: newRoster
      }
    })

    // Background Supabase write
    try {
      await dbService.upsertAvailability({
        userId: currentMember.id,
        clubId: currentClub.id,
        gameweek: `Gameweek ${leagueSettings.current_matchday}`,
        matchDate: '2026-10-04',
        opponent: 'Victoria Island FC',
        status: vote
      })
    } catch (e) {
      console.warn('Supabase availability sync:', e.message)
    }
  }, [currentMember, currentClub, leagueSettings.current_matchday])

  // Action: Switch Active Member (for demoing different players)
  const switchMember = useCallback((memberId) => {
    const found = members.find(m => m.id === memberId || isMemberIdMatch(m.member_id, memberId))
    if (found) {
      setCurrentMemberId(found.id)
    }
  }, [members])

  // Action: Register New Member with Random Unique Non-Serial Member ID & Login Credentials
  const registerMember = useCallback((memberData) => {
    const existingIds = members.map(m => m.member_id)
    const clubCode = currentClub?.code || 'SL'
    // Generate random non-serial unique member ID
    const uniqueMemberId = memberData.memberId || generateRandomMemberId({
      prefix: clubCode,
      length: 5,
      existingIds
    })

    const tempPassword = memberData.tempPassword || generateTempPassword()
    const pin = memberData.pin || generateAccessPin()

    const fee = currentClub?.membership_fee || 100000
    const isPaid = memberData.paymentType === 'full'
    const paidAmount = isPaid ? fee : (memberData.initialPayment || 0)
    const outAmount = Math.max(0, fee - paidAmount)

    const newMember = {
      id: `mem-${Date.now()}`,
      member_id: uniqueMemberId,
      display_id: uniqueMemberId,
      full_name: memberData.fullName || memberData.full_name || 'New Registered Player',
      nickname: memberData.nickname || (memberData.fullName ? memberData.fullName.split(' ')[0] : 'Player'),
      email: memberData.email || `player-${Date.now()}@sundayleague.ng`,
      phone: memberData.phone || '+234 800 000 0000',
      avatar_url: memberData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&auto=format&fit=crop&q=80',
      role: memberData.role || 'member',
      club_id: memberData.selectedClubId || currentClub.id,
      jersey_number: parseInt(memberData.jerseyNumber, 10) || (Math.floor(Math.random() * 88) + 12),
      position: memberData.primaryPosition || memberData.position || 'CAM',
      temp_password: tempPassword,
      pin: pin,
      credentials_sent_at: memberData.sendEmail ? new Date().toISOString() : null,
      date_joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: 76,
      status: outAmount === 0 ? 'green' : outAmount <= 20000 ? 'yellow' : 'red',
      membership_fee: fee,
      membership_paid: paidAmount,
      membership_outstanding: outAmount,
      membership_status: outAmount === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
      social_dues_current_month: currentClub?.monthly_social_dues || 5000,
      social_dues_paid: 5000,
      social_dues_status: 'paid',
      next_payment_label: outAmount === 0 ? 'No payment currently due.' : `₦${outAmount.toLocaleString()} outstanding due soon`,
      next_payment_amount: outAmount,
      last_payment_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      installments: [
        { id: `inst-${Date.now()}-1`, number: 1, label: 'Installment 1 (1st Half - 50%)', amount: Math.round(fee / 2), status: paidAmount >= Math.round(fee / 2) ? 'paid' : 'pending' },
        { id: `inst-${Date.now()}-2`, number: 2, label: 'Installment 2 (2nd Half - 50%)', amount: Math.round(fee / 2), status: paidAmount >= fee ? 'paid' : 'pending' }
      ]
    }

    setMembers(prev => [newMember, ...prev])
    setCurrentMemberId(newMember.id)

    // Add Audit Log for Registration
    const regLog = {
      id: `log-reg-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Registration',
      actor_name: currentRole === 'club_admin' ? 'Club Administrator' : newMember.full_name,
      actor_role: currentRole === 'club_admin' ? 'Club Admin' : 'New Member',
      action: 'MEMBER_REGISTERED',
      target_member_id: newMember.member_id,
      target_name: newMember.full_name,
      old_value: 'Unregistered',
      new_value: `Active (${newMember.member_id})`,
      reason: 'Player registered successfully with randomly generated non-serial Member ID.',
      details: `Assigned ID ${newMember.member_id} · Kit #${newMember.jersey_number} · Clearance: ${newMember.status.toUpperCase()}.`
    }

    const logsToAdd = [regLog]

    if (memberData.sendEmail) {
      logsToAdd.unshift({
        id: `log-cred-${Date.now() + 1}`,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Email Dispatched',
        actor_name: 'Club Administrator',
        actor_role: 'Automated Dispatch',
        action: 'CREDENTIALS_DISPATCHED',
        target_member_id: newMember.member_id,
        target_name: newMember.full_name,
        old_value: 'Pending Onboarding',
        new_value: `Sent to ${newMember.email}`,
        reason: `Dispatched official login credentials (Member ID: ${newMember.member_id}, PIN: ${pin}) to ${newMember.email}.`,
        details: `Temporary Password: ${tempPassword} · Login URL: /login · Sent via CitiLeague SMTP Mailer.`
      })
    }

    setAuditLogs(prev => [...logsToAdd, ...prev])

    return newMember
  }, [members, currentClub, currentRole])

  // Action: Send / Re-send Login Credentials via Email
  const sendMemberCredentials = useCallback(async ({ memberId, email, tempPassword, pin }) => {
    const target = members.find(m => m.id === memberId || isMemberIdMatch(m.member_id, memberId))
    if (!target) return null

    const pwd = tempPassword || target.temp_password || generateTempPassword()
    const accessPin = pin || target.pin || generateAccessPin()
    const targetEmail = email || target.email

    setMembers(prev => prev.map(m => {
      if (m.id === target.id) {
        return {
          ...m,
          email: targetEmail,
          temp_password: pwd,
          pin: accessPin,
          credentials_sent_at: new Date().toISOString()
        }
      }
      return m
    }))

    const newLog = {
      id: `log-cred-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Credentials Emailed',
      actor_name: 'Club Administrator',
      actor_role: 'Club Administration',
      action: 'CREDENTIALS_DISPATCHED',
      target_member_id: target.member_id,
      target_name: target.full_name,
      old_value: 'N/A',
      new_value: `Dispatched to ${targetEmail}`,
      reason: `Sent official CitiLeague login credentials & temporary password to ${target.full_name} (${targetEmail}).`,
      details: `Member ID: ${target.member_id} · Temp Password: ${pwd} · PIN: ${accessPin} · Direct Portal Link included.`
    }
    setAuditLogs(prev => [newLog, ...prev])

    return {
      member: target,
      email: targetEmail,
      tempPassword: pwd,
      pin: accessPin
    }
  }, [members])

  // Action: Send Payment Reminder (Item 13)
  const sendReminder = useCallback(async ({ memberId, channel, reminderType }) => {
    const target = members.find(m => m.id === memberId || m.member_id === memberId)
    if (!target) return

    const newLog = {
      id: `log-rem-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Reminder Sent',
      actor_name: 'Admin System',
      actor_role: 'Automated Dispatch',
      action: 'REMINDER_DISPATCHED',
      target_member_id: target.member_id,
      target_name: target.full_name,
      old_value: 'N/A',
      new_value: `${channel.toUpperCase()} Dispatched`,
      reason: `Sent ${reminderType} reminder to ${target.full_name} (${target.phone || target.email}) via ${channel}.`,
      details: `Direct Paystack link included for ₦${target.membership_outstanding.toLocaleString()} outstanding.`
    }
    setAuditLogs(prev => [newLog, ...prev])

    // Background Supabase write
    try {
      await dbService.sendPaymentReminder({
        userId: target.id,
        clubId: currentClub.id,
        channel,
        reminderType,
        message: newLog.reason
      })
    } catch (e) {
      console.warn('Supabase reminder sync:', e.message)
    }
  }, [members, currentClub])

  const value = {
    // Database Status
    dbStatus,
    recheckDatabase: loadDatabaseData,

    // Clubs & Profile
    clubs,
    selectedClubId,
    setSelectedClubId,
    currentClub,
    members,
    setMembers,
    currentMember,
    currentMemberId,
    switchMember,
    currentRole,
    setCurrentRole,
    
    // Financials & Rules
    transactions,
    clubRules,
    auditLogs,
    availability,
    adminMetrics,
    leagueSettings,
    setLeagueSettings,
    
    // Actions
    processOnlinePayment,
    recordManualPayment,
    overrideMemberStatus,
    updateClubRules,
    updateClubFees,
    updateLeagueSettings,
    setMemberAvailability,
    sendReminder,
    registerMember,
    sendMemberCredentials,
    
    // Modals
    paymentModalState,
    setPaymentModalState,
    receiptModalState,
    setReceiptModalState,
    manualPaymentModalState,
    setManualPaymentModalState,
    statusOverrideModalState,
    setStatusOverrideModalState,
    rulesConfigModalState,
    setRulesConfigModalState,
    reminderModalState,
    setReminderModalState,
    otpModalState,
    setOtpModalState,
    resetPassModalState,
    setResetPassModalState,
    addPlayerModalState,
    setAddPlayerModalState,
    sendCredentialsModalState,
    setSendCredentialsModalState,
    leagueSettingsModalState,
    setLeagueSettingsModalState
  }

  return (
    <CitiPayContext.Provider value={value}>
      {children}
    </CitiPayContext.Provider>
  )
}

export function useCitiPay() {
  const context = useContext(CitiPayContext)
  if (!context) {
    throw new Error('useCitiPay must be used within a CitiPayProvider')
  }
  return context
}
