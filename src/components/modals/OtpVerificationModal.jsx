import { useState } from 'react'
import {
  X, ShieldCheck, KeyRound, Smartphone, CheckCircle2,
  ArrowRight, RefreshCw
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function OtpVerificationModal() {
  const { otpModalState, setOtpModalState, currentMember } = useCitiPay()
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  if (!otpModalState.isOpen) return null

  const handleClose = () => {
    setVerified(false)
    setOtpModalState({ isOpen: false, memberId: '' })
  }

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    const newOtp = [...otpCode]
    newOtp[index] = value
    setOtpCode(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setVerified(true)
      setTimeout(() => {
        handleClose()
      }, 1200)
    }, 800)
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-sm text-center" onClick={e => e.stopPropagation()}>
        <div className="modal-header-portal pb-0 border-0 justify-end">
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-portal pt-0">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <KeyRound size={28} />
          </div>

          <h3 className="font-extrabold text-lg text-slate-900">Two-Factor OTP Verification</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Enter the 6-digit one-time passcode sent to your registered phone ending in <strong>•••• 6789</strong>
          </p>

          {verified ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
              <CheckCircle2 size={18} /> Identity Authenticated Successfully!
            </div>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="flex justify-center gap-2 mb-6">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="w-11 h-13 text-center font-mono font-extrabold text-xl rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-white"
                    required
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="btn btn-primary w-full font-bold py-3 text-xs flex items-center justify-center gap-2"
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying Code...' : 'VERIFY & SIGN IN'}
                </button>
                <button
                  type="button"
                  className="text-xs text-emerald-700 font-semibold py-1.5 hover:underline"
                  onClick={() => alert('New OTP code sent: 884219')}
                >
                  Resend Passcode (30s)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
