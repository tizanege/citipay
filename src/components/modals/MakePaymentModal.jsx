import { useState } from 'react'
import {
  X, CreditCard, ShieldCheck, CheckCircle2, ChevronRight,
  Sparkles, Check, ArrowRight, Wallet, Landmark, Smartphone,
  FileText, ShoppingBag, Shield, HelpCircle
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function MakePaymentModal() {
  const {
    paymentModalState,
    setPaymentModalState,
    processOnlinePayment,
    setReceiptModalState,
    currentMember,
    currentClub
  } = useCitiPay()

  const halfMembership = Math.round((currentMember.membership_fee || currentClub?.membership_fee || 100000) / 2)
  const defaultInstAmount = currentMember.membership_outstanding > 0 ? Math.min(halfMembership, currentMember.membership_outstanding) : halfMembership

  const [paymentType, setPaymentType] = useState(paymentModalState.type || 'membership_installment')
  const [amount, setAmount] = useState(paymentModalState.defaultAmount || defaultInstAmount)
  const [paymentMethod, setPaymentMethod] = useState('paystack_card') // 'paystack_card' | 'bank_transfer' | 'ussd' | 'apple_pay'
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [successTx, setSuccessTx] = useState(null)

  if (!paymentModalState.isOpen) return null

  const handleTypeChange = (type) => {
    setPaymentType(type)
    if (type === 'membership') setAmount(currentMember.membership_outstanding || currentMember.membership_fee || 100000)
    else if (type === 'membership_installment') setAmount(defaultInstAmount)
    else if (type === 'social_dues') setAmount(currentClub?.monthly_social_dues || 5000)
    else if (type === 'merchandise') setAmount(18000)
    else if (type === 'other_approved') setAmount(10000)
  }

  const handleConfirmPay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      let methodLabel = 'Paystack (Debit Card)'
      if (paymentMethod === 'bank_transfer') methodLabel = 'Paystack (Instant Bank Transfer)'
      else if (paymentMethod === 'ussd') methodLabel = 'Paystack (USSD *737#)'
      else if (paymentMethod === 'apple_pay') methodLabel = 'Apple Pay / Paystack'

      const tx = processOnlinePayment({
        paymentType,
        amount,
        method: methodLabel,
        notes
      })

      setIsProcessing(false)
      setSuccessTx(tx)
    }, 1200)
  }

  const handleClose = () => {
    setSuccessTx(null)
    setPaymentModalState({ isOpen: false, type: 'membership_installment', defaultAmount: defaultInstAmount })
  }

  const handleViewReceipt = () => {
    const tx = successTx
    handleClose()
    if (tx) {
      setReceiptModalState({ isOpen: true, transaction: tx })
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-success text-xs font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Paystack 256-Bit Secured
              </span>
              <span className="text-xs text-slate-500 font-mono">{currentMember.member_id}</span>
            </div>
            <h2 className="modal-title-portal">
              {successTx ? 'Payment Cleared' : 'Make Approved Payment'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-portal">
          {successTx ? (
            /* Success View (Item 8 requirement) */
            <div className="payment-success-card">
              <div className="success-icon-badge">
                <CheckCircle2 size={44} className="text-emerald-500" />
              </div>
              <h3 className="success-title">PAYMENT SUCCESSFUL</h3>
              <p className="success-sub">
                Your payment to <strong>{currentClub.name}</strong> was confirmed and credited instantly.
              </p>

              <div className="success-reference-box">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Transaction Reference</span>
                  <span className="badge badge-success text-xs font-bold">PAID</span>
                </div>
                <div className="font-mono font-extrabold text-base text-emerald-800 tracking-wider">
                  {successTx.receipt_no}
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-100 flex justify-between text-xs text-slate-700">
                  <span>Amount Settled:</span>
                  <strong className="font-mono text-sm text-slate-900">₦{Number(successTx.amount).toLocaleString()}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mt-6">
                <button className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold py-3" onClick={handleViewReceipt}>
                  <FileText size={17} /> VIEW OFFICIAL RECEIPT
                </button>
                <button className="btn btn-secondary w-full text-xs font-semibold py-2.5" onClick={handleClose}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Payment Form */
            <div className="flex flex-col gap-4">
              {/* Payment Type Selection (Item 8 Requirement) */}
              <div>
                <label className="form-label-portal">SELECT PAYMENT TYPE</label>
                <div className="payment-type-grid">
                  <button
                    type="button"
                    className={`payment-type-option ${paymentType === 'membership_installment' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('membership_installment')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Membership Installment</div>
                        <div className="text-2xs text-slate-500">₦{halfMembership.toLocaleString()} / Tranche (50%)</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-type-option ${paymentType === 'membership' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('membership')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Full Membership Fee</div>
                        <div className="text-2xs text-slate-500">₦{(currentMember.membership_fee || 100000).toLocaleString()} Total Season</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-type-option ${paymentType === 'social_dues' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('social_dues')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Monthly Social Dues</div>
                        <div className="text-2xs text-slate-500">₦{(currentClub?.monthly_social_dues || 5000).toLocaleString()} (Current Month)</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-type-option ${paymentType === 'merchandise' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('merchandise')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Merchandise & Kits</div>
                        <div className="text-2xs text-slate-500">Official Club Jersey pack</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-type-option ${paymentType === 'other_approved' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('other_approved')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Other Club-Approved Payment</div>
                        <div className="text-2xs text-slate-500">Tournaments, fines, donations</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="form-label-portal">PAYMENT AMOUNT (NGN)</label>
                <div className="relative">
                  <span className="currency-prefix">₦</span>
                  <input
                    type="number"
                    className="form-input-portal with-prefix font-mono font-bold text-lg"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(100, Number(e.target.value)))}
                    placeholder="25,000"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="form-label-portal">PAYMENT METHOD</label>
                <div className="method-pill-grid">
                  <button
                    type="button"
                    className={`method-pill-btn ${paymentMethod === 'paystack_card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('paystack_card')}
                  >
                    <CreditCard size={15} />
                    <span>Debit Card</span>
                  </button>
                  <button
                    type="button"
                    className={`method-pill-btn ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('bank_transfer')}
                  >
                    <Landmark size={15} />
                    <span>Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    className={`method-pill-btn ${paymentMethod === 'ussd' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('ussd')}
                  >
                    <Smartphone size={15} />
                    <span>USSD</span>
                  </button>
                </div>
              </div>

              {/* Summary Checkout Box */}
              <div className="checkout-summary-box">
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>Member:</span>
                  <strong className="text-slate-900">{currentMember.full_name} ({currentMember.member_id})</strong>
                </div>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>Club Destination:</span>
                  <strong className="text-slate-900">{currentClub.name}</strong>
                </div>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>Payment Gateway:</span>
                  <span className="text-emerald-700 font-bold">Paystack Nigeria (Zero Fees)</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-slate-900">Total to Charge:</span>
                  <span className="font-extrabold text-xl text-emerald-600 font-mono">
                    ₦{Number(amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-secondary flex-1 text-xs font-semibold py-3"
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-2 flex items-center justify-center gap-2 font-bold py-3"
                  onClick={handleConfirmPay}
                  disabled={isProcessing || amount <= 0}
                >
                  {isProcessing ? (
                    <span>Processing Paystack...</span>
                  ) : (
                    <>
                      <span>CONFIRM PAYMENT</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
