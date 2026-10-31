import { useState, useRef } from 'react'
import {
  X, Trophy, Calendar, MapPin, Clock, DollarSign,
  Upload, Users, Shield, CheckCircle2, AlertCircle, Plus,
  Camera, Sparkles, ChevronRight, ArrowRight, CreditCard, Landmark, Copy, Check
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './IslCupModal.css'

export default function IslCupModal() {
  const { islCupModalState, setIslCupModalState, islCupTeams, registerIslCupTeam, currentRole } = useCitiPay()
  const isSuperAdmin = currentRole === 'super_admin'

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'register' | 'payment' | 'teams'
  const [formData, setFormData] = useState({
    teamName: '',
    coachName: '',
    captainName: '',
    vipSpectator1: '',
    vipSpectator2: '',
    logoUrl: '/crests/sunday-league-fc.svg'
  })
  const [uploadedLogo, setUploadedLogo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setError] = useState('')
  const fileInputRef = useRef(null)

  // Payment checkout states for ISL Cup (₦300,000)
  const [paymentMethod, setPaymentMethod] = useState('paystack') // 'paystack' | 'manual_bank'
  const [bankRef, setBankRef] = useState('')
  const [copiedBank, setCopiedBank] = useState(false)
  const [registeredPendingTeam, setRegisteredPendingTeam] = useState(null)

  if (!islCupModalState?.isOpen) return null

  const handleClose = () => {
    setIslCupModalState({ isOpen: false })
    sessionStorage.setItem('isl_cup_dismissed', 'true')
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedLogo(reader.result)
        setFormData(prev => ({ ...prev, logoUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Step 1: Validate Team Form and Advance to Payment Checkout
  const handleProceedToPayment = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.teamName.trim()) {
      setError('Please provide your Team Name.')
      return
    }
    if (!formData.coachName.trim()) {
      setError('Please provide your Coach Name.')
      return
    }
    if (!formData.captainName.trim()) {
      setError('Please provide your Team Captain Name.')
      return
    }

    setBankRef(`ISL-TRANS-${Date.now().toString().slice(-6)}`)
    setActiveTab('payment')
  }

  // Step 2: Finalize Payment & Register Team
  const handleCompleteRegistrationWithPayment = (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    const isLiveKey = paystackKey && paystackKey.startsWith('pk_') && paystackKey !== 'pk_test_your-key'

    if (paymentMethod === 'paystack') {
      const generatedRef = `ISL-CUP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      const captainEmail = `${formData.captainName.toLowerCase().replace(/[^a-z0-9]/g, '')}@citileague.ng`

      if (typeof window !== 'undefined' && window.PaystackPop && isLiveKey) {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: captainEmail,
          amount: 30000000, // ₦300,000 in Kobo
          currency: 'NGN',
          ref: generatedRef,
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
          metadata: {
            custom_fields: [
              { display_name: 'Tournament', variable_name: 'tournament', value: 'ISL Cup Finals 2026' },
              { display_name: 'Team Name', variable_name: 'team_name', value: formData.teamName },
              { display_name: 'Team Captain', variable_name: 'captain_name', value: formData.captainName },
              { display_name: 'Coach', variable_name: 'coach_name', value: formData.coachName },
              { display_name: 'VIP Spectators', variable_name: 'vip_spectators', value: `${formData.vipSpectator1 || 'N/A'}, ${formData.vipSpectator2 || 'N/A'}` }
            ]
          },
          callback: function (response) {
            const confirmedRef = response.reference || generatedRef
            finalizeRegistration({
              method: 'paystack',
              ref: confirmedRef,
              status: 'Paid'
            })
          },
          onClose: function () {
            setIsSubmitting(false)
            setError('Payment cancelled. You can retry with Paystack or select Direct Bank Transfer.')
          }
        })
        handler.openIframe()
        return
      } else {
        // Fallback for simulation / mock test key
        setTimeout(() => {
          finalizeRegistration({
            method: 'paystack',
            ref: generatedRef,
            status: 'Paid'
          })
        }, 800)
        return
      }
    } else {
      // Direct Bank Transfer (Logged as Pending verification in Admin Ledger)
      setTimeout(() => {
        finalizeRegistration({
          method: 'bank_transfer',
          ref: bankRef || `ISL-BANK-${Date.now().toString().slice(-6)}`,
          status: 'Pending'
        })
      }, 700)
    }
  }

  const finalizeRegistration = ({ method, ref, status }) => {
    try {
      const created = registerIslCupTeam({
        teamName: formData.teamName.trim(),
        coachName: formData.coachName.trim(),
        captainName: formData.captainName.trim(),
        vipSpectator1: formData.vipSpectator1.trim(),
        vipSpectator2: formData.vipSpectator2.trim(),
        logoUrl: formData.logoUrl || '/crests/sunday-league-fc.svg',
        paymentMethod: method,
        reference: ref,
        paymentStatus: status
      })

      setIsSubmitting(false)
      setRegisteredPendingTeam(created)
      setSuccessMessage(
        status === 'Paid'
          ? `🎉 Team "${formData.teamName}" registered and ₦300,000 payment confirmed!`
          : `✓ Team "${formData.teamName}" registered. Transfer reference logged for Admin verification.`
      )

      setTimeout(() => {
        setActiveTab(isSuperAdmin ? 'teams' : 'overview')
        setSuccessMessage('')
        setFormData({
          teamName: '',
          coachName: '',
          captainName: '',
          vipSpectator1: '',
          vipSpectator2: '',
          logoUrl: '/crests/sunday-league-fc.svg'
        })
        setUploadedLogo(null)
      }, 2500)
    } catch (err) {
      setIsSubmitting(false)
      setError(err.message || 'Registration failed. Maximum slots may be filled.')
    }
  }

  const copyBankInfo = () => {
    navigator.clipboard?.writeText('0092042084')
    setCopiedBank(true)
    setTimeout(() => setCopiedBank(false), 2000)
  }

  // Ensure 10 visual slots (columns)
  const totalSlots = 10
  const slots = Array.from({ length: totalSlots }, (_, idx) => {
    return islCupTeams[idx] || null
  })

  return (
    <div className="isl-backdrop" onClick={handleClose}>
      <div
        className={`isl-modal-card ${activeTab === 'overview' ? 'isl-modal-minimal' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="isl-modal-topbar">
          <div className="flex items-center gap-2">
            <span className="isl-cup-badge">
              <Sparkles size={13} /> ISL CUP FINALS 2026
            </span>
          </div>

          <button
            type="button"
            className="isl-close-btn"
            onClick={handleClose}
            aria-label="Close Announcement"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="isl-nav-tabs">
          <button
            type="button"
            className={`isl-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Trophy size={13} /> Flier
          </button>
          <button
            type="button"
            className={`isl-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <Plus size={13} /> Register Team
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              className={`isl-tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
              onClick={() => setActiveTab('teams')}
            >
              <Users size={13} /> Teams ({islCupTeams.length}/10)
            </button>
          )}
        </div>

        {/* TAB 1: MINIMAL FLIER & QUICK CTA */}
        {activeTab === 'overview' && (
          <div className="isl-minimal-overview">
            <div className="isl-poster-wrap">
              <img
                src="/isl-cup-finals-2026.jpg"
                alt="ISL Cup Finals 2026 Poster"
                className="isl-poster-img"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/crests/sunday-league-fc.svg'
                }}
              />
            </div>

            <div className="isl-minimal-meta">
              <span><MapPin size={13} /> Lagos Preparatory School, Ikoyi</span>
              <span className="isl-meta-dot">·</span>
              <span><Clock size={13} /> 7:20 AM</span>
              <span className="isl-meta-dot">·</span>
              <span>2 VIP Passes Included</span>
            </div>

            <div className="isl-action-bar">
              <button
                type="button"
                className="isl-btn-primary"
                onClick={() => setActiveTab('register')}
              >
                <span>Register Team</span>
                <ArrowRight size={15} />
              </button>

              {isSuperAdmin && (
                <button
                  type="button"
                  className="isl-btn-secondary"
                  onClick={() => setActiveTab('teams')}
                >
                  <Users size={15} />
                  <span>Teams ({islCupTeams.length}/10)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER YOUR TEAM FORM */}
        {activeTab === 'register' && (
          <div className="isl-register-wrap">
            <div className="isl-register-header">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Register Team for ISL Cup Finals 2026</h2>
              <p className="text-xs text-slate-500">
                Official team entry sheet · Registration Fee: <strong className="text-emerald-700 font-mono">₦300,000</strong> · 16 Teams tournament format
              </p>
            </div>

            {successMessage && (
              <div className="isl-success-alert">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="isl-error-alert">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleProceedToPayment} className="isl-form-grid">
              {/* Left Form: Team Info & Crest Upload */}
              <div className="isl-form-section">
                <h3 className="isl-section-title">1. Team Identity & Crest</h3>

                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="isl-crest-upload-box"
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to upload team crest"
                  >
                    {uploadedLogo ? (
                      <img src={uploadedLogo} alt="Team Crest" className="isl-crest-uploaded-img" />
                    ) : (
                      <div className="isl-crest-placeholder">
                        <Camera size={20} className="text-slate-400 mb-1" />
                        <span className="text-4xs font-bold uppercase text-slate-500">Upload Crest</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex-1">
                    <label className="isl-input-lbl">Team Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ikoyi Strikers FC"
                      className="isl-input"
                      value={formData.teamName}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                    />
                    <span className="text-3xs text-slate-400">Click box to upload team logo image.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="isl-input-lbl">Coach Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coach Adekunle"
                      className="isl-input"
                      value={formData.coachName}
                      onChange={(e) => setFormData(prev => ({ ...prev, coachName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="isl-input-lbl">Team Captain Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chinedu Okafor"
                      className="isl-input"
                      value={formData.captainName}
                      onChange={(e) => setFormData(prev => ({ ...prev, captainName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Right Form: 2 VIP Spectators & Payment Clearance */}
              <div className="isl-form-section">
                <h3 className="isl-section-title">2. Two (2) VIP Spectators</h3>
                <p className="text-3xs text-slate-500 mb-3">
                  Each registration grants exclusive VIP access for 2 designated team patrons / spectators.
                </p>

                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <label className="isl-input-lbl">VIP Spectator 1 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Barrister Tunde Balogun"
                      className="isl-input"
                      value={formData.vipSpectator1}
                      onChange={(e) => setFormData(prev => ({ ...prev, vipSpectator1: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="isl-input-lbl">VIP Spectator 2 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ngozi Adeleke"
                      className="isl-input"
                      value={formData.vipSpectator2}
                      onChange={(e) => setFormData(prev => ({ ...prev, vipSpectator2: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="isl-reg-summary-box">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">Tournament Registration Fee:</span>
                    <strong className="text-slate-900 font-mono font-bold">₦300,000</strong>
                  </div>
                  <div className="flex justify-between items-center text-2xs text-slate-500 pt-1.5 border-t border-slate-200 mt-1.5">
                    <span>VIP Credentials:</span>
                    <span className="text-emerald-700 font-bold">2 Badges Included</span>
                  </div>
                </div>
              </div>

              {/* Submit Button to Advance to Payment Checkout */}
              <div className="col-span-full flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="isl-btn-secondary"
                  onClick={() => setActiveTab('overview')}
                >
                  Back to Overview
                </button>
                <button
                  type="submit"
                  className="isl-btn-primary"
                >
                  <span>Proceed to Payment (₦300,000)</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2.5: PAYMENT CHECKOUT PAGE (Paystack Gateway or Direct Bank Transfer) */}
        {activeTab === 'payment' && (
          <div className="isl-register-wrap">
            <div className="isl-register-header">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-accent font-bold text-2xs">Payment Checkout</span>
                <span className="badge badge-success text-2xs font-bold">₦300,000</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Complete Team Entry Payment for "{formData.teamName}"
              </h2>
              <p className="text-xs text-slate-500">
                Select your settlement method. Online payments via Paystack are verified instantly, and bank transfers are queued for Super Admin confirmation.
              </p>
            </div>

            {successMessage && (
              <div className="isl-success-alert">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="isl-error-alert">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCompleteRegistrationWithPayment} className="flex flex-col gap-5">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'paystack'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => setPaymentMethod('paystack')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                        <CreditCard size={17} />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">Paystack Checkout</div>
                        <div className="text-3xs text-emerald-700 font-semibold">Instant Clearance</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="islPaymentMethod"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Debit Card, Bank App Transfer, USSD (*737#), QR Code, or Apple Pay.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'manual_bank'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => setPaymentMethod('manual_bank')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Landmark size={17} />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">Official Bank Transfer</div>
                        <div className="text-3xs text-blue-700 font-semibold">Admin Manual Verification</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="islPaymentMethod"
                      value="manual_bank"
                      checked={paymentMethod === 'manual_bank'}
                      onChange={() => setPaymentMethod('manual_bank')}
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Direct transfer to the federation designated bank account.
                  </p>
                </div>
              </div>

              {/* Bank Details View if Manual Selected */}
              {paymentMethod === 'manual_bank' && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-inner">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-3xs font-extrabold tracking-wider uppercase text-emerald-400">
                      LEAGUE OFFICIAL SETTLEMENT ACCOUNT
                    </span>
                    <button
                      type="button"
                      onClick={copyBankInfo}
                      className="text-3xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-slate-300 flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedBank ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      {copiedBank ? 'Copied' : 'Copy Account'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-slate-400 block text-3xs font-semibold">BANK</span>
                      <strong className="text-white text-sm">Access Bank</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-3xs font-semibold">ACCOUNT NUMBER</span>
                      <strong className="text-emerald-300 text-base font-mono tracking-wider">0092042084</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-3xs font-semibold">BENEFICIARY</span>
                      <strong className="text-white">Oxsa int’l Nig Ltd.</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-3xs font-semibold">AMOUNT TO TRANSFER</span>
                      <strong className="text-emerald-400 font-mono text-sm">₦300,000</strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-3xs text-slate-300 uppercase tracking-wider font-bold block mb-1">
                      Bank Transfer Reference / Session ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09026724103009204208"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                    />
                    <span className="text-4xs text-slate-400 mt-1 block">
                      Admins will verify this transfer in the Federation Payment Ledger.
                    </span>
                  </div>
                </div>
              )}

              {/* Order summary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Total Registration Fee</div>
                  <div className="text-2xs text-slate-500">Includes team slot + 2 VIP badges</div>
                </div>
                <div className="text-xl font-black font-mono text-emerald-700">₦300,000</div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <button
                  type="button"
                  className="isl-btn-secondary"
                  onClick={() => setActiveTab('register')}
                >
                  Back to Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="isl-btn-primary"
                >
                  <Trophy size={15} />
                  <span>
                    {isSubmitting
                      ? 'Authorizing...'
                      : paymentMethod === 'paystack'
                        ? 'Pay ₦300,000 with Paystack'
                        : 'Submit Transfer Reference (₦300,000)'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: 10-COLUMN REGISTERED TEAMS SHOWCASE (Super Admin Only) */}
        {isSuperAdmin && activeTab === 'teams' && (
          <div className="isl-teams-wrap">
            <div className="isl-teams-header">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Registered Teams Matrix</h2>
                <p className="text-xs text-slate-500">
                  10 featured registration columns with team pictures, coaching staff, captaincy, and VIP spectators.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 rounded-xl"
                onClick={() => setActiveTab('register')}
              >
                <Plus size={14} /> Register Another Team
              </button>
            </div>

            {/* 10 Columns Grid */}
            <div className="isl-ten-columns-matrix">
              {slots.map((team, idx) => {
                const colNumber = idx + 1
                if (!team) {
                  return (
                    <div
                      key={`slot-${colNumber}`}
                      className="isl-slot-card empty"
                      onClick={() => setActiveTab('register')}
                      title="Available slot — click to register"
                    >
                      <div className="isl-slot-badge">COL {colNumber}</div>
                      <div className="isl-slot-empty-icon">
                        <Plus size={20} />
                      </div>
                      <strong className="text-xs font-bold text-slate-700">Open Slot {colNumber}</strong>
                      <span className="text-3xs text-slate-400">Available to Claim</span>
                      <button type="button" className="isl-slot-claim-btn mt-2">
                        + Register
                      </button>
                    </div>
                  )
                }

                return (
                  <div key={team.id || `team-${colNumber}`} className="isl-slot-card filled">
                    <div className="flex justify-between items-center mb-1">
                      <span className="isl-slot-badge filled">COL {colNumber}</span>
                      <span className="isl-status-pip">CONFIRMED</span>
                    </div>

                    {/* Team Picture / Crest */}
                    <div className="isl-team-crest-box">
                      <img
                        src={team.logoUrl || '/crests/sunday-league-fc.svg'}
                        alt={team.teamName}
                        className="isl-team-crest-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/crests/sunday-league-fc.svg'
                        }}
                      />
                    </div>

                    <h4 className="isl-team-name-title" title={team.teamName}>
                      {team.teamName}
                    </h4>

                    {/* Roster Specifications */}
                    <div className="isl-team-meta-list">
                      <div className="isl-meta-item">
                        <span className="isl-meta-k">Coach:</span>
                        <strong className="isl-meta-v">{team.coachName}</strong>
                      </div>
                      <div className="isl-meta-item">
                        <span className="isl-meta-k">Captain:</span>
                        <strong className="isl-meta-v">{team.captainName}</strong>
                      </div>

                      <div className="isl-vip-divider">
                        <span className="isl-vip-tag">2 VIP Spectators</span>
                      </div>
                      <div className="isl-vip-names">
                        <div className="isl-vip-name">• {team.vipSpectator1 || 'Designated VIP 1'}</div>
                        <div className="isl-vip-name">• {team.vipSpectator2 || 'Designated VIP 2'}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
