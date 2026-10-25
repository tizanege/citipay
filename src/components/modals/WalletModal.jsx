import { useState } from 'react'
import {
  X, Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck,
  CreditCard, Landmark, Smartphone, Sparkles, CheckCircle2,
  AlertCircle, History, ArrowRight, Copy, Check, Building2
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'
import './WalletModal.css'

export default function WalletModal() {
  const {
    walletModalState,
    setWalletModalState,
    setPaymentModalState,
    currentMember,
    currentClub,
    fundWallet,
    submitManualPaymentTransfer,
    transactions
  } = useCitiPay()

  const [topupAmount, setTopupAmount] = useState(20000)
  const [fundingMethod, setFundingMethod] = useState('paystack') // 'paystack' | 'manual_bank'
  const [selectedChannel, setSelectedChannel] = useState('all_channels') // 'all_channels' | 'card' | 'bank_transfer'
  const [transferRef, setTransferRef] = useState('')
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successInfo, setSuccessInfo] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  if (!walletModalState?.isOpen) return null

  const currentBal = Number(currentMember?.wallet_balance || 0)

  // Filter wallet-related transactions
  const walletTxs = (transactions || []).filter(
    tx => tx.payment_type === 'wallet_topup' || tx.method?.includes('Wallet')
  ).slice(0, 5)

  const quickAmounts = [10000, 20000, 50000, 100000]

  const handleFundWallet = () => {
    setErrorMsg('')
    if (topupAmount <= 0) {
      setErrorMsg('Please select or enter an amount to fund')
      return
    }

    setIsProcessing(true)

    // Option A: Manual Bank Transfer
    if (fundingMethod === 'manual_bank') {
      setTimeout(async () => {
        const generatedRef = transferRef.trim() || `WLT-TRF-${Date.now().toString().slice(-6)}`
        const tx = await submitManualPaymentTransfer({
          memberId: currentMember.id,
          amount: Number(topupAmount),
          paymentType: 'wallet_topup',
          reference: generatedRef,
          notes: `Direct bank transfer for wallet funding (${currentMember.full_name})`
        })
        setIsProcessing(false)
        setSuccessInfo({
          ...tx,
          isPending: true
        })
      }, 700)
      return
    }

    // Option B: Paystack Gateway
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    const isLiveKey = paystackKey && paystackKey.startsWith('pk_') && paystackKey !== 'pk_test_your-key'

    // Live Paystack popup for top-up
    if (typeof window !== 'undefined' && window.PaystackPop && isLiveKey) {
      const generatedRef = `WLT-TOP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      const playerEmail = currentMember.email || `${currentMember.member_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@citileague.ng`

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: playerEmail,
        amount: Math.round(Number(topupAmount) * 100),
        currency: 'NGN',
        ref: generatedRef,
        channels: selectedChannel === 'card' ? ['card'] : selectedChannel === 'bank_transfer' ? ['bank_transfer'] : ['card', 'bank', 'ussd', 'qr', 'bank_transfer'],
        metadata: {
          custom_fields: [
            { display_name: 'Member Name', variable_name: 'member_name', value: currentMember.full_name },
            { display_name: 'Member ID', variable_name: 'member_id', value: currentMember.member_id },
            { display_name: 'Action', variable_name: 'action', value: 'Virtual Wallet Top-up' }
          ]
        },
        callback: function (response) {
          const confirmedRef = response.reference || generatedRef
          fundWallet({
            amount: topupAmount,
            reference: confirmedRef,
            method: 'Paystack Gateway'
          }).then(tx => {
            setIsProcessing(false)
            setSuccessInfo(tx)
          })
        },
        onClose: function () {
          setIsProcessing(false)
        }
      })

      handler.openIframe()
      return
    }

    // Offline / Test Simulation
    setTimeout(() => {
      fundWallet({
        amount: topupAmount,
        method: 'Paystack Test Simulation'
      }).then(tx => {
        setIsProcessing(false)
        setSuccessInfo(tx)
      }).catch(err => {
        setIsProcessing(false)
        setErrorMsg(err.message)
      })
    }, 1000)
  }

  const handleClose = () => {
    setSuccessInfo(null)
    setErrorMsg('')
    setWalletModalState({ isOpen: false, mode: 'fund' })
  }

  const handleQuickPayService = (serviceType, defaultAmt) => {
    handleClose()
    setPaymentModalState({
      isOpen: true,
      type: serviceType,
      defaultAmount: defaultAmt
    })
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-lg wallet-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>{currentMember?.member_id}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} /> Paystack-Backed Escrow
                </span>
              </div>
              <h2 className="modal-title-portal">CitiPay Virtual Wallet</h2>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-portal flex flex-col gap-5">
          {successInfo ? (
            <div className="payment-success-card">
              <div className="success-icon-badge">
                {successInfo.isPending ? (
                  <Landmark size={44} className="text-amber-500" />
                ) : (
                  <CheckCircle2 size={44} className="text-emerald-500" />
                )}
              </div>
              <h3 className="success-title">
                {successInfo.isPending ? 'TRANSFER SUBMITTED FOR APPROVAL' : 'WALLET FUNDED SUCCESSFULLY'}
              </h3>
              <p className="success-sub">
                {successInfo.isPending ? (
                  <>
                    Your direct deposit of <strong>₦{Number(successInfo.amount).toLocaleString()}</strong> was submitted to <strong>{currentClub?.name || 'Ikoyi Sunday League'}</strong> management for bank reconciliation.
                  </>
                ) : (
                  <>
                    ₦{Number(successInfo.amount).toLocaleString()} has been credited to your CitiPay wallet.
                  </>
                )}
              </p>

              {successInfo.isPending ? (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>Deposit Reference:</span>
                    <span className="badge badge-warning text-xs font-bold">PENDING ADMIN CONFIRMATION</span>
                  </div>
                  <div className="font-mono font-extrabold text-base text-slate-900 tracking-wider">
                    {successInfo.reference}
                  </div>
                  <div className="text-3xs text-amber-800 font-medium mt-2 pt-2 border-t border-amber-200">
                    💡 Once the club administrator verifies the funds on the club statement, your wallet balance will automatically increase.
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-xs text-emerald-800 font-semibold">Updated Wallet Balance</div>
                  <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                    ₦{Number(currentMember?.wallet_balance || 0).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  className="btn btn-secondary flex-1 font-semibold text-xs py-2.5"
                  onClick={() => setSuccessInfo(null)}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary flex-1 font-bold text-xs py-2.5"
                  onClick={handleClose}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Wallet Balance Hero Card */}
              <div className="wallet-hero-banner">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                    Available Wallet Balance
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-3xs font-black backdrop-blur-sm">
                    Instant 1-Click Pay
                  </span>
                </div>
                <div className="wallet-balance-amount">
                  ₦{currentBal.toLocaleString()}
                </div>
                <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center text-xs opacity-90">
                  <span>Holder: {currentMember?.full_name}</span>
                  <span>Club: {currentClub?.code}</span>
                </div>
              </div>

              {/* Fund Wallet Section */}
              <div>
                <label className="form-label-portal">SELECT TOP-UP AMOUNT</label>
                <div className="wallet-quick-amounts mb-2.5">
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className={`wallet-amount-chip ${topupAmount === amt ? 'active' : ''}`}
                      onClick={() => setTopupAmount(amt)}
                    >
                      ₦{(amt / 1000)}k
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="currency-prefix">₦</span>
                  <input
                    type="number"
                    className="form-input-portal with-prefix font-mono font-bold text-base"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Math.max(500, Number(e.target.value)))}
                    placeholder="20,000"
                  />
                </div>
              </div>

              {/* Choose Funding Method: Paystack Gateway OR Manual Bank Transfer */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="form-label-portal mb-0">CHOOSE TOP-UP METHOD</label>
                  <span className="text-3xs text-slate-500 font-medium">Select gateway or direct bank</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      fundingMethod === 'paystack'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                    onClick={() => setFundingMethod('paystack')}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <CreditCard size={16} className={fundingMethod === 'paystack' ? 'text-emerald-400' : 'text-blue-600'} />
                      <span className={`text-4xs uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                        fundingMethod === 'paystack' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-50 text-blue-700'
                      }`}>Instant</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">Paystack</div>
                      <div className={`text-3xs ${fundingMethod === 'paystack' ? 'text-slate-300' : 'text-slate-500'}`}>Card, Transfer, USSD</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      fundingMethod === 'manual_bank'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                    onClick={() => setFundingMethod('manual_bank')}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Landmark size={16} className={fundingMethod === 'manual_bank' ? 'text-amber-400' : 'text-amber-600'} />
                      <span className={`text-4xs uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                        fundingMethod === 'manual_bank' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-800'
                      }`}>Manual</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">Bank Transfer</div>
                      <div className={`text-3xs ${fundingMethod === 'manual_bank' ? 'text-slate-300' : 'text-slate-500'}`}>Direct Deposit & Confirm</div>
                    </div>
                  </button>
                </div>

                {/* Sub-view: Manual Bank Transfer Details */}
                {fundingMethod === 'manual_bank' && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-3xs uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Building2 size={13} className="text-amber-600" />
                        Official {currentClub?.name || 'Ikoyi Sunday League'} Account
                      </span>
                      <span className="text-3xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        Verified Club Account
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-3xs text-slate-400 font-semibold block">BANK NAME</span>
                        <strong className="text-slate-900 text-xs font-bold">Kuda Microfinance Bank</strong>
                      </div>
                      <div>
                        <span className="text-3xs text-slate-400 font-semibold block">ACCOUNT NAME</span>
                        <strong className="text-slate-900 text-xs font-bold">080H00KAH GLOBAL SERVICES</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <div>
                        <span className="text-3xs text-slate-400 font-semibold block">ACCOUNT NUMBER</span>
                        <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">3003340214</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('3003340214')
                          setCopiedAccount(true)
                          setTimeout(() => setCopiedAccount(false), 2000)
                        }}
                        className="btn btn-secondary text-2xs py-1.5 px-3 flex items-center gap-1 font-bold"
                      >
                        {copiedAccount ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-3xs font-medium flex items-start gap-1.5">
                      <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Admin Confirmation Required:</strong> Transfer directly to the club account above. After you submit your reference, the club administrator will verify the bank deposit on their statement before your wallet balance is credited.
                      </span>
                    </div>

                    <div>
                      <label className="text-3xs font-bold text-slate-600 block mb-1">
                        TRANSFER REFERENCE / SENDER ACCOUNT NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TRF-10492 or Adebayo Bank App"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        className="form-input-portal text-xs w-full bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-view: Paystack Channel Customization */}
                {fundingMethod === 'paystack' && (
                  <div>
                    <label className="text-3xs font-bold text-slate-600 block mb-1">PAYSTACK CHANNEL</label>
                    <div className="method-pill-grid">
                      <button
                        type="button"
                        className={`method-pill-btn ${selectedChannel === 'all_channels' ? 'active' : ''}`}
                        onClick={() => setSelectedChannel('all_channels')}
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        <span>All Channels</span>
                      </button>
                      <button
                        type="button"
                        className={`method-pill-btn ${selectedChannel === 'card' ? 'active' : ''}`}
                        onClick={() => setSelectedChannel('card')}
                      >
                        <CreditCard size={14} />
                        <span>Debit Card</span>
                      </button>
                      <button
                        type="button"
                        className={`method-pill-btn ${selectedChannel === 'bank_transfer' ? 'active' : ''}`}
                        onClick={() => setSelectedChannel('bank_transfer')}
                      >
                        <Landmark size={14} />
                        <span>Bank Transfer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Trigger */}
              <button
                type="button"
                className="btn btn-primary w-full flex items-center justify-center gap-2 font-black py-3 text-sm cursor-pointer shadow-sm hover:shadow-md transition-all"
                onClick={handleFundWallet}
                disabled={isProcessing || topupAmount <= 0}
              >
                {isProcessing ? (
                  <span>
                    {fundingMethod === 'manual_bank' ? 'Submitting Transfer Request...' : 'Connecting to Paystack...'}
                  </span>
                ) : (
                  <>
                    <Wallet size={16} />
                    <span>
                      {fundingMethod === 'manual_bank'
                        ? `SUBMIT TRANSFER RECEIPT (₦${Number(topupAmount).toLocaleString()})`
                        : `TOP UP ₦${Number(topupAmount).toLocaleString()} VIA PAYSTACK`}
                    </span>
                  </>
                )}
              </button>

              {/* Instant Services You Can Pay With Wallet */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quick Pay Services from Wallet
                </div>
                <div className="flex flex-col gap-1.5">
                  <div
                    className="wallet-service-card"
                    onClick={() => handleQuickPayService('membership_installment', 50000)}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">Membership Dues Installment</div>
                      <div className="text-3xs text-slate-500">Bi-annual tranche • Instant clearance</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </div>

                  <div
                    className="wallet-service-card"
                    onClick={() => handleQuickPayService('social_dues', 5000)}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">Monthly Social Dues (₦5,000)</div>
                      <div className="text-3xs text-slate-500">Refreshment, water & pitch maintenance</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </div>

                  <div
                    className="wallet-service-card"
                    onClick={() => handleQuickPayService('guest_pass', 10000)}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">Matchday Guest Pass (₦10,000)</div>
                      <div className="text-3xs text-slate-500">Day pass for non-registered friend</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
