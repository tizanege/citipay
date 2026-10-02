import { useState, useEffect } from 'react'
import {
  X, UserPlus, RefreshCw, ShieldCheck, CheckCircle2,
  Sparkles, Mail, Phone, Shirt, Trophy, KeyRound, Lock,
  Eye, EyeOff, Copy, Check, ChevronDown, ChevronUp, Send
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import {
  generateRandomMemberId,
  generateTempPassword,
  generateAccessPin
} from '../../lib/memberIdGenerator'
import './ModalStyles.css'

export default function AddPlayerModal() {
  const {
    addPlayerModalState,
    setAddPlayerModalState,
    registerMember,
    currentClub,
    members
  } = useCitiPay()

  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('CAM')
  const [jerseyNumber, setJerseyNumber] = useState('17')
  const [paymentType, setPaymentType] = useState('installment')
  const [generatedMemberId, setGeneratedMemberId] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [accessPin, setAccessPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  // Auto-generate random unique non-serial Member ID, temp password, and PIN
  const rerollCredentials = () => {
    const existingIds = members.map(m => m.member_id)
    const newId = generateRandomMemberId({
      prefix: currentClub?.code || 'SL',
      length: 5,
      existingIds
    })
    setGeneratedMemberId(newId)
    setTempPassword(generateTempPassword())
    setAccessPin(generateAccessPin())
  }

  const rerollPassword = () => {
    setTempPassword(generateTempPassword())
  }

  const rerollPin = () => {
    setAccessPin(generateAccessPin())
  }

  useEffect(() => {
    if (addPlayerModalState.isOpen) {
      rerollCredentials()
      setIsSuccess(false)
      setIsSubmitting(false)
      setCopied(false)
      setShowEmailPreview(false)
    }
  }, [addPlayerModalState.isOpen, currentClub])

  if (!addPlayerModalState.isOpen) return null

  const handleClose = () => {
    setAddPlayerModalState({ isOpen: false })
  }

  const handleCopyCredentials = () => {
    const credText = `CITILEAGUE PLAYER PORTAL CREDENTIALS
Club: ${currentClub?.name || 'Sunday League FC'}
Player: ${fullName || 'Squad Member'}
Member ID: ${generatedMemberId}
Temporary Password: ${tempPassword}
Access PIN: ${accessPin}
Login Portal: ${window.location.origin}/login

Note: Change your temporary password upon your first sign in.`

    navigator.clipboard.writeText(credText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fullName || !email) return

    setIsSubmitting(true)

    setTimeout(() => {
      registerMember({
        fullName,
        nickname: nickname || fullName.split(' ')[0],
        email,
        phone,
        primaryPosition: position,
        jerseyNumber,
        paymentType,
        memberId: generatedMemberId,
        tempPassword,
        pin: accessPin,
        sendEmail
      })

      setIsSubmitting(false)
      setIsSuccess(true)
    }, 600)
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-xl" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="modal-title-portal">Add Member to Squad</h3>
              <p className="modal-desc-portal">Register new player, generate login details & dispatch credentials</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 mb-1">Player Registered Successfully!</h4>
            <p className="text-xs text-slate-500 mb-4">{fullName} has joined {currentClub?.name || 'Sunday League FC'}</p>

            {/* Credentials Card */}
            <div className="bg-slate-900 text-white rounded-xl p-4 text-left border border-slate-800 mb-4 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-3xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={12} /> Generated Login Credentials
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="text-3xs flex items-center gap-1 bg-emerald-700/60 hover:bg-emerald-600 text-white px-2.5 py-1 rounded font-semibold transition"
                >
                  {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-800/80 rounded-lg">
                  <div className="text-4xs text-slate-400 font-bold uppercase">Member ID</div>
                  <div className="font-mono text-sm font-extrabold text-emerald-300 mt-0.5">{generatedMemberId}</div>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-lg">
                  <div className="text-4xs text-slate-400 font-bold uppercase">Temp Password</div>
                  <div className="font-mono text-sm font-extrabold text-white mt-0.5">{tempPassword}</div>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-lg">
                  <div className="text-4xs text-slate-400 font-bold uppercase">Access PIN</div>
                  <div className="font-mono text-sm font-extrabold text-amber-300 mt-0.5">{accessPin}</div>
                </div>
              </div>

              {sendEmail ? (
                <div className="mt-3.5 flex items-center gap-2 p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-3xs text-emerald-200">
                  <Mail size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Onboarding email with these login details was dispatched to <strong>{email}</strong>.</span>
                </div>
              ) : (
                <div className="mt-3.5 flex items-center gap-2 p-2 bg-slate-800 rounded-lg text-3xs text-slate-400">
                  <Lock size={14} className="text-slate-400 flex-shrink-0" />
                  <span>Email dispatch was skipped. You can manually share credentials with the player.</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <button
                type="button"
                className="btn btn-secondary text-xs font-semibold py-2 px-4"
                onClick={handleCopyCredentials}
              >
                {copied ? '✓ Credentials Copied' : 'Copy for WhatsApp/SMS'}
              </button>
              <button
                type="button"
                className="btn btn-primary text-xs font-bold py-2 px-5"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Scrollable Body: Always contained, never overflows screen */}
            <div className="modal-body-portal flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
              {/* Unique Member ID Badge Showcase */}
              <div className="p-3 bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/30 rounded-xl text-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-3xs uppercase font-extrabold tracking-wider text-emerald-400">
                    Assigned Unique Member ID
                  </span>
                  <button
                    type="button"
                    onClick={rerollCredentials}
                    className="text-3xs flex items-center gap-1 text-emerald-300 hover:text-white bg-emerald-800/40 hover:bg-emerald-800/80 px-2 py-0.5 rounded transition"
                    title="Generate a different random non-serial ID"
                  >
                    <RefreshCw size={10} /> Re-roll Random ID
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-black text-emerald-300 tracking-wider">
                    {generatedMemberId}
                  </span>
                  <span className="text-4xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    Non-Serial · Verified Unique
                  </span>
                </div>
              </div>

              {/* Generated Login Credentials Block */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <KeyRound size={12} className="text-emerald-600" />
                    Auto-Generated Player Login Details
                  </span>
                  <span className="text-4xs text-slate-500 font-semibold">Editable temporary access</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Temp Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-3xs font-bold text-slate-600">TEMPORARY PASSWORD</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-4xs text-slate-500 hover:text-slate-800"
                          title={showPassword ? 'Hide' : 'Show'}
                        >
                          {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                        <button
                          type="button"
                          onClick={rerollPassword}
                          className="text-4xs text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 font-bold"
                          title="Generate fresh password"
                        >
                          <RefreshCw size={9} /> Re-roll
                        </button>
                      </div>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input-portal text-xs font-mono font-bold"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* 4-digit PIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-3xs font-bold text-slate-600">4-DIGIT ACCESS PIN</label>
                      <button
                        type="button"
                        onClick={rerollPin}
                        className="text-4xs text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 font-bold"
                        title="Generate fresh PIN"
                      >
                        <RefreshCw size={9} /> Re-roll
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      className="form-input-portal text-xs font-mono font-bold tracking-widest text-center"
                      value={accessPin}
                      onChange={(e) => setAccessPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Player Info Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label-portal">LEGAL FULL NAME *</label>
                  <input
                    type="text"
                    className="form-input-portal text-xs"
                    placeholder="e.g. Babatunde Balogun"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label-portal">NICKNAME</label>
                  <input
                    type="text"
                    className="form-input-portal text-xs"
                    placeholder="e.g. Baba T"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label-portal">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    className="form-input-portal text-xs"
                    placeholder="babatunde@citileague.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label-portal">PHONE NUMBER</label>
                  <input
                    type="tel"
                    className="form-input-portal text-xs"
                    placeholder="+234 803 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Tactical role & Jersey */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label-portal">PRIMARY POSITION</label>
                  <select
                    className="form-input-portal text-xs"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="GK">GK - Goalkeeper</option>
                    <option value="CB">CB - Center Back</option>
                    <option value="LB">LB - Left Back</option>
                    <option value="RB">RB - Right Back</option>
                    <option value="CDM">CDM - Defensive Midfielder</option>
                    <option value="CM">CM - Center Midfielder</option>
                    <option value="CAM">CAM - Attacking Midfielder</option>
                    <option value="LW">LW - Left Winger</option>
                    <option value="RW">RW - Right Winger</option>
                    <option value="ST">ST - Striker</option>
                  </select>
                </div>
                <div>
                  <label className="form-label-portal">KIT JERSEY NUMBER</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="form-input-portal text-xs font-mono font-bold"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Payment plan selection */}
              <div>
                <label className="form-label-portal">INITIAL PAYMENT STATUS</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('installment')}
                    className={`p-2 rounded-xl border text-left text-xs font-semibold transition ${
                      paymentType === 'installment'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>2-Part Installment</div>
                    <span className="text-3xs text-slate-500">₦50,000 / tranche</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-2 rounded-xl border text-left text-xs font-semibold transition ${
                      paymentType === 'full'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>Full Season (🟢 Green)</div>
                    <span className="text-3xs text-slate-500">₦100,000 cleared</span>
                  </button>
                </div>
              </div>

              {/* Email Dispatch Switch & Live Preview Accordion */}
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail size={14} className="text-emerald-600" />
                      Dispatch Login Details via Email
                    </span>
                  </label>

                  {sendEmail && (
                    <button
                      type="button"
                      onClick={() => setShowEmailPreview(!showEmailPreview)}
                      className="text-3xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                    >
                      <span>{showEmailPreview ? 'Hide Preview' : 'Live Preview'}</span>
                      {showEmailPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>

                {/* Collapsible Email Preview */}
                {sendEmail && showEmailPreview && (
                  <div className="mt-2.5 pt-2.5 border-t border-emerald-200/80 bg-white rounded-lg p-2.5 text-xs shadow-inner">
                    <div className="text-4xs text-slate-400 font-bold uppercase mb-1">EMAIL PREVIEW (MOCK DISPATCH)</div>
                    <div className="text-3xs text-slate-500 mb-2">
                      <strong>To:</strong> {email || 'player@example.com'}<br />
                      <strong>From:</strong> {currentClub?.name || 'Sunday League FC'} Official &lt;portal@citileague.ng&gt;<br />
                      <strong>Subject:</strong> Welcome to {currentClub?.name || 'Sunday League FC'} · Your Official CitiPay Portal Credentials
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-3xs text-slate-700 font-mono space-y-1">
                      <p>Dear {fullName || '[Player Name]'},</p>
                      <p>You have been registered to the official squad roster for {currentClub?.name || 'Sunday League FC'}.</p>
                      <div className="p-2 bg-slate-900 text-emerald-300 rounded font-bold my-1.5 space-y-0.5">
                        <div>MEMBER ID: {generatedMemberId}</div>
                        <div>TEMPORARY PASSWORD: {tempPassword}</div>
                        <div>ACCESS PIN: {accessPin}</div>
                        <div>LOGIN PORTAL: {window.location.origin}/login</div>
                      </div>
                      <p>Please log in immediately to complete your profile and settle your membership clearance.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer: Always visible, never cut off! */}
            <div className="modal-footer-portal p-3 px-5 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-2 flex-shrink-0">
              <button
                type="button"
                className="btn btn-secondary text-xs font-semibold py-2 px-3.5"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <ShieldCheck size={15} />
                    <span>Confirm & Add Player</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
