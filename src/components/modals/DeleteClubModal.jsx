import { useState } from 'react'
import {
  X, AlertTriangle, Trash2, ShieldAlert, Building2
} from 'lucide-react'
import './ModalStyles.css'

export default function DeleteClubModal({ isOpen, club, onClose, onConfirm }) {
  const [confirmCode, setConfirmCode] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !club) return null

  const isPrimary = club.id === 'club-sunday-league' || club.id === 'club-001'
  const isMatch = confirmCode.trim().toUpperCase() === club.code.toUpperCase()

  const handleDelete = async (e) => {
    e.preventDefault()
    if (isPrimary) {
      setError('Cannot delete Sunday League FC: it is the primary anchor club.')
      return
    }

    if (!isMatch) {
      setError(`Please enter "${club.code}" exactly to confirm disbandment.`)
      return
    }

    setError('')
    setIsDeleting(true)

    try {
      await onConfirm(club.id)
      setIsDeleting(false)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to delete club.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={onClose}>
      <div className="modal-content-portal max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="modal-title-portal text-rose-950 font-extrabold text-sm">Disband & Delete Club</h3>
              <p className="text-3xs text-slate-500">Super Admin Permanent Action</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleDelete} className="p-5 flex flex-col gap-4 text-xs">
          {isPrimary ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Protected Federation Anchor</strong>
                <p className="text-2xs leading-relaxed text-amber-800">
                  <strong>{club.name}</strong> is the primary chartered club for Citi Football Federation. It cannot be deleted or disbanded.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Club Dossier Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={club.logo_url}
                  alt={club.name}
                  className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 p-1 shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/crests/sunday-league-fc.svg'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <strong className="text-slate-900 font-extrabold text-sm truncate">{club.name}</strong>
                    <span className="badge badge-accent text-3xs font-mono font-bold">{club.code}</span>
                  </div>
                  <p className="text-3xs text-slate-500 truncate">{club.stadium} · {club.city}</p>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900 flex items-start gap-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-2xs leading-relaxed">
                  Permanently revokes this club's charter. Members will be unassigned from this club, and an immutable log will be posted to the federation audit ledger.
                </div>
              </div>

              {/* Security Confirmation Input */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Type <span className="font-mono text-rose-600 font-black px-1 py-0.5 bg-rose-50 rounded border border-rose-200">{club.code}</span> to confirm
                </label>
                <input
                  type="text"
                  placeholder={`Type "${club.code}" here`}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/10 transition-all uppercase placeholder:normal-case placeholder:font-normal placeholder:text-xs"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-100/70 border border-rose-300 text-rose-900 text-2xs font-semibold">
                  {error}
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="btn btn-secondary text-xs font-semibold py-2 px-3.5 rounded-xl"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>

            {!isPrimary && (
              <button
                type="submit"
                disabled={!isMatch || isDeleting}
                className="btn text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>{isDeleting ? 'Disbanding...' : 'Permanently Delete Club'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
