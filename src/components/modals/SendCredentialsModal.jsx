import { useState, useEffect } from 'react'
import {
  X, Mail, KeyRound, Lock, RefreshCw, Send, CheckCircle2,
  Copy, Check, ShieldCheck, Sparkles, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import { generateTempPassword, generateAccessPin } from '../../lib/memberIdGenerator'
import './ModalStyles.css'

export default function SendCredentialsModal() {
  const {
    sendCredentialsModalState,
    setSendCredentialsModalState,
    sendMemberCredentials,
    currentClub
  } = useCitiPay()

  const member = sendCredentialsModalState?.member

  const [email, setEmail] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [accessPin, setAccessPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (sendCredentialsModalState.isOpen && member) {
      setEmail(member.email || '')
      setTempPassword(member.temp_password || generateTempPassword())
      setAccessPin(member.pin || generateAccessPin())
      setIsSuccess(false)
      setIsSubmitting(false)
      setCopied(false)
      setShowEmailPreview(false)
    }
  }, [sendCredentialsModalState.isOpen, member])

  if (!sendCredentialsModalState.isOpen || !member) return null

  const handleClose = () => {
    setSendCredentialsModalState({ isOpen: false, member: null })
  }

  const handleRerollPassword = () => {
    setTempPassword(generateTempPassword())
  }

  const handleRerollPin = () => {
    setAccessPin(generateAccessPin())
  }

  const handleCopyCredentials = () => {
    const credText = `CITILEAGUE PLAYER PORTAL CREDENTIALS
Club: ${currentClub?.name || 'Sunday League FC'}
Player: ${member.full_name}
Member ID: ${member.display_id || member.member_id}
Temporary Password: ${tempPassword}
Access PIN: ${accessPin}
Login Portal: ${window.location.origin}/login

Note: Change your temporary password upon your first sign in.`

    navigator.clipboard.writeText(credText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)

    try {
      await sendMemberCredentials({
        memberId: member.id || member.member_id,
        email,
        tempPassword,
        pin: accessPin
      })
      setIsSubmitting(false)
      setIsSuccess(true)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="modal-title-portal">Dispatch Login Credentials</h3>
              <p className="modal-desc-portal">Send official CitiPay portal credentials to player via email</p>
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
            <h4 className="text-lg font-extrabold text-slate-900 mb-1">Credentials Dispatched!</h4>
            <p className="text-xs text-slate-500 mb-4">
              Official login details have been emailed to <strong>{email}</strong> for <strong>{member.full_name}</strong>.
            </p>

            <div className="bg-slate-900 text-white rounded-xl p-4 text-left border border-slate-800 mb-4 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-3xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={12} /> Active Login Details
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="text-3xs flex items-center gap-1 bg-emerald-700/60 hover:bg-emerald-600 text-white px-2.5 py-1 rounded font-semibold transition"
                >
                  {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-800/80 rounded-lg">
                  <div className="text-4xs text-slate-400 font-bold uppercase">Member ID</div>
                  <div className="font-mono text-sm font-extrabold text-emerald-300 mt-0.5">{member.display_id || member.member_id}</div>
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
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Scrollable Body: Always contained */}
            <div className="modal-body-portal flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
              {/* Player Info Card */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/avatar-fallback.svg'
                    }}
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{member.full_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        ID: {member.display_id || member.member_id}
                      </span>
                      <span className="text-3xs text-slate-500 font-semibold">
                        Kit #{member.jersey_number || '10'} · {member.position || 'Player'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`squad-clearance-pill ${member.status} text-3xs`}>
                  {member.status === 'green' && '🟢 Cleared'}
                  {member.status === 'yellow' && '🟡 Due Soon'}
                  {member.status === 'red' && '🔴 Ineligible'}
                </span>
              </div>

              {/* Recipient Email */}
              <div>
                <label className="form-label-portal">RECIPIENT EMAIL ADDRESS *</label>
                <div className="relative">
                  <input
                    type="email"
                    className="form-input-portal text-xs pl-8"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@citileague.ng"
                    required
                  />
                  <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="text-4xs text-slate-400 mt-1">
                  The login details will be sent directly to this email address.
                </p>
              </div>

              {/* Credentials Inputs (Editable & Rerollable) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <KeyRound size={12} className="text-blue-600" />
                    Generated Access Credentials
                  </span>
                  <span className="text-4xs text-slate-400">Can be reset by player upon login</span>
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
                          onClick={handleRerollPassword}
                          className="text-4xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-bold"
                          title="Generate fresh password"
                        >
                          <RefreshCw size={9} /> Reset
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
                        onClick={handleRerollPin}
                        className="text-4xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-bold"
                        title="Generate fresh PIN"
                      >
                        <RefreshCw size={9} /> Reset
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

              {/* Email Preview Drawer */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} className="text-blue-600" />
                    Email Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="text-3xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <span>{showEmailPreview ? 'Hide Details' : 'View Email Preview'}</span>
                    {showEmailPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                {showEmailPreview && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="text-3xs text-slate-500 mb-2">
                      <strong>To:</strong> {email}<br />
                      <strong>From:</strong> {currentClub?.name || 'Sunday League FC'} Official &lt;portal@citileague.ng&gt;<br />
                      <strong>Subject:</strong> Your Official CitiPay Login Credentials · {currentClub?.name || 'Sunday League FC'}
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-3xs text-slate-700 font-mono space-y-1">
                      <p>Hello {member.full_name},</p>
                      <p>Here are your updated login credentials for the CitiLeague Player Portal:</p>
                      <div className="p-2 bg-slate-900 text-emerald-300 rounded font-bold my-1.5 space-y-0.5">
                        <div>MEMBER ID: {member.display_id || member.member_id}</div>
                        <div>TEMPORARY PASSWORD: {tempPassword}</div>
                        <div>ACCESS PIN: {accessPin}</div>
                        <div>PORTAL URL: {window.location.origin}/login</div>
                      </div>
                      <p>Log in to view your matchday clearance status, verify payments, and download receipts.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer: Always visible, never cut off! */}
            <div className="modal-footer-portal p-3 px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <div className="flex gap-2">
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
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send to {member.nickname || 'Player'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
