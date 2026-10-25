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

    if (!isLiveKey) {
      setIsProcessing(false)
      setErrorMsg('Paystack is not configured yet. Please use Direct Bank Transfer or add your Paystack Public Key.')
      return
    }

    if (typeof window !== 'undefined' && window.PaystackPop) {
      const generatedRef = `WLT-TOP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      const playerEmail = currentMember.email || `${currentMember.member_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@citileague.ng`

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: playerEmail,
        amount: Math.round(Number(topupAmount) * 100),
        currency: 'NGN',
        ref: generatedRef,
        channels: ['card', 'bank', 'ussd', 'qr', 'bank_transfer'],
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

    setIsProcessing(false)
    setErrorMsg('Unable to initialize Paystack checkout. Please refresh or use Direct Bank Transfer.')
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
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">CitiPay Virtual Wallet</h2>
              <div className="text-3xs text-slate-400 font-medium">Top up your balance for instant settlements</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
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
              {/* Wallet Balance Summary Card */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-3xs uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                    Available Wallet Balance
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-white">
                    ₦{currentBal.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-3xs text-slate-400">
                  <div className="font-semibold text-slate-200">{currentMember?.full_name}</div>
                  <div>{currentClub?.code || 'ISL'} • {currentMember?.member_id}</div>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Top-Up Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className={`py-2 px-1 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
                        topupAmount === amt
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                      onClick={() => setTopupAmount(amt)}
                    >
                      ₦{(amt / 1000)}k
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-base text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Math.max(500, Number(e.target.value)))}
                    placeholder="20,000"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Payment Method
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      fundingMethod === 'paystack'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                    onClick={() => setFundingMethod('paystack')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={16} className={fundingMethod === 'paystack' ? 'text-emerald-400' : 'text-slate-600'} />
                      <span className="font-bold text-xs">Paystack</span>
                    </div>
                    <div className={`text-3xs ${fundingMethod === 'paystack' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Card, USSD & Instant Bank
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      fundingMethod === 'manual_bank'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                    onClick={() => setFundingMethod('manual_bank')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Landmark size={16} className={fundingMethod === 'manual_bank' ? 'text-amber-400' : 'text-slate-600'} />
                      <span className="font-bold text-xs">Direct Transfer</span>
                    </div>
                    <div className={`text-3xs ${fundingMethod === 'manual_bank' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Transfer & Admin Confirm
                    </div>
                  </button>
                </div>

                {/* Sub-view: Manual Bank Transfer Details */}
                {fundingMethod === 'manual_bank' && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-3xs text-slate-400 font-semibold block">BANK</span>
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
                        className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 text-slate-800"
                      >
                        {copiedAccount ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-3xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Transfer directly to the account above. The club administrator will verify the payment on their statement to credit your wallet.
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
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
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
                        ? `Submit Transfer (₦${Number(topupAmount).toLocaleString()})`
                        : `Top Up ₦${Number(topupAmount).toLocaleString()} via Paystack`}
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
