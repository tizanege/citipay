import { useState } from 'react'
import {
  X, Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck,
  CreditCard, Landmark, Smartphone, Sparkles, CheckCircle2,
  AlertCircle, History, ArrowRight
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
    transactions
  } = useCitiPay()

  const [topupAmount, setTopupAmount] = useState(20000)
  const [selectedChannel, setSelectedChannel] = useState('all_channels') // 'all_channels' | 'card' | 'bank_transfer'
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
                <CheckCircle2 size={44} className="text-emerald-500" />
              </div>
              <h3 className="success-title">WALLET FUNDED SUCCESSFULLY</h3>
              <p className="success-sub">
                ₦{Number(successInfo.amount).toLocaleString()} has been credited to your CitiPay wallet.
              </p>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-xs text-emerald-800 font-semibold">Updated Wallet Balance</div>
                <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                  ₦{Number(currentMember?.wallet_balance || 0).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  className="btn btn-secondary flex-1 font-semibold text-xs py-2.5"
                  onClick={() => setSuccessInfo(null)}
                >
                  Fund More
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

              {/* Top-up Method Selection */}
              <div>
                <label className="form-label-portal">FUNDING GATEWAY</label>
                <div className="method-pill-grid">
                  <button
                    type="button"
                    className={`method-pill-btn ${selectedChannel === 'all_channels' ? 'active' : ''}`}
                    onClick={() => setSelectedChannel('all_channels')}
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Paystack All</span>
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
                  <span>Connecting to Paystack...</span>
                ) : (
                  <>
                    <Wallet size={16} />
                    <span>TOP UP ₦{Number(topupAmount).toLocaleString()} VIA PAYSTACK</span>
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
