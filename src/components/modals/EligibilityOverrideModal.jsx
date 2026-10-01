import { useState } from 'react'
import {
  X, Shield, AlertTriangle, CheckCircle2, Clock, User,
  FileText, History, ArrowRight
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function EligibilityOverrideModal() {
  const {
    statusOverrideModalState,
    setStatusOverrideModalState,
    overrideMemberStatus,
    members
  } = useCitiPay()

  const targetMember = statusOverrideModalState.member || members[0]

  const [selectedStatus, setSelectedStatus] = useState(targetMember?.status || 'green')
  const [adminName, setAdminName] = useState('President')
  const [reason, setReason] = useState('Payment confirmed via manual bank transfer reconciliation.')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!statusOverrideModalState.isOpen) return null

  const handleClose = () => {
    setStatusOverrideModalState({ isOpen: false, member: null })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('A mandatory justification reason is required for every manual status override.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      overrideMemberStatus({
        memberId: targetMember.id,
        newStatus: selectedStatus,
        reason: reason.trim(),
        adminName
      })

      setIsSubmitting(false)
      handleClose()
    }, 600)
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-secondary text-xs font-bold flex items-center gap-1">
                <Shield size={12} /> Executive Authority
              </span>
            </div>
            <h2 className="modal-title-portal">Override Member Eligibility</h2>
            <p className="text-xs text-slate-500">Administrative manual status override with mandatory audit log</p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form (Item 6 Requirement) */}
        <form onSubmit={handleSubmit} className="modal-body-portal flex flex-col gap-4">
          {/* Member Card */}
          <div className="member-target-card">
            <img src={targetMember.avatar_url} alt={targetMember.full_name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div>
              <div className="font-extrabold text-sm text-slate-900">{targetMember.full_name}</div>
              <div className="text-xs text-slate-500 font-mono">Member ID: {targetMember.member_id} · #{targetMember.jersey_number}</div>
            </div>
            <div className="ml-auto text-right">
              <span className="text-3xs text-slate-400 uppercase font-bold block">Current:</span>
              <span className={`status-badge-mini ${targetMember.status}`}>
                {targetMember.status === 'green' ? '🟢 GREEN' : targetMember.status === 'yellow' ? '🟡 YELLOW' : '🔴 RED'}
              </span>
            </div>
          </div>

          {/* New Status Picker (Item 6 Requirement) */}
          <div>
            <label className="form-label-portal">SELECT NEW STATUS</label>
            <div className="status-selector-grid">
              <button
                type="button"
                className={`status-choice-btn green ${selectedStatus === 'green' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('green')}
              >
                <span className="status-choice-dot green" />
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900">🟢 Eligible</div>
                  <div className="text-3xs text-slate-500">Green clearance</div>
                </div>
              </button>

              <button
                type="button"
                className={`status-choice-btn yellow ${selectedStatus === 'yellow' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('yellow')}
              >
                <span className="status-choice-dot yellow" />
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900">🟡 Payment Due Soon</div>
                  <div className="text-3xs text-slate-500">Grace period</div>
                </div>
              </button>

              <button
                type="button"
                className={`status-choice-btn red ${selectedStatus === 'red' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('red')}
              >
                <span className="status-choice-dot red" />
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900">🔴 Not Eligible</div>
                  <div className="text-3xs text-slate-500">Suspended / Overdue</div>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Role */}
          <div>
            <label className="form-label-portal">ADMINISTRATOR SIGN-OFF</label>
            <input
              type="text"
              className="form-input-portal font-semibold text-sm"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="President / General Secretary"
              required
            />
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="form-label-portal">
              MANDATORY REASON <span className="text-rose-500">*</span>
            </label>
            <textarea
              className="form-input-portal text-xs h-24"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              placeholder="e.g. Payment confirmed via manual bank transfer. Approved by President on executive committee review."
              required
            />
            {error && <p className="text-rose-600 text-xs mt-1 font-semibold">{error}</p>}
          </div>

          {/* Audit Log Preview (Item 6 Requirement) */}
          <div className="audit-preview-box">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
              <History size={13} className="text-slate-500" />
              <span>AUDIT LOG ENTRY PREVIEW:</span>
            </div>
            <div className="font-mono text-2xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
              Status changed from <strong>{targetMember.status.toUpperCase()}</strong> → <strong>{selectedStatus.toUpperCase()}</strong>. Administrator: <strong>{adminName}</strong>. Reason: <em>"{reason || '...'}"</em>. Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-2 font-bold py-2.5 text-xs flex items-center justify-center gap-1.5"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Logging Override...' : 'CONFIRM STATUS OVERRIDE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
