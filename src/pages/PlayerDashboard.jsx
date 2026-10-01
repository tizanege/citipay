import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard, ShieldCheck, AlertCircle, CheckCircle2, Clock,
  ArrowRight, Sparkles, Download, Check, HelpCircle, PhoneCall,
  Calendar, MapPin, Zap, Star, Shield, Trophy, ChevronRight,
  TrendingUp, User, Users, RefreshCw
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
    switchMember
  } = useCitiPay()

  const isGreen = currentMember.status === 'green'
  const isYellow = currentMember.status === 'yellow'
  const isRed = currentMember.status === 'red'

  // Recent transactions for this player
  const memberTxs = transactions.filter(
    tx => tx.member_id === currentMember.member_id || tx.member_name === currentMember.full_name
  ).slice(0, 4)

  const handleOpenPayment = (type = 'membership_installment', defaultAmount = 25000) => {
    setPaymentModalState({
      isOpen: true,
      type,
      defaultAmount: defaultAmount || currentMember.membership_outstanding || 25000
    })
  }

  return (
    <div className="portal-dashboard-wrapper">
      {/* Quick Member Persona Switcher Toolbar (Testing Bar) */}
      <div className="persona-quick-bar mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xs font-extrabold uppercase text-slate-500 tracking-wider">
            Quick Persona Switch:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              className={`persona-switch-pill ${currentMember.id === 'mem-001' ? 'active' : ''}`}
              onClick={() => switchMember('mem-001')}
            >
              <span className="dot green" /> Michael Esu (🟢 Eligible)
            </button>
            <button
              className={`persona-switch-pill ${currentMember.id === 'mem-002' ? 'active' : ''}`}
              onClick={() => switchMember('mem-002')}
            >
              <span className="dot yellow" /> Player B (🟡 Due Soon)
            </button>
            <button
              className={`persona-switch-pill ${currentMember.id === 'mem-003' ? 'active' : ''}`}
              onClick={() => switchMember('mem-003')}
            >
              <span className="dot red" /> Player C (🔴 Not Eligible)
            </button>
          </div>
        </div>
      </div>

      {/* 3. MEMBER WELCOME & IDENTITY HEADER (Item 3 Requirement) */}
      <div className="member-welcome-header mb-5">
        <div className="welcome-left-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="club-badge-micro">
              <Trophy size={12} className="text-emerald-700" /> {currentClub.name}
            </span>
            <span className="text-xs text-slate-500 font-semibold font-mono">
              Member ID: <strong>{currentMember.member_id}</strong>
            </span>
          </div>
          <h1 className="welcome-name-title">
            WELCOME, {currentMember.full_name.split(' ')[0].toUpperCase()}
          </h1>
          <p className="welcome-sub-desc">
            {currentMember.nickname ? `"${currentMember.nickname}" · ` : ''}Jersey #{currentMember.jersey_number || '10'} · {currentMember.position || 'CAM'}
          </p>
        </div>

        <div className="welcome-right-col">
          <button
            className="btn btn-primary btn-make-payment-hero flex items-center gap-2"
            onClick={() => handleOpenPayment('membership_installment', 25000)}
          >
            <CreditCard size={18} />
            <span>MAKE PAYMENT</span>
          </button>
        </div>
      </div>

      {/* 4. THREE-COLOR ELIGIBILITY SYSTEM BANNER (Item 4 Requirement) */}
      <div className={`eligibility-status-banner mb-6 ${currentMember.status}-banner`}>
        <div className="eligibility-banner-inner">
          <div className="eligibility-icon-circle">
            {isGreen && <CheckCircle2 size={32} className="text-emerald-700" />}
            {isYellow && <Clock size={32} className="text-amber-700" />}
            {isRed && <AlertCircle size={32} className="text-rose-700" />}
          </div>

          <div className="eligibility-text-wrap">
            <div className="eligibility-pill-tag">
              <span className={`status-dot ${currentMember.status}`} />
              <span>
                {isGreen && '🟢 GREEN — ELIGIBLE'}
                {isYellow && '🟡 YELLOW — PAYMENT DUE SOON'}
                {isRed && '🔴 RED — NOT ELIGIBLE'}
              </span>
            </div>

            <h2 className="eligibility-main-heading">
              {isGreen && 'YOU ARE ELIGIBLE'}
              {isYellow && 'PAYMENT DUE SOON'}
              {isRed && 'NOT ELIGIBLE'}
            </h2>

            <p className="eligibility-explanation">
              {isGreen && 'Your membership is currently up to date. You are cleared for all official club matchdays and training.'}
              {isYellow && (
                <>
                  Your account has an upcoming balance of <strong>₦{currentMember.membership_outstanding.toLocaleString()}</strong> due in 7 days.
                </>
              )}
              {isRed && (
                <>
                  Your account has an outstanding balance of <strong>₦{currentMember.membership_outstanding.toLocaleString()}</strong>.
                  Your membership status is currently inactive per the club's payment rules.
                </>
              )}
            </p>
          </div>

          <div className="eligibility-action-wrap">
            {!isGreen ? (
              <button
                className={`btn font-extrabold flex items-center justify-center gap-2 py-3 px-6 ${
                  isRed ? 'btn-danger-prominent' : 'btn-warning-prominent'
                }`}
                onClick={() => handleOpenPayment('membership_installment', currentMember.membership_outstanding)}
              >
                <CreditCard size={17} />
                <span>[MAKE PAYMENT]</span>
              </button>
            ) : (
              <div className="cleared-badge-box">
                <ShieldCheck size={20} className="text-emerald-700" />
                <span className="text-xs font-bold text-emerald-800">Matchday Cleared</span>
              </div>
            )}

            {isRed && (
              <button
                className="btn btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 mt-1"
                onClick={() => alert('Contacting Club Administration: President (+234 802 345 6789) / admin@sundayleague.ng')}
              >
                <PhoneCall size={13} />
                <span>Contact Club Administration</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. PAYMENT SUMMARY & SOCIAL DUES & NEXT PAYMENT (Item 3 Mobile-First Grid) */}
      <div className="grid-3 mb-6">
        {/* Card 1: Membership Fee Summary */}
        <div className="card payment-summary-card">
          <div className="flex justify-between items-start mb-2">
            <span className="card-kpi-lbl">MEMBERSHIP FEE</span>
            <span className={`badge ${currentMember.membership_outstanding === 0 ? 'badge-success' : 'badge-warning'} text-xs font-bold`}>
              {currentMember.membership_outstanding === 0 ? '🟢 PAID' : '🟡 PARTIAL'}
            </span>
          </div>

          <div className="card-kpi-amount text-slate-900 font-mono">
            ₦{currentMember.membership_fee.toLocaleString()}
          </div>

          <div className="summary-breakdown-rows mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500">Paid:</span>
              <strong className="text-emerald-700 font-mono font-bold">
                ₦{currentMember.membership_paid.toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Outstanding:</span>
              <strong className={`font-mono font-bold ${currentMember.membership_outstanding > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                ₦{currentMember.membership_outstanding.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Social Dues Summary */}
        <div className="card payment-summary-card">
          <div className="flex justify-between items-start mb-2">
            <span className="card-kpi-lbl">SOCIAL DUES</span>
            <span className={`badge ${currentMember.social_dues_status === 'paid' ? 'badge-success' : 'badge-danger'} text-xs font-bold`}>
              {currentMember.social_dues_status === 'paid' ? '🟢 PAID' : '🔴 DUE'}
            </span>
          </div>

          <div className="card-kpi-amount text-slate-900 font-mono">
            ₦{currentMember.social_dues_current_month.toLocaleString()}
          </div>

          <div className="summary-breakdown-rows mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500">Current Month:</span>
              <strong className="text-slate-900">September 2026</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Status:</span>
              <strong className={currentMember.social_dues_status === 'paid' ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                {currentMember.social_dues_status === 'paid' ? 'Paid in Full' : 'Due for Payment'}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Next Payment */}
        <div className="card payment-summary-card">
          <div className="flex justify-between items-start mb-2">
            <span className="card-kpi-lbl">NEXT PAYMENT</span>
            <Calendar size={18} className="text-slate-400" />
          </div>

          <div className="card-kpi-amount text-slate-900 text-lg font-bold">
            {currentMember.next_payment_amount > 0 ? (
              <span className="font-mono text-amber-600">₦{currentMember.next_payment_amount.toLocaleString()}</span>
            ) : (
              <span className="text-emerald-700 text-base font-bold">No payment currently due</span>
            )}
          </div>

          <div className="summary-breakdown-rows mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Notice:</span>
              <span className="text-slate-700 font-medium text-right">
                {currentMember.next_payment_label}
              </span>
            </div>
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
              <strong className="plan-stat-val text-slate-900 font-mono">₦{currentMember.membership_fee.toLocaleString()}</strong>
            </div>
            <div className="plan-stat-item">
              <span className="plan-stat-lbl">Paid:</span>
              <strong className="plan-stat-val text-emerald-700 font-mono">₦{currentMember.membership_paid.toLocaleString()}</strong>
            </div>
            <div className="plan-stat-item">
              <span className="plan-stat-lbl">Remaining:</span>
              <strong className="plan-stat-val text-rose-600 font-mono">₦{currentMember.membership_outstanding.toLocaleString()}</strong>
            </div>
          </div>

          {/* Payment Schedule (Item 9 format) */}
          <div className="installment-schedule-list flex flex-col gap-2.5 mb-4">
            {currentMember.installments ? (
              currentMember.installments.map((inst, idx) => (
                <div key={inst.id || idx} className={`installment-item-row ${inst.status === 'paid' ? 'paid-row' : 'pending-row'}`}>
                  <div className="flex items-center gap-2.5">
                    {inst.status === 'paid' ? (
                      <span className="inst-badge-status green">✅</span>
                    ) : (
                      <span className="inst-badge-status red">🔴</span>
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {inst.label || `Installment ${inst.number}`} — ₦{inst.amount.toLocaleString()}
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
                    <span className="font-bold text-xs text-slate-900">Installment 1 — ₦25,000</span>
                  </div>
                  <span className="badge badge-success text-xs font-bold">PAID</span>
                </div>
                <div className="installment-item-row paid-row">
                  <div className="flex items-center gap-2">
                    <span className="inst-badge-status green">✅</span>
                    <span className="font-bold text-xs text-slate-900">Installment 2 — ₦25,000</span>
                  </div>
                  <span className="badge badge-success text-xs font-bold">PAID</span>
                </div>
                <div className="installment-item-row paid-row">
                  <div className="flex items-center gap-2">
                    <span className="inst-badge-status green">✅</span>
                    <span className="font-bold text-xs text-slate-900">Installment 3 — ₦25,000</span>
                  </div>
                  <span className="badge badge-success text-xs font-bold">PAID</span>
                </div>
                <div className="installment-item-row pending-row">
                  <div className="flex items-center gap-2">
                    <span className="inst-badge-status red">🔴</span>
                    <span className="font-bold text-xs text-slate-900">Installment 4 — ₦25,000</span>
                  </div>
                  <span className="badge badge-warning text-xs font-bold">DUE</span>
                </div>
              </>
            )}
          </div>

          {/* Button (Item 9 requirement) */}
          {currentMember.membership_outstanding > 0 ? (
            <button
              className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold py-2.5"
              onClick={() => handleOpenPayment('membership_installment', Math.min(25000, currentMember.membership_outstanding))}
            >
              <CreditCard size={16} />
              <span>[PAY NEXT INSTALLMENT — ₦{Math.min(25000, currentMember.membership_outstanding).toLocaleString()}]</span>
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
                    ₦{Number(tx.amount).toLocaleString()}
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
