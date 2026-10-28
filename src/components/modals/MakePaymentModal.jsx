import { useState, useEffect } from 'react'
import {
  X, CreditCard, ShieldCheck, CheckCircle2, ChevronRight,
  Sparkles, Check, ArrowRight, Wallet, Landmark, Smartphone,
  FileText, ShoppingBag, Shield, HelpCircle, Copy, AlertCircle, Building2
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function MakePaymentModal() {
  const {
    paymentModalState,
    setPaymentModalState,
    processOnlinePayment,
    recordManualPayment,
    submitManualPaymentTransfer,
    payWithWallet,
    setWalletModalState,
    setReceiptModalState,
    currentMember,
    currentClub,
    leagueSettings
  } = useCitiPay()

  const memberWalletBal = Number(currentMember?.wallet_balance || 0)
  const halfMembership = Math.round((currentMember.membership_fee || currentClub?.membership_fee || 100000) / 2)
  const defaultInstAmount = currentMember.membership_outstanding > 0 ? Math.min(halfMembership, currentMember.membership_outstanding) : halfMembership

  const [paymentType, setPaymentType] = useState(paymentModalState.type || 'membership_installment')
  const [amount, setAmount] = useState(paymentModalState.defaultAmount || defaultInstAmount)
  const [paymentMethod, setPaymentMethod] = useState('paystack') // 'paystack' | 'manual_bank' | 'wallet'
  const [paystackChannel, setPaystackChannel] = useState('all_channels') // 'all_channels' | 'card' | 'bank_transfer' | 'ussd'
  const [transferRef, setTransferRef] = useState('')
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successTx, setSuccessTx] = useState(null)

  // Sync state whenever modal opens or defaults change
  useEffect(() => {
    if (paymentModalState.isOpen) {
      const type = paymentModalState.type || 'membership_installment'
      setPaymentType(type)
      if (paymentModalState.defaultAmount) {
        setAmount(paymentModalState.defaultAmount)
      } else if (type === 'merchandise' || type === 'merchandise_jersey') {
        setAmount(leagueSettings?.jersey_price || 18000)
      } else if (type === 'merchandise_bib') {
        setAmount(leagueSettings?.bib_price || 6500)
      } else if (type === 'guest_pass') {
        setAmount(paymentModalState.defaultAmount || 10000)
      } else if (type === 'membership_installment') {
        setAmount(defaultInstAmount)
      }
      setSuccessTx(null)
      setErrorMessage('')
    }
  }, [paymentModalState.isOpen, paymentModalState.type, paymentModalState.defaultAmount, leagueSettings?.jersey_price, leagueSettings?.bib_price, defaultInstAmount])

  if (!paymentModalState.isOpen) return null

  const handleTypeChange = (type) => {
    setPaymentType(type)
    if (type === 'membership') setAmount(currentMember.membership_outstanding || currentMember.membership_fee || 100000)
    else if (type === 'membership_installment') setAmount(defaultInstAmount)
    else if (type === 'social_dues') setAmount(currentClub?.monthly_social_dues || 5000)
    else if (type === 'guest_pass') setAmount(10000)
    else if (type === 'merchandise' || type === 'merchandise_jersey') setAmount(leagueSettings?.jersey_price || 18000)
    else if (type === 'merchandise_bib') setAmount(leagueSettings?.bib_price || 6500)
    else if (type === 'other_approved') setAmount(10000)
  }

  const handleConfirmPay = async () => {
    setErrorMessage('')
    setIsProcessing(true)

    // Option 1: Direct Pay with CitiPay Virtual Wallet Balance
    if (paymentMethod === 'wallet') {
      try {
        const tx = await payWithWallet({
          paymentType,
          amount,
          notes
        })
        setIsProcessing(false)
        setSuccessTx(tx)
        return
      } catch (err) {
        setIsProcessing(false)
        setErrorMessage(err.message || 'Payment from wallet failed.')
        return
      }
    }

    // Option 2: Manual Bank Transfer
    if (paymentMethod === 'manual_bank') {
      setTimeout(async () => {
        const generatedRef = transferRef.trim() || `TRF-${Date.now().toString().slice(-6)}`
        const tx = await submitManualPaymentTransfer({
          memberId: currentMember.id,
          amount: Number(amount),
          paymentType,
          reference: generatedRef,
          notes: notes ? `Manual Bank Transfer: ${notes}` : 'Manual Direct Bank Transfer to Club Account'
        })
        setIsProcessing(false)
        setSuccessTx(tx)
      }, 700)
      return
    }

    // Option 3: Paystack Gateway (Card, Transfer, USSD, Multi-Channel)
    let selectedChannels = ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    if (paystackChannel === 'card') {
      selectedChannels = ['card']
    } else if (paystackChannel === 'bank_transfer') {
      selectedChannels = ['bank_transfer', 'bank']
    } else if (paystackChannel === 'ussd') {
      selectedChannels = ['ussd']
    }

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    const isLiveKey = paystackKey && paystackKey.startsWith('pk_') && paystackKey !== 'pk_test_your-key'

    if (!isLiveKey) {
      setIsProcessing(false)
      setErrorMessage('Paystack is not configured yet. Please select "Bank Transfer" or configure your Paystack Public Key.')
      return
    }

    if (typeof window !== 'undefined' && window.PaystackPop) {
      const generatedRef = `SL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      const playerEmail = currentMember.email || `${currentMember.member_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@citileague.ng`

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: playerEmail,
        amount: Math.round(Number(amount) * 100), // In Kobo
        currency: 'NGN',
        ref: generatedRef,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        metadata: {
          custom_fields: [
            { display_name: 'Member Name', variable_name: 'member_name', value: currentMember.full_name },
            { display_name: 'Member ID', variable_name: 'member_id', value: currentMember.member_id },
            { display_name: 'Club Destination', variable_name: 'club_name', value: currentClub.name },
            { display_name: 'Payment Category', variable_name: 'payment_type', value: paymentType },
            { display_name: 'Player Notes', variable_name: 'notes', value: notes || 'N/A' }
          ]
        },
        callback: function (response) {
          const confirmedRef = response.reference || generatedRef
          const tx = processOnlinePayment({
            paymentType,
            amount,
            method: 'Paystack Gateway',
            reference: confirmedRef,
            paymentMethod: 'paystack',
            notes
          })

          setIsProcessing(false)
          setSuccessTx(tx)
        },
        onClose: function () {
          setIsProcessing(false)
        }
      })

      handler.openIframe()
      return
    }

    setIsProcessing(false)
    setErrorMessage('Unable to initialize Paystack checkout. Please try again or select "Bank Transfer".')
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

  const isPendingTransfer = successTx && successTx.status === 'Pending'

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${isPendingTransfer ? 'badge-warning' : 'badge-success'} text-xs font-bold flex items-center gap-1`}>
                <ShieldCheck size={12} /> {isPendingTransfer ? 'Direct Transfer Submitted' : 'Paystack 256-Bit Secured'}
              </span>
              <span className="text-xs text-slate-500 font-mono">{currentMember.member_id}</span>
            </div>
            <h2 className="modal-title-portal">
              {successTx ? (isPendingTransfer ? 'Transfer Receipt Submitted' : 'Payment Cleared') : 'Make Approved Payment'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-portal">
          {successTx ? (
            /* Success / Pending View */
            <div className="payment-success-card">
              <div className="success-icon-badge">
                {isPendingTransfer ? (
                  <Landmark size={44} className="text-amber-500" />
                ) : (
                  <CheckCircle2 size={44} className="text-emerald-500" />
                )}
              </div>
              <h3 className="success-title">
                {isPendingTransfer ? 'TRANSFER PENDING CONFIRMATION' : 'PAYMENT SUCCESSFUL'}
              </h3>
              <p className="success-sub">
                {isPendingTransfer ? (
                  <>
                    Your transfer notice of <strong>₦{Number(successTx.amount).toLocaleString()}</strong> was received. It will <strong>only become successful once the club admin confirms</strong> the transaction on their bank statement.
                  </>
                ) : (
                  <>
                    Your payment to <strong>{currentClub.name}</strong> was confirmed and credited instantly.
                  </>
                )}
              </p>

              <div className="success-reference-box">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>{isPendingTransfer ? 'Deposit Reference' : 'Transaction Reference'}</span>
                  <span className={`badge ${isPendingTransfer ? 'badge-warning' : 'badge-success'} text-xs font-bold`}>
                    {isPendingTransfer ? 'PENDING ADMIN APPROVAL' : 'PAID'}
                  </span>
                </div>
                <div className="font-mono font-extrabold text-base text-slate-900 tracking-wider">
                  {successTx.reference}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-700">
                  <span>Amount Deposited:</span>
                  <strong className="font-mono text-sm text-slate-900">₦{Number(successTx.amount).toLocaleString()}</strong>
                </div>
                {isPendingTransfer && (
                  <p className="text-3xs text-amber-700 font-medium mt-2 pt-2 border-t border-amber-100">
                    💡 Once club management verifies the bank credit on their statement, your dues will automatically clear and your eligibility will update.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2.5 mt-6">
                {!isPendingTransfer && (
                  <button className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold py-3" onClick={handleViewReceipt}>
                    <FileText size={17} /> VIEW OFFICIAL RECEIPT
                  </button>
                )}
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
                    className={`payment-type-option ${paymentType === 'merchandise' || paymentType === 'merchandise_jersey' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('merchandise_jersey')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Official Matchday Jersey</div>
                        <div className="text-2xs text-slate-500">₦{(leagueSettings?.jersey_price || 18000).toLocaleString()} (Customized Kit)</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-type-option ${paymentType === 'merchandise_bib' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('merchandise_bib')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Official Training Bib</div>
                        <div className="text-2xs text-slate-500">₦{(leagueSettings?.bib_price || 6500).toLocaleString()} (Scrimmage Pack)</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`payment-type-option ${paymentType === 'guest_pass' ? 'active' : ''}`}
                    onClick={() => handleTypeChange('guest_pass')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="type-dot" />
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-900">Unregistered Guest Matchday Pass</div>
                        <div className="text-2xs text-slate-500">₦10,000 / guest player entry</div>
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
                <div className="flex justify-between items-center mb-1.5">
                  <label className="form-label-portal mb-0">CHOOSE PAYMENT METHOD</label>
                  <span className="text-3xs text-slate-500 font-medium">Select preferred channel</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Paystack Online Gateway */}
                  <button
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'paystack'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                    onClick={() => setPaymentMethod('paystack')}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <CreditCard size={16} className={paymentMethod === 'paystack' ? 'text-emerald-400' : 'text-blue-600'} />
                      <span className={`text-4xs uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                        paymentMethod === 'paystack' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-50 text-blue-700'
                      }`}>Instant</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">Paystack</div>
                      <div className={`text-3xs ${paymentMethod === 'paystack' ? 'text-slate-300' : 'text-slate-500'}`}>Card, Transfer, USSD</div>
                    </div>
                  </button>

                  {/* Manual Bank Transfer */}
                  <button
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'manual_bank'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                    onClick={() => setPaymentMethod('manual_bank')}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Landmark size={16} className={paymentMethod === 'manual_bank' ? 'text-amber-400' : 'text-amber-600'} />
                      <span className={`text-4xs uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                        paymentMethod === 'manual_bank' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-800'
                      }`}>Direct</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">Bank Transfer</div>
                      <div className={`text-3xs ${paymentMethod === 'manual_bank' ? 'text-slate-300' : 'text-slate-500'}`}>Manual Bank Deposit</div>
                    </div>
                  </button>

                  {/* CitiPay Virtual Wallet */}
                  <button
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'wallet'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Wallet size={16} className={paymentMethod === 'wallet' ? 'text-emerald-300' : 'text-emerald-600'} />
                      <span className={`text-4xs uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                        paymentMethod === 'wallet' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
                      }`}>₦{memberWalletBal.toLocaleString()}</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">Virtual Wallet</div>
                      <div className={`text-3xs ${paymentMethod === 'wallet' ? 'text-slate-300' : 'text-slate-500'}`}>1-Click Settlement</div>
                    </div>
                  </button>
                </div>

                {/* Sub-view: Manual Bank Transfer Details */}
                {paymentMethod === 'manual_bank' && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-3xs text-slate-400 font-semibold block">BANK</span>
                        <strong className="text-slate-900 text-xs font-bold">Access Bank</strong>
                      </div>
                      <div>
                        <span className="text-3xs text-slate-400 font-semibold block">ACCOUNT NAME</span>
                        <strong className="text-slate-900 text-xs font-bold">Oxsa int’l Nig Ltd.</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <div>
                        <span className="text-3xs text-slate-400 font-semibold block">ACCOUNT NUMBER</span>
                        <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">0092042084</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('0092042084')
                          setCopiedAccount(true)
                          setTimeout(() => setCopiedAccount(false), 2000)
                        }}
                        className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 text-slate-800"
                      >
                        {copiedAccount ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-3xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Transfer directly to the account above. The club administrator will verify the payment on their statement to activate clearance.
                    </div>

                    <div>
                      <label className="text-3xs font-bold text-slate-600 block mb-1">
                        SENDER NAME OR PAYMENT REFERENCE (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Your Name or App Reference"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-view: Wallet Status */}
                {paymentMethod === 'wallet' && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-emerald-900 font-bold">CitiPay Virtual Wallet Active:</span>{' '}
                      <span className="text-emerald-700">Available: ₦{memberWalletBal.toLocaleString()}</span>
                      {memberWalletBal < amount && (
                        <div className="text-rose-600 font-bold mt-0.5">
                          ⚠️ Shortfall: ₦{(amount - memberWalletBal).toLocaleString()} needed.
                        </div>
                      )}
                    </div>
                    {memberWalletBal < amount && (
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-3xs hover:bg-emerald-700 transition-all cursor-pointer"
                        onClick={() => {
                          setPaymentModalState(prev => ({ ...prev, isOpen: false }))
                          setWalletModalState({ isOpen: true, mode: 'fund' })
                        }}
                      >
                        + Top Up Wallet
                      </button>
                    )}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

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
                  <span>Payment Channel:</span>
                  <span className="text-slate-900 font-bold">
                    {paymentMethod === 'paystack' && 'Paystack Gateway (Instant)'}
                    {paymentMethod === 'manual_bank' && 'Manual Direct Bank Transfer'}
                    {paymentMethod === 'wallet' && 'CitiPay Virtual Wallet'}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-slate-900">Total to Pay:</span>
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
                    <span>
                      {paymentMethod === 'paystack'
                        ? 'Opening Paystack Gateway...'
                        : paymentMethod === 'manual_bank'
                        ? 'Submitting Transfer Receipt...'
                        : 'Processing Wallet Payment...'}
                    </span>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'manual_bank' ? 'SUBMIT TRANSFER RECEIPT' : 'CONFIRM PAYMENT'}
                      </span>
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
