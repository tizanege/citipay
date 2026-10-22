import { useState } from 'react'
import {
  X, Lock, Mail, CheckCircle2, ShieldCheck, ArrowRight,
  KeyRound, Smartphone, AlertCircle, Eye, EyeOff, RefreshCw
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function PasswordResetModal() {
  const { resetPassModalState, setResetPassModalState, members, resetMemberPassword } = useCitiPay()

  // Steps: 'request' -> 'verify_otp' -> 'new_password' -> 'success'
  const [step, setStep] = useState('request')
  const [identifier, setIdentifier] = useState('')
  const [matchedMember, setMatchedMember] = useState(null)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('742819')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPin, setNewPin] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!resetPassModalState?.isOpen) return null

  const handleClose = () => {
    setStep('request')
    setIdentifier('')
    setMatchedMember(null)
    setOtpCode(['', '', '', '', '', ''])
    setNewPassword('')
    setConfirmPassword('')
    setNewPin('')
    setErrorMessage('')
    setResetPassModalState({ isOpen: false })
  }

  // Step 1: Identify member & send OTP
  const handleRequestOtp = (e) => {
    e?.preventDefault()
    setErrorMessage('')
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      const clean = identifier.trim()
      const cleanNoDash = clean.toUpperCase().replace(/[^A-Z0-9]/g, '')

      const target = members.find(m => {
        const mNorm = (m.member_id || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
        const dNorm = (m.display_id || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
        return (
          mNorm === cleanNoDash ||
          dNorm === cleanNoDash ||
          (m.email && m.email.toLowerCase() === clean.toLowerCase()) ||
          (m.phone && m.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, ''))
        )
      })

      if (!target) {
        setErrorMessage(`No player account found matching "${identifier}". Please double-check your Member ID or registered phone/email.`)
        return
      }

      // Generate a friendly 6-digit mock OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(code)
      setMatchedMember(target)
      setStep('verify_otp')
    }, 600)
  }

  // Handle OTP digit changes
  const handleOtpChange = (index, val) => {
    if (val.length > 1) val = val.slice(-1)
    const next = [...otpCode]
    next[index] = val
    setOtpCode(next)

    if (val && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  // Step 2: Validate OTP
  const handleVerifyOtp = (e) => {
    e?.preventDefault()
    setErrorMessage('')
    const entered = otpCode.join('')

    if (entered.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Allow the generated OTP or fallback master code '123456'
      if (entered === generatedOtp || entered === '123456' || entered === '742819') {
        setStep('new_password')
      } else {
        setErrorMessage('Invalid verification code. Please check your notification or click Resend.')
      }
    }, 500)
  }

  // Step 3: Set New Password & PIN
  const handleSaveNewCredentials = async (e) => {
    e?.preventDefault()
    setErrorMessage('')

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (newPin && newPin.length !== 4) {
      setErrorMessage('Quick PIN must be exactly 4 digits.')
      return
    }

    setLoading(true)
    try {
      await resetMemberPassword({
        identifier: matchedMember?.member_id || identifier,
        newPassword,
        newPin: newPin || '1234'
      })
      setLoading(false)
      setStep('success')
    } catch (err) {
      setLoading(false)
      setErrorMessage(err.message || 'Failed to update credentials. Please try again.')
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-md" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-secondary text-xs font-bold flex items-center gap-1">
                <Lock size={12} /> Account Recovery
              </span>
              <span className="badge badge-accent text-2xs font-semibold">Self-Service</span>
            </div>
            <h2 className="modal-title-portal">
              {step === 'request' && 'Reset Password / PIN'}
              {step === 'verify_otp' && 'Verify Your Identity'}
              {step === 'new_password' && 'Create New Password'}
              {step === 'success' && 'Password Updated!'}
            </h2>
            <p className="text-xs text-slate-500">
              {step === 'request' && "Enter your Member ID, phone or email to receive a recovery code"}
              {step === 'verify_otp' && `Enter the 6-digit code sent to ${matchedMember?.email || matchedMember?.phone || 'your registered contact'}`}
              {step === 'new_password' && `Set new login credentials for ${matchedMember?.full_name || 'your account'}`}
              {step === 'success' && 'Your account security credentials have been refreshed'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-portal">
          {errorMessage && (
            <div className="p-3 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter Identifier */}
          {step === 'request' && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <div>
                <label className="form-label-portal">MEMBER ID, REGISTERED EMAIL OR PHONE</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="form-input-portal pl-10 text-sm font-semibold"
                    placeholder="e.g. SL-8K4P2, michael@sundayleague.ng"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <span className="text-2xs text-slate-400 mt-1 block">
                  CitiLeague accounts are tied to your Member ID or registration email
                </span>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-2 font-bold py-2.5 text-xs flex items-center justify-center gap-1.5"
                  disabled={loading || !identifier.trim()}
                >
                  {loading ? 'Searching Account...' : 'SEND RECOVERY CODE'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 'verify_otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-2xs uppercase tracking-wider text-slate-500 font-bold">Account Located</div>
                  <div className="text-xs font-bold text-slate-900">{matchedMember?.full_name}</div>
                  <div className="text-2xs text-slate-500 font-mono">ID: {matchedMember?.member_id}</div>
                </div>
                <span className="badge badge-success text-2xs font-bold">Verified</span>
              </div>

              {/* Simulation Helper Pill */}
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-2xs flex items-center justify-between">
                <span>Demo Code: <strong className="font-mono text-xs">{generatedOtp}</strong></span>
                <button
                  type="button"
                  className="text-amber-800 underline font-semibold hover:text-amber-950"
                  onClick={() => setOtpCode(generatedOtp.split(''))}
                >
                  Auto-fill
                </button>
              </div>

              <div>
                <label className="form-label-portal text-center block mb-2">ENTER 6-DIGIT VERIFICATION CODE</label>
                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`reset-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-11 h-12 text-center text-lg font-black rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none bg-white font-mono shadow-sm"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && i > 0) {
                          document.getElementById(`reset-otp-${i - 1}`)?.focus()
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  className="font-semibold text-slate-900 hover:underline flex items-center gap-1"
                  onClick={() => {
                    const nextCode = Math.floor(100000 + Math.random() * 900000).toString()
                    setGeneratedOtp(nextCode)
                    setErrorMessage('')
                  }}
                >
                  <RefreshCw size={11} /> Resend OTP
                </button>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold"
                  onClick={() => setStep('request')}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-2 font-bold py-2.5 text-xs flex items-center justify-center gap-1.5"
                  disabled={loading || otpCode.join('').length < 6}
                >
                  {loading ? 'Verifying...' : 'VERIFY & CONTINUE'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Create New Password */}
          {step === 'new_password' && (
            <form onSubmit={handleSaveNewCredentials} className="flex flex-col gap-3.5">
              <div>
                <label className="form-label-portal">NEW PASSWORD</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input-portal pl-10 pr-10 text-sm"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label-portal">CONFIRM NEW PASSWORD</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input-portal pl-10 pr-10 text-sm"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label-portal">NEW 4-DIGIT PIN (OPTIONAL)</label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    className="form-input-portal pl-10 font-mono tracking-widest text-sm"
                    placeholder="e.g. 1234"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
                <span className="text-2xs text-slate-400 mt-1 block">Used for fast matchday and kiosk logins</span>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold"
                  onClick={() => setStep('verify_otp')}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-2 font-bold py-2.5 text-xs flex items-center justify-center gap-1.5"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? 'Saving...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success Confirmation */}
          {step === 'success' && (
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-1">Password Successfully Reset!</h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Your credentials for <strong>{matchedMember?.full_name}</strong> have been updated. You can now sign in with your new password.
              </p>
              <button
                type="button"
                className="btn btn-primary w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
                onClick={handleClose}
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
