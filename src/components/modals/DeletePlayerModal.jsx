import { useState } from 'react'
import {
  X, AlertTriangle, Trash2, ShieldAlert, UserX
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function DeletePlayerModal() {
  const {
    deletePlayerModalState,
    setDeletePlayerModalState,
    removeMember,
    currentRole
  } = useCitiPay()

  const member = deletePlayerModalState?.member
  const [confirmName, setConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  if (!deletePlayerModalState?.isOpen || !member) return null

  const handleClose = () => {
    setConfirmName('')
    setError('')
    setIsDeleting(false)
    setDeletePlayerModalState({ isOpen: false, member: null })
  }

  const isMatch = confirmName.trim().toLowerCase() === member.full_name.trim().toLowerCase() ||
                  confirmName.trim().toUpperCase() === (member.display_id || member.member_id).toUpperCase()

  const handleDelete = async (e) => {
    e.preventDefault()

    if (!isMatch) {
      setError(`Please type the player's full name or Member ID (${member.display_id || member.member_id}) to confirm deletion.`)
      return
    }

    setError('')
    setIsDeleting(true)

    try {
      await removeMember(member.id, member.display_id || member.member_id, member.full_name)
      setIsDeleting(false)
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to remove player.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-container-portal max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <UserX size={18} />
            </div>
            <div>
              <h3 className="modal-title-portal text-rose-950 font-extrabold text-sm">Remove Player from Registry</h3>
              <p className="text-3xs text-slate-500">Super Admin Permanent Action</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDelete} className="p-5 flex flex-col gap-4 text-xs">
          {/* Player Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <img
              src={member.avatar_url || '/avatar-fallback.svg'}
              alt={member.full_name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/avatar-fallback.svg'
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <strong className="text-slate-900 font-extrabold text-sm truncate">{member.full_name}</strong>
                <span className="badge badge-accent text-3xs font-mono font-bold">
                  {member.display_id || member.member_id}
                </span>
              </div>
              <p className="text-3xs text-slate-500 truncate">
                Jersey #{member.jersey_number || '10'} · {member.position || 'CAM'}
              </p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-2xs leading-relaxed">
              This will permanently delete <strong>{member.full_name}</strong>'s profile, tactical dossier, and associated dues records from the league database.
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Type <span className="font-mono text-rose-600 font-black px-1 py-0.5 bg-rose-50 rounded border border-rose-200">{member.display_id || member.member_id}</span> to confirm
            </label>
            <input
              type="text"
              placeholder={`Type "${member.display_id || member.member_id}" here`}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/10 transition-all uppercase placeholder:normal-case placeholder:font-normal placeholder:text-xs"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-2xs font-semibold">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="btn btn-secondary text-xs font-semibold py-2 px-3.5 rounded-xl"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch || isDeleting}
              className={`btn text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all ${
                isMatch && !isDeleting
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Trash2 size={13} />
              <span>{isDeleting ? 'Deleting Player...' : 'Permanently Remove Player'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

