import { useState } from 'react'
import {
  X, Lock, Mail, CheckCircle2, ShieldCheck, ArrowRight
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function PasswordResetModal() {
  const { resetPassModalState, setResetPassModalState } = useCitiPay()
  const [identifier, setIdentifier] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!resetPassModalState.isOpen) return null

  const handleClose = () => {
    setIsSent(false)
    setResetPassModalState({ isOpen: false })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setIsSent(true)
    }, 700)
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-secondary text-xs font-bold flex items-center gap-1">
                <Lock size={12} /> Account Recovery
              </span>
            </div>
            <h2 className="modal-title-portal">Reset Password / PIN</h2>
            <p className="text-xs text-slate-500">We'll send secure verification steps to your registered contact</p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-portal">
          {isSent ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Check your email or phone for temporary OTP reset link.
              </p>
              <button className="btn btn-primary w-full text-xs font-bold py-2.5" onClick={handleClose}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="form-label-portal">MEMBER ID, EMAIL OR REGISTERED PHONE</label>
                <input
                  type="text"
                  className="form-input-portal text-sm font-semibold"
                  placeholder="e.g. SL-8K4P2 or michael.esu@sundayleague.ng"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
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
                  disabled={loading || !identifier}
                >
                  {loading ? 'Dispatching...' : 'SEND RESET INSTRUCTIONS'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
