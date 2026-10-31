import { useState } from 'react'
import {
  X, Landmark, CheckCircle2, AlertCircle, Copy, Check,
  Upload, ArrowRight, ShieldCheck, DollarSign
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function SubmitPaymentProofModal() {
  const {
    submitProofModalState,
    setSubmitProofModalState,
    submitManualPaymentTransfer,
    currentMember,
    currentClub
  } = useCitiPay()

  const [paymentType, setPaymentType] = useState('membership_installment')
  const [amount, setAmount] = useState(String(Math.round((currentMember?.membership_fee || 100000) / 2)))
  const [reference, setReference] = useState('')
  const [senderBank, setSenderBank] = useState('')
  const [senderName, setSenderName] = useState(currentMember?.full_name || '')
  const [notes, setNotes] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!submitProofModalState?.isOpen) return null

  const handleClose = () => {
    setSubmitProofModalState({ isOpen: false })
    setIsSuccess(false)
    setErrorMessage('')
    setProofFile(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setProofFile(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!amount || Number(amount) <= 0) {
      setErrorMessage('Please enter a valid payment amount.')
      return
    }

    if (!reference.trim()) {
      setErrorMessage('Please provide your bank transfer session ID, transaction reference, or receipt number.')
      return
    }

    setIsSubmitting(true)

    try {
      const notesCombined = [
        senderBank ? `Bank: ${senderBank}` : null,
        senderName ? `Sender: ${senderName}` : null,
        notes ? `Note: ${notes}` : null,
        proofFile ? '[Receipt Image Attached]' : null
      ].filter(Boolean).join(' · ')

      await submitManualPaymentTransfer({
        memberId: currentMember.id,
        amount: Number(amount),
        paymentType,
        reference: reference.trim(),
        notes: notesCombined || 'Direct bank transfer receipt submitted by player for admin approval.'
      })

      setIsSubmitting(false)
      setIsSuccess(true)
    } catch (err) {
      setIsSubmitting(false)
      setErrorMessage(err.message || 'Failed to submit payment confirmation.')
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-card-portal max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent font-bold text-2xs">Player Self-Service</span>
            <span className="badge badge-secondary font-semibold text-2xs">Bank Transfer</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
            Submit Payment Confirmation
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Made an offline bank transfer or deposit? Submit your proof of payment so Super Admin and Executive staff can verify and clear your Starting XI status.
          </p>

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Confirmation Submitted!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mb-4 leading-relaxed">
                Your payment of <strong className="text-emerald-700 font-mono">₦{Number(amount).toLocaleString()}</strong> with reference <strong className="font-mono text-slate-900">{reference}</strong> has been logged to the <strong>Federation Payments Ledger</strong>.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-2xs font-medium max-w-sm mx-auto mb-5">
                ⏳ Super Admin has been notified and will verify your transfer against the bank statement to clear your account.
              </div>
              <button
                type="button"
                className="btn btn-primary font-bold text-xs py-2 px-6"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Official Account Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-4xs uppercase tracking-wider font-extrabold text-emerald-400">
                    BENEFICIARY BANK ACCOUNT
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('0092042084')
                      setCopiedAccount(true)
                      setTimeout(() => setCopiedAccount(false), 2000)
                    }}
                    className="text-4xs bg-white/10 hover:bg-white/20 text-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono"
                  >
                    {copiedAccount ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    {copiedAccount ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="font-mono text-base font-extrabold text-white">0092042084</div>
                    <div className="text-3xs text-slate-400">Access Bank · Oxsa int’l Nig Ltd.</div>
                  </div>
                  <span className="badge badge-success text-3xs font-bold">Official</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Category & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label-portal">PAYMENT CATEGORY *</label>
                  <select
                    className="form-input-portal text-xs font-semibold"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="membership_installment">Membership Installment</option>
                    <option value="membership">Full Season Fee</option>
                    <option value="social_dues">Monthly Social Dues (₦5k)</option>
                    <option value="merchandise_jersey">Official Jersey</option>
                    <option value="merchandise_bib">Training Bib</option>
                    <option value="other_approved">Other Approved Fee</option>
                  </select>
                </div>

                <div>
                  <label className="form-label-portal">AMOUNT TRANSFERRED (₦) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    placeholder="50000"
                    className="form-input-portal font-mono text-xs font-bold"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Reference & Sender Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label-portal">SESSION ID / BANK REF *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 090267241031..."
                    className="form-input-portal font-mono text-xs"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label-portal">YOUR SENDER ACCOUNT NAME</label>
                  <input
                    type="text"
                    placeholder="Name on your debit account"
                    className="form-input-portal text-xs"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              {/* Sender Bank & Receipt Upload */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label-portal">SENDER BANK</label>
                  <input
                    type="text"
                    placeholder="e.g. GTBank, Kuda, Zenith"
                    className="form-input-portal text-xs"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label-portal">PROOF OF TRANSFER (IMAGE)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="form-input-portal text-3xs pt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="form-label-portal">ADDITIONAL NOTES (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. Part payment for week 14 installment"
                  className="form-input-portal text-xs"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  className="btn btn-secondary text-xs font-bold py-2.5 px-4"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary text-xs font-bold py-2.5 px-6 flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck size={15} />
                  <span>{isSubmitting ? 'Submitting Proof...' : 'Send Confirmation to Admin'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

