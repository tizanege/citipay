import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard, ShieldCheck, AlertCircle, CheckCircle2, Clock,
  ArrowRight, Sparkles, Download, Check, HelpCircle, PhoneCall,
  Calendar, MapPin, Zap, Star, Shield, Trophy, ChevronRight,
  TrendingUp, User, Users, RefreshCw, UserPlus, Plus, Minus
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './PlayerDashboard.css'

export default function PlayerDashboard() {
  const navigate = useNavigate()
  const {
    currentMember,
    currentClub,
    availability,
    setMemberAvailability,
    setPaymentModalState,
    setReceiptModalState,
    transactions,
    members,
    switchMember,
    setIslCupModalState,
    setWalletModalState
  } = useCitiPay()

  const member = currentMember || {}
  const isGreen = member.status === 'green'
  const isYellow = member.status === 'yellow'
  const isRed = member.status === 'red'

  const membershipFee = Number(member.membership_fee || 100000)
  const membershipPaid = Number(member.membership_paid || 0)
  const membershipOutstanding = Number(member.membership_outstanding ?? Math.max(0, membershipFee - membershipPaid))
  const socialDuesCurrentMonth = Number(member.social_dues_current_month || 5000)
  const installmentAmount = Math.round(membershipFee / 2)
  const nextPaymentAmount = Number(member.next_payment_amount ?? (membershipOutstanding > 0 ? Math.min(installmentAmount, membershipOutstanding) : 0))

  // Recent transactions for this player
  const memberTxs = (transactions || []).filter(
    tx => tx?.member_id === member.member_id || tx?.member_name === member.full_name
  ).slice(0, 4)

  // Unregistered Guests (Extra people @ ₦10,000 each)
  const [guestCount, setGuestCount] = useState(0)
  const guestFeePerPerson = 10000
  const totalGuestAmount = guestCount * guestFeePerPerson

  const handleOpenPayment = (type = 'membership_installment', defaultAmount = nextPaymentAmount || installmentAmount) => {
    setPaymentModalState({
      isOpen: true,
      type,
      defaultAmount: defaultAmount || membershipOutstanding || installmentAmount
    })
  }

  const handlePayForGuests = () => {
    if (guestCount <= 0) return
    setPaymentModalState({
      isOpen: true,
      type: 'guest_pass',
      defaultAmount: totalGuestAmount
    })
  }

  return (
    <div className="portal-dashboard-wrapper">

      {/* SUPERPOWER-INSPIRED DASHBOARD HEADER */}
      <div className="superpower-profile-row mb-6">
        <div className="superpower-profile-left">
          <div className="superpower-name-row">
            <h1 className="superpower-player-name">{member.full_name || 'Sophia Caldwell'}</h1>
            <span className="superpower-verified-badge">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>#{member.jersey_number || '10'} · {member.position || 'CAM'}</span>
            </span>
          </div>
          <p className="superpower-subtext">
            {currentClub?.name || 'Sunday League FC'} · Member ID: <span className="font-mono">{member.member_id || 'SL-8K4P2'}</span>
          </p>
        </div>

        {/* Top Count Stats (Dot Matrix Style: Total, Optimal, Due, Out of range) */}
        <div className="superpower-stats-bar">
          <div className="sp-counter-item">
            <div className="sp-counter-value sp-dot-matrix">106</div>
            <div className="sp-counter-label">
              <span className="sp-mini-badge yellow">Total</span>
            </div>
          </div>
          <div className="sp-counter-item">
            <div className="sp-counter-value sp-dot-matrix">{isGreen ? '80' : '45'}</div>
            <div className="sp-counter-label">
              <span className="sp-pill-label">Cleared</span>
            </div>
          </div>
          <div className="sp-counter-item">
            <div className="sp-counter-value sp-dot-matrix">{isYellow ? '21' : '12'}</div>
            <div className="sp-counter-label">
              <span className="sp-pill-label">In Grace</span>
            </div>
          </div>
          <div className="sp-counter-item">
            <div className="sp-counter-value sp-dot-matrix">{isRed ? '5' : '0'}</div>
            <div className="sp-counter-label">
              <span className="sp-pill-label alert">Due Flag</span>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE / SEASON CHECK-IN BAR */}
      <div className="superpower-timeline-card mb-4">
        <div className="sp-timeline-track">
          <span className="sp-timeline-month">August</span>
          <div className="sp-timeline-dots">
            <span className="sp-tl-dot done" />
            <span className="sp-tl-dot done" />
            <span className="sp-tl-dot done" />
            <div className="sp-timeline-pill-floating">
              <Sparkles size={12} className="text-amber-500" />
              <span>Matchday Fitness Peak (+4.8 rating)</span>
            </div>
            <span className="sp-tl-dot current" />
            <span className="sp-tl-dot future" />
            <span className="sp-tl-dot future" />
          </div>
          <span className="sp-timeline-month">November</span>
        </div>
      </div>

      {/* DUAL GLOWING HERO CARDS (Superpower Score & Biological/Matchday Age) */}
      <div className="superpower-hero-grid mb-6">
        {/* Card 1: Superpower Eligibility Score */}
        <div className={`sp-hero-card ${isRed ? 'sp-hero-danger' : isYellow ? 'sp-hero-warning' : 'sp-hero-green'}`}>
          <div className="sp-hero-card-header">
            <span className="sp-hero-label">Player Clearance Score</span>
          </div>
          <div className="sp-hero-body">
            <div className="sp-hero-big-number sp-dot-matrix">
              {isGreen ? '94' : isYellow ? '70' : '38'}
            </div>
            <div className="sp-hero-status-pill">
              {isGreen ? 'Matchday Ready · 100% Cleared' : isYellow ? 'On Track · Grace Period' : 'Action Required · Ineligible'}
            </div>
          </div>
          {/* Micro dots equalizer */}
          <div className="sp-hero-equalizer">
            <span style={{ height: '30%' }} />
            <span style={{ height: '60%' }} />
            <span style={{ height: '40%' }} />
            <span style={{ height: '80%' }} />
            <span style={{ height: '100%' }} />
            <span style={{ height: '70%' }} />
            <span style={{ height: '90%' }} />
            <span style={{ height: '50%' }} />
            <span style={{ height: '75%' }} />
            <span style={{ height: '85%' }} />
          </div>
        </div>

        {/* Card 2: Matchday Readiness / Performance Age */}
        <div className="sp-hero-card sp-hero-amber">
          <div className="sp-hero-card-header">
            <span className="sp-hero-label">Matchday Peak Index</span>
          </div>
          <div className="sp-hero-body">
            <div className="sp-hero-big-number sp-dot-matrix">
              {member.jersey_number || '25'}
            </div>
            <div className="sp-hero-status-pill amber">
              Top 5% League Conditioning
            </div>
          </div>
          {/* Vertical gauge ruler */}
          <div className="sp-hero-gauge-ruler">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={`gauge-tick ${i === 14 ? 'active-tick' : ''}`} />
            ))}
          </div>
        </div>

        {/* Card 3: Pending Verification Box */}
        <div className="sp-pending-kit-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-500">Upcoming Fixture Window</span>
            <button className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
          </div>
          <div className="sp-pending-counter">
            <span className="sp-pending-num font-mono">3-5</span>
            <span className="sp-pending-unit">Days</span>
          </div>
          <div className="sp-progress-line mb-3">
            <div className="sp-progress-filled" style={{ width: '65%' }} />
          </div>
          <p className="text-3xs text-slate-400">
            Next matchday squad submission deadline approaching for Gameweek 14.
          </p>
        </div>
      </div>

      {/* FINANCIAL BIOMARKERS CAROUSEL / ROW */}
      <div className="superpower-biomarkers-section mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="sp-section-heading">Financial Biomarkers</h3>
            <p className="sp-section-sub">A snapshot of your dues, balance, and ledger health</p>
          </div>
          <button className="sp-see-all-btn" onClick={() => navigate('/payments')}>
            See All
          </button>
        </div>

        <div className="sp-biomarkers-grid">
          {/* Biomarker 1: Membership Fee */}
          <div className="sp-bio-card">
            <div className="sp-bio-header">
              <span className="sp-bio-icon">💳</span>
              <span className="sp-bio-type">Annual Dues</span>
            </div>
            <div className="sp-bio-value">
              <span className="sp-bio-num">₦{membershipPaid.toLocaleString()}</span>
              <span className="sp-bio-unit">/ ₦{membershipFee.toLocaleString()}</span>
            </div>
            <div className="sp-bio-label">
              {membershipOutstanding === 0 ? '🟢 Fully Settled' : `🔴 ₦${membershipOutstanding.toLocaleString()} Due`}
            </div>
            <div className="sp-sparkline-bars">
              <span style={{ height: '40%' }} />
              <span style={{ height: '70%' }} />
              <span style={{ height: '90%' }} />
              <span style={{ height: '100%' }} />
            </div>
          </div>

          {/* Biomarker 2: Social Dues */}
          <div className="sp-bio-card">
            <div className="sp-bio-header">
              <span className="sp-bio-icon">🏆</span>
              <span className="sp-bio-type">Monthly Socials</span>
            </div>
            <div className="sp-bio-value">
              <span className="sp-bio-num">₦{socialDuesCurrentMonth.toLocaleString()}</span>
              <span className="sp-bio-unit">/ month</span>
            </div>
            <div className="sp-bio-label">
              {member.social_dues_status === 'paid' ? '🟢 Settled for September' : '🟡 Pending Settlement'}
            </div>
            <div className="sp-sparkline-wave">
              <svg viewBox="0 0 100 20" className="w-full h-5 text-emerald-500 fill-none stroke-current stroke-2">
                <path d="M0,15 Q25,0 50,12 T100,8" />
              </svg>
            </div>
          </div>

          {/* Biomarker 3: Next Installment */}
          <div className="sp-bio-card">
            <div className="sp-bio-header">
              <span className="sp-bio-icon">⚡</span>
              <span className="sp-bio-type">Next Milestone</span>
            </div>
            <div className="sp-bio-value">
              <span className="sp-bio-num">
                {nextPaymentAmount > 0 ? `₦${nextPaymentAmount.toLocaleString()}` : '₦0'}
              </span>
              <span className="sp-bio-unit">scheduled</span>
            </div>
            <div className="sp-bio-label">
              {nextPaymentAmount > 0 ? 'Due in 7 days' : 'Zero balance due'}
            </div>
            <div className="sp-sparkline-dots">
              <span className="dot active" />
              <span className="dot active" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>
      </div>

      {/* TOP CLUB GEAR & RECOVERY (Superpower Supplements Inspiration) */}
      <div className="superpower-supplements-section mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="sp-section-heading">Club Gear & Performance Pack</h3>
            <p className="sp-section-sub">Official gear and recovery essentials allocated for your squad tier</p>
          </div>
          <button className="sp-see-all-btn" onClick={() => alert('Club kit store opening soon!')}>
            See All
          </button>
        </div>

        <div className="sp-supplements-grid">
          <div className="sp-supp-card">
            <span className="sp-supp-badge yellow">Official Kit</span>
            <div className="sp-supp-orb green-orb">
              <span>👕</span>
            </div>
            <div className="sp-supp-title">2026 Matchday Jersey</div>
            <div className="sp-supp-price">₦18,500</div>
          </div>

          <div className="sp-supp-card">
            <span className="sp-supp-badge yellow">Recovery</span>
            <div className="sp-supp-orb blue-orb">
              <span>⚡</span>
            </div>
            <div className="sp-supp-title">Electrolyte & Iso Fuel</div>
            <div className="sp-supp-price">₦8,200</div>
          </div>

          <div className="sp-supp-card">
            <span className="sp-supp-badge">Standard</span>
            <div className="sp-supp-orb orange-orb">
              <span>🛡️</span>
            </div>
            <div className="sp-supp-title">Carbon Shin Guards</div>
            <div className="sp-supp-price">₦14,000</div>
          </div>
        </div>
      </div>

      {/* 9. INSTALLMENT PAYMENT PLAN & 16. AVAILABILITY INTEGRATION (2-Column Grid) */}
      <div className="grid-2 mb-6 gap-5">
        {/* 9. MEMBERSHIP PAYMENT PLAN (Item 9 Requirement) */}
        <div className="card installment-plan-card">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">MEMBERSHIP PAYMENT PLAN</h3>
              <p className="text-xs text-slate-500">2026/27 Sunday League Official Membership Schedule</p>
            </div>
            <span className="badge badge-accent font-bold text-xs">4 Milestones</span>
          </div>

          {/* Plan Totals Banner */}
          <div className="plan-stats-bar mb-4">
            <div className="plan-stat-item">
              <span className="plan-stat-lbl">Total:</span>
              <strong className="plan-stat-val text-slate-900 font-mono">₦{membershipFee.toLocaleString()}</strong>
            </div>
            <div className="plan-stat-item">
              <span className="plan-stat-lbl">Paid:</span>
              <strong className="plan-stat-val text-emerald-700 font-mono">₦{membershipPaid.toLocaleString()}</strong>
            </div>
            <div className="plan-stat-item">
              <span className="plan-stat-lbl">Remaining:</span>
              <strong className="plan-stat-val text-rose-600 font-mono">₦{membershipOutstanding.toLocaleString()}</strong>
            </div>
          </div>

          {/* Payment Schedule (Item 9 format) */}
          <div className="installment-schedule-list flex flex-col gap-2.5 mb-4">
            {member.installments && member.installments.length > 0 ? (
              member.installments.map((inst, idx) => (
                <div key={inst.id || idx} className={`installment-item-row ${inst.status === 'paid' ? 'paid-row' : 'pending-row'}`}>
                  <div className="flex items-center gap-2.5">
                    {inst.status === 'paid' ? (
                      <span className="inst-badge-status green">✅</span>
                    ) : (
                      <span className="inst-badge-status red">🔴</span>
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {inst.label || `Installment ${inst.number || idx + 1}`} — ₦{Number(inst.amount || installmentAmount).toLocaleString()}
                      </div>
                      <div className="text-3xs text-slate-500">
                        {inst.status === 'paid' ? `Paid on ${inst.paid_at || 'Settled'} · Ref: ${inst.ref || 'SL001'}` : `Due for settlement`}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${inst.status === 'paid' ? 'badge-success' : 'badge-warning'} text-xs font-bold`}>
                    {inst.status === 'paid' ? 'PAID' : 'DUE'}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="installment-item-row paid-row">
                  <div className="flex items-center gap-2">
                    <span className="inst-badge-status green">✅</span>
                    <span className="font-bold text-xs text-slate-900">Installment 1 (1st Half - 50%) — ₦{installmentAmount.toLocaleString()}</span>
                  </div>
                  <span className="badge badge-success text-xs font-bold">PAID</span>
                </div>
                <div className={`installment-item-row ${membershipOutstanding > 0 ? 'pending-row' : 'paid-row'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`inst-badge-status ${membershipOutstanding > 0 ? 'red' : 'green'}`}>
                      {membershipOutstanding > 0 ? '🔴' : '✅'}
                    </span>
                    <span className="font-bold text-xs text-slate-900">Installment 2 (2nd Half - 50%) — ₦{installmentAmount.toLocaleString()}</span>
                  </div>
                  <span className={`badge ${membershipOutstanding > 0 ? 'badge-warning' : 'badge-success'} text-xs font-bold`}>
                    {membershipOutstanding > 0 ? 'DUE' : 'PAID'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Button (Item 9 requirement) */}
          {membershipOutstanding > 0 ? (
            <button
              className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold py-2.5"
              onClick={() => handleOpenPayment('membership_installment', Math.min(installmentAmount, membershipOutstanding))}
            >
              <CreditCard size={16} />
              <span>[PAY NEXT INSTALLMENT — ₦{Math.min(installmentAmount, membershipOutstanding).toLocaleString()}]</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>ALL MEMBERSHIP INSTALLMENTS SETTLED (PAID IN FULL)</span>
            </div>
          )}
        </div>

        {/* 16. PLAYER AVAILABILITY INTEGRATION (Item 16 Requirement) */}
        <div className="card availability-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="badge badge-accent text-xs font-bold">PLAYER AVAILABILITY</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Matchday Roster</span>
            </div>

            <div className="gameweek-hero-box mb-4">
              <span className="gameweek-pill-badge">{availability.gameweek}</span>
              <h3 className="gameweek-fixture-title">{availability.fixture}</h3>
              <p className="gameweek-meta-line">
                <Calendar size={13} className="inline mr-1" /> {availability.date}
              </p>
              <p className="gameweek-meta-line">
                <MapPin size={13} className="inline mr-1" /> {availability.venue}
              </p>
            </div>

            {/* Voting Question (Item 16 requirement) */}
            <div className="availability-voting-box mb-4">
              <span className="availability-question-lbl">Are you available for this match?</span>
              <div className="availability-vote-buttons-grid">
                <button
                  type="button"
                  className={`vote-choice-btn green ${availability.user_vote === 'yes' ? 'selected' : ''}`}
                  onClick={() => setMemberAvailability('yes')}
                >
                  <span className="vote-emoji">🟢</span>
                  <span className="vote-label">YES</span>
                  {availability.user_vote === 'yes' && <Check size={14} className="ml-auto text-emerald-700" />}
                </button>

                <button
                  type="button"
                  className={`vote-choice-btn yellow ${availability.user_vote === 'maybe' ? 'selected' : ''}`}
                  onClick={() => setMemberAvailability('maybe')}
                >
                  <span className="vote-emoji">🟡</span>
                  <span className="vote-label">MAYBE</span>
                  {availability.user_vote === 'maybe' && <Check size={14} className="ml-auto text-amber-700" />}
                </button>

                <button
                  type="button"
                  className={`vote-choice-btn red ${availability.user_vote === 'no' ? 'selected' : ''}`}
                  onClick={() => setMemberAvailability('no')}
                >
                  <span className="vote-emoji">🔴</span>
                  <span className="vote-label">NO</span>
                  {availability.user_vote === 'no' && <Check size={14} className="ml-auto text-rose-700" />}
                </button>
              </div>
            </div>

            {/* Extra Unregistered Guests Option (₦10,000 per person) */}
            <div className="guest-pass-container mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <UserPlus size={15} className="text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Coming with Extra Guests?</span>
                </div>
                <span className="text-3xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ₦10,000 / guest
                </span>
              </div>
              <p className="text-3xs text-slate-500 mb-3">
                Bring unregistered friends or guest players for this fixture. Unregistered players require a matchday guest clearance pass.
              </p>

              <div className="guest-selector-row">
                <div className="guest-counter-pill">
                  <button
                    type="button"
                    className="guest-count-btn"
                    onClick={() => setGuestCount(prev => Math.max(0, prev - 1))}
                    disabled={guestCount === 0}
                    title="Decrease guest count"
                  >
                    <Minus size={13} />
                  </button>
                  <div className="guest-count-display font-mono">
                    <span className="guest-num">{guestCount}</span>
                    <span className="guest-lbl">{guestCount === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                  <button
                    type="button"
                    className="guest-count-btn"
                    onClick={() => setGuestCount(prev => Math.min(10, prev + 1))}
                    title="Add another guest"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`btn guest-pay-btn ${guestCount > 0 ? 'btn-primary' : 'btn-disabled'}`}
                  disabled={guestCount === 0}
                  onClick={handlePayForGuests}
                >
                  <CreditCard size={13} />
                  <span>
                    {guestCount > 0 ? `Pay ₦${totalGuestAmount.toLocaleString()} via Paystack` : 'Select Guest Count'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Squad Roster Live Bar */}
          <div className="squad-response-counter pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600">
            <span>Squad Responses:</span>
            <div className="flex gap-3 font-semibold">
              <span className="text-emerald-700">🔵 {availability.roster.yes} Available</span>
              <span className="text-amber-700">🟡 {availability.roster.maybe} Unsure</span>
              <span className="text-rose-700">🔴 {availability.roster.no} Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. RECENT PAYMENT HISTORY PREVIEW (Item 7 Requirement) */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">RECENT PAYMENT HISTORY</h3>
            <p className="text-xs text-slate-500">Official club transactions recorded for {currentMember.full_name}</p>
          </div>
          <button className="btn btn-secondary text-xs font-semibold py-1.5 px-3" onClick={() => navigate('/payment-history')}>
            View Full Ledger
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>Date</th>
                <th style={{ minWidth: '220px' }}>Description</th>
                <th style={{ minWidth: '120px' }}>Amount</th>
                <th style={{ minWidth: '90px', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: '130px' }}>Reference</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {memberTxs.map((tx) => (
                <tr key={tx.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setReceiptModalState({ isOpen: true, transaction: tx })}>
                  <td className="font-medium text-slate-700 text-xs">{tx.date_display}</td>
                  <td>
                    <span className="font-bold text-slate-900 text-xs">{tx.description}</span>
                  </td>
                  <td className="font-mono font-extrabold text-slate-900 text-xs">
                    ₦{Number(tx.amount || 0).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success text-xs font-bold">Paid</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {tx.reference}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary text-xs py-1 px-2.5 font-bold"
                      onClick={(e) => {
                        e.stopPropagation()
                        setReceiptModalState({ isOpen: true, transaction: tx })
                      }}
                    >
                      [RECEIPT]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
