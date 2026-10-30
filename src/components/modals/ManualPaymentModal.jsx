import { useState, useEffect } from 'react'
import {
  X, Landmark, Calendar, User, DollarSign, FileText,
  ShieldCheck, CheckCircle2, ArrowRight
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function ManualPaymentModal() {
  const {
    manualPaymentModalState,
    setManualPaymentModalState,
    recordManualPayment,
    members,
    setReceiptModalState
  } = useCitiPay()

  const defaultMember = manualPaymentModalState.member || members[0]
  const defaultInst = Math.round((defaultMember?.membership_fee || 100000) / 2)

  const [selectedMemberId, setSelectedMemberId] = useState(defaultMember?.id || 'mem-001')
  const [amount, setAmount] = useState(String(defaultInst))
  const [paymentType, setPaymentType] = useState('membership_installment')
  const [reference, setReference] = useState(`BANK-${Math.floor(10000 + Math.random() * 90000)}`)
  const [paymentDate, setPaymentDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
  const [notes, setNotes] = useState('Direct bank transfer verified by Admin')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep selection in sync when modal opens with a specific member
  useEffect(() => {
    if (manualPaymentModalState.isOpen) {
      const activeMember = manualPaymentModalState.member || members[0]
      if (activeMember) {
        setSelectedMemberId(activeMember.id)
        const inst = activeMember.membership_outstanding > 0
          ? Math.min(Math.round((activeMember.membership_fee || 100000) / 2), activeMember.membership_outstanding)
          : Math.round((activeMember.membership_fee || 100000) / 2)
        setAmount(String(inst || 50000))
        setReference(`BANK-${Math.floor(10000 + Math.random() * 90000)}`)
        setPaymentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
      }
    }
  }, [manualPaymentModalState.isOpen, manualPaymentModalState.member, members])

  if (!manualPaymentModalState.isOpen) return null

  const targetMember = members.find(m => m.id === selectedMemberId) || defaultMember

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const tx = await recordManualPayment({
        memberId: selectedMemberId,
        amount: Number(amount),
        paymentType,
        reference,
        date: paymentDate,
        notes
      })

      setIsSubmitting(false)
      setManualPaymentModalState({ isOpen: false, member: null })

      if (tx) {
        setReceiptModalState({ isOpen: true, transaction: tx })
      }
    } catch (err) {
      console.error('Error submitting manual payment:', err)
      setIsSubmitting(false)
      setManualPaymentModalState({ isOpen: false, member: null })
    }
  }

  const handleClose = () => {
    setManualPaymentModalState({ isOpen: false, member: null })
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent text-xs font-bold flex items-center gap-1">
                <Landmark size={12} /> Admin Offline Settlement
              </span>
            </div>
            <h2 className="modal-title-portal">Record Manual Payment</h2>
            <p className="text-xs text-slate-500">Record payments made outside the portal (Bank transfer or Cash)</p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form (Item 14 Requirement) */}
        <form onSubmit={handleSubmit} className="modal-body-portal flex flex-col gap-4">
          {/* Member Selector */}
          <div>
            <label className="form-label-portal">SELECT MEMBER</label>
            <select
              className="form-input-portal font-semibold text-slate-900"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_id}) · Owed: ₦{m.membership_outstanding.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="form-label-portal">PAYMENT AMOUNT (NGN)</label>
            <div className="relative">
              <span className="currency-prefix">₦</span>
              <input
                type="number"
                className="form-input-portal with-prefix font-mono font-bold text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="100"
              />
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label className="form-label-portal">PAYMENT TYPE</label>
            <select
              className="form-input-portal font-medium text-slate-800"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="membership">Membership (Full / Partial)</option>
              <option value="membership_installment">Membership installment</option>
              <option value="social_dues">Social Dues</option>
              <option value="merchandise">Merchandise & Kits</option>
              <option value="other_approved">Other club-approved payment</option>
            </select>
          </div>

          {/* Reference & Date Grid */}
          <div className="grid-2 gap-3">
            <div>
              <label className="form-label-portal">BANK / RECEIPT REFERENCE</label>
              <input
                type="text"
                className="form-input-portal font-mono text-sm font-bold"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="BANK-12345"
                required
              />
            </div>
            <div>
              <label className="form-label-portal">PAYMENT DATE</label>
              <input
                type="text"
                className="form-input-portal text-sm"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                placeholder="September 28, 2026"
                required
              />
            </div>
          </div>

          {/* Notes / Reason */}
          <div>
            <label className="form-label-portal">ADMIN NOTES & AUDIT DETAILS</label>
            <textarea
              className="form-input-portal text-xs h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed GTB bank alert from member."
            />
          </div>

          {/* Real-time Recalculation Preview Banner */}
          <div className="recalculation-preview-box">
            <div className="font-bold text-xs text-slate-900 mb-1">AUTOMATIC RECALCULATION PREVIEW:</div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Current Outstanding:</span>
              <span className="font-mono font-bold">₦{targetMember?.membership_outstanding?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>New Outstanding after Save:</span>
              <span className="font-mono font-bold text-emerald-700">
                ₦{Math.max(0, (targetMember?.membership_outstanding || 0) - Number(amount || 0)).toLocaleString()}
              </span>
            </div>
            <div className="text-3xs text-slate-500 mt-1.5 italic">
              Member payment history, outstanding balance, and eligibility indicator will update automatically.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-2 flex items-center justify-center gap-2 font-bold py-2.5"
              disabled={isSubmitting || !amount}
            >
              {isSubmitting ? 'Saving to Ledger...' : 'SAVE MANUAL PAYMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
