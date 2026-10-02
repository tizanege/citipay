import { useState } from 'react'
import {
  CreditCard, ShieldCheck, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Download, RefreshCw, Zap, Landmark, Check,
  Wifi, Sparkles, AlertCircle, Wallet, FileText
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './PaymentsPage.css'

export default function PaymentsPage() {
  const { currentMember, currentClub, setPaymentModalState, setReceiptModalState } = useCitiPay()

  const paidPercent = Math.round((currentMember.membership_paid / currentMember.membership_fee) * 100)
  const installmentAmount = Math.round((currentMember.membership_fee || 100000) / 2)
  const nextInstallmentDue = currentMember.membership_outstanding > 0 ? Math.min(installmentAmount, currentMember.membership_outstanding) : 0

  const handleOpenPayment = (type = 'membership_installment', defaultAmount = nextInstallmentDue || installmentAmount) => {
    setPaymentModalState({
      isOpen: true,
      type,
      defaultAmount: defaultAmount || currentMember.membership_outstanding || installmentAmount
    })
  }

  return (
    <div className="payments-page-wrapper">
      {/* Header */}
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-success text-2xs font-bold">2026/27 Active Season</span>
            <span className="text-xs text-slate-500 font-mono">Member: {currentMember.member_id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Portal & Payments</h1>
          <p className="page-header-sub">
            Pay club membership fees, monthly social dues, and merchandise securely via <strong>Paystack</strong>
          </p>
        </div>

        <button
          className="btn btn-primary flex items-center gap-2 font-bold py-2.5 px-5"
          onClick={() => handleOpenPayment('membership_installment', nextInstallmentDue || installmentAmount)}
        >
          <CreditCard size={17} />
          <span>[MAKE PAYMENT]</span>
        </button>
      </div>

      {/* Top Row: Virtual Player Card + 3 Metric Cards */}
      <div className="payments-top-grid mb-8">
        {/* Virtual Card */}
        <div className="virtual-platinum-card">
          <div className="card-top-row">
            <div>
              <span className="card-brand-title">{currentClub.name}</span>
              <div className="text-xs text-emerald-100">Official Club Member ID</div>
            </div>
            <Wifi size={22} className="text-white opacity-80" />
          </div>

          <div className="card-chip-box">
            <div className="metallic-chip" />
            <span className="card-status-badge">PAYSTACK DIRECT</span>
          </div>

          <div className="card-number-text">
            {currentMember.member_id}
          </div>

          <div className="card-bottom-row">
            <div>
              <span className="card-lbl">MEMBER NAME</span>
              <div className="card-val">{currentMember.full_name.toUpperCase()}</div>
            </div>
            <div>
              <span className="card-lbl">STATUS</span>
              <div className="card-val text-emerald-300">
                {currentMember.status === 'green' ? '🟢 ELIGIBLE' : currentMember.status === 'yellow' ? '🟡 DUE SOON' : '🔴 INACTIVE'}
              </div>
            </div>
            <div>
              <span className="card-lbl">CLUB</span>
              <div className="card-val">{currentClub.code}</div>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="payments-metric-stack">
          <div className="card payment-kpi-card">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold uppercase text-slate-500">Season Membership Fee</span>
              <div className="stat-icon-lux bg-blue-50 text-blue-600">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">₦{currentMember.membership_fee.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">{currentClub.name} Official Registration</div>
          </div>

          <div className="card payment-kpi-card">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold uppercase text-slate-500">Settled to Date</span>
              <div className="stat-icon-lux bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">₦{currentMember.membership_paid.toLocaleString()}</div>
            <div className="text-xs text-emerald-700 font-semibold mt-1">({paidPercent}% settled)</div>
          </div>

          <div className="card payment-kpi-card">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold uppercase text-slate-500">Outstanding Balance</span>
              <div className="stat-icon-lux bg-amber-50 text-amber-600">
                <Clock size={18} />
              </div>
            </div>
            <div className={`text-2xl font-extrabold font-mono ${currentMember.membership_outstanding > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              ₦{currentMember.membership_outstanding.toLocaleString()}
            </div>
            <div className="text-xs text-muted mt-1">{currentMember.next_payment_label}</div>
          </div>
        </div>
      </div>

      {/* 9. MEMBERSHIP PAYMENT PLAN & QUICK ACTIONS */}
      <div className="grid-2 gap-6 mb-8">
        {/* Left: Installment Timeline */}
        <div className="card">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">MEMBERSHIP PAYMENT PLAN</h3>
              <p className="text-xs text-slate-500">Scheduled 2-part installment breakdown (Bi-annual)</p>
            </div>
            <span className="badge badge-success text-xs font-bold">{paidPercent}% Cleared</span>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            {currentMember.installments ? (
              currentMember.installments.map((inst, idx) => (
                <div key={inst.id || idx} className={`installment-item-row ${inst.status === 'paid' ? 'paid-row' : 'pending-row'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-base">{inst.status === 'paid' ? '✅' : '🔴'}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{inst.label} — ₦{inst.amount.toLocaleString()}</div>
                      <div className="text-3xs text-slate-500">
                        {inst.status === 'paid' ? `Paid on ${inst.paid_at} · Ref: ${inst.ref}` : `Status: Outstanding / Due`}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${inst.status === 'paid' ? 'badge-success' : 'badge-warning'} text-xs font-bold`}>
                    {inst.status === 'paid' ? 'PAID' : 'DUE'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">No installments configured.</div>
            )}
          </div>

          <button
            className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold py-3"
            onClick={() => handleOpenPayment('membership_installment', nextInstallmentDue || installmentAmount)}
          >
            <CreditCard size={17} />
            <span>[PAY NEXT INSTALLMENT — ₦{(nextInstallmentDue || installmentAmount).toLocaleString()}]</span>
          </button>
        </div>

        {/* Right: Quick Payment Category Cards */}
        <div className="flex flex-col gap-4">
          <div className="card p-4 hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-accent text-3xs font-bold uppercase mb-1 block">Monthly Club Obligation</span>
                <h4 className="font-bold text-sm text-slate-900">Social Dues & Refreshments</h4>
                <p className="text-xs text-slate-500 mt-0.5">September 2026 Monthly Club Social Dues (₦5,000)</p>
              </div>
              <button
                className="btn btn-primary text-xs font-bold py-2 px-4"
                onClick={() => handleOpenPayment('social_dues', 5000)}
              >
                Pay ₦5,000
              </button>
            </div>
          </div>

          <div className="card p-4 hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-secondary text-3xs font-bold uppercase mb-1 block">Kit & Apparel</span>
                <h4 className="font-bold text-sm text-slate-900">Official Matchday Jersey</h4>
                <p className="text-xs text-slate-500 mt-0.5">Home & Away Customized Kit #{currentMember.jersey_number || '10'}</p>
              </div>
              <button
                className="btn btn-secondary text-xs font-bold py-2 px-4"
                onClick={() => handleOpenPayment('merchandise', 18000)}
              >
                Buy ₦18,000
              </button>
            </div>
          </div>

          <div className="card p-4 hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-accent text-3xs font-bold uppercase mb-1 block">Custom Amount</span>
                <h4 className="font-bold text-sm text-slate-900">Other Club-Approved Payment</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tournaments, fines, donations, or custom amount</p>
              </div>
              <button
                className="btn btn-secondary text-xs font-bold py-2 px-4"
                onClick={() => handleOpenPayment('other_approved', 10000)}
              >
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
