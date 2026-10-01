import { useState } from 'react'
import {
  X, Sliders, ShieldCheck, CheckCircle2, AlertCircle,
  HelpCircle, RefreshCw, Save
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function RuleConfigModal() {
  const {
    rulesConfigModalState,
    setRulesConfigModalState,
    clubRules,
    updateClubRules,
    currentClub
  } = useCitiPay()

  const [greenMax, setGreenMax] = useState(clubRules.green_max_balance || 0)
  const [yellowMax, setYellowMax] = useState(clubRules.yellow_max_balance || 20000)
  const [yellowDays, setYellowDays] = useState(clubRules.yellow_due_days_window || 14)
  const [redMin, setRedMin] = useState(clubRules.red_min_balance || 20001)
  const [redDays, setRedDays] = useState(clubRules.red_overdue_days_threshold || 14)
  const [requireSocialDues, setRequireSocialDues] = useState(clubRules.require_social_dues_current ?? true)
  const [isSaving, setIsSaving] = useState(false)

  if (!rulesConfigModalState.isOpen) return null

  const handleClose = () => {
    setRulesConfigModalState({ isOpen: false })
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)

    setTimeout(() => {
      updateClubRules({
        green_max_balance: Number(greenMax),
        yellow_max_balance: Number(yellowMax),
        yellow_due_days_window: Number(yellowDays),
        red_min_balance: Number(redMin),
        red_overdue_days_threshold: Number(redDays),
        require_social_dues_current: requireSocialDues
      })
      setIsSaving(false)
      handleClose()
    }, 600)
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary text-xs font-bold flex items-center gap-1">
                <Sliders size={12} /> Club Governance Engine
              </span>
            </div>
            <h2 className="modal-title-portal">Configure Eligibility Thresholds</h2>
            <p className="text-xs text-slate-500">
              Customize financial rules and threshold cutoffs for <strong>{currentClub.name}</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form (Item 5 Requirement) */}
        <form onSubmit={handleSave} className="modal-body-portal flex flex-col gap-4">
          {/* Green Rule Block */}
          <div className="rule-config-block green-theme">
            <div className="rule-config-header">
              <div className="flex items-center gap-2">
                <span className="status-dot-sm green" />
                <strong className="text-xs font-extrabold text-emerald-800">🟢 GREEN — ELIGIBLE RULE</strong>
              </div>
              <span className="badge badge-success text-3xs font-bold">Compliant</span>
            </div>
            <div className="rule-config-inputs mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Maximum Outstanding Balance:</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">₦</span>
                  <input
                    type="number"
                    className="rule-input-field"
                    value={greenMax}
                    onChange={(e) => setGreenMax(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-3xs text-emerald-800 mt-1">
                Member must owe <strong>₦{Number(greenMax).toLocaleString()}</strong> or less to maintain full green matchday eligibility.
              </p>
            </div>
          </div>

          {/* Yellow Rule Block */}
          <div className="rule-config-block yellow-theme">
            <div className="rule-config-header">
              <div className="flex items-center gap-2">
                <span className="status-dot-sm yellow" />
                <strong className="text-xs font-extrabold text-amber-800">🟡 YELLOW — PAYMENT DUE SOON</strong>
              </div>
              <span className="badge badge-warning text-3xs font-bold">Grace Period</span>
            </div>
            <div className="rule-config-inputs mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Outstanding Balance Threshold:</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">₦1 – ₦</span>
                  <input
                    type="number"
                    className="rule-input-field"
                    value={yellowMax}
                    onChange={(e) => setYellowMax(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Or Upcoming Due Date Within:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="rule-input-field"
                    value={yellowDays}
                    onChange={(e) => setYellowDays(e.target.value)}
                    required
                  />
                  <span className="text-xs text-slate-600 font-medium">Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Red Rule Block */}
          <div className="rule-config-block red-theme">
            <div className="rule-config-header">
              <div className="flex items-center gap-2">
                <span className="status-dot-sm red" />
                <strong className="text-xs font-extrabold text-rose-800">🔴 RED — NOT ELIGIBLE</strong>
              </div>
              <span className="badge badge-danger text-3xs font-bold">Matchday Inactive</span>
            </div>
            <div className="rule-config-inputs mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Outstanding Balance Exceeds:</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">&gt; ₦</span>
                  <input
                    type="number"
                    className="rule-input-field"
                    value={yellowMax}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Or Payment Overdue By:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="rule-input-field"
                    value={redDays}
                    onChange={(e) => setRedDays(e.target.value)}
                    required
                  />
                  <span className="text-xs text-slate-600 font-medium">Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Dues Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="font-bold text-xs text-slate-900">Require Monthly Social Dues Clearance</div>
              <div className="text-3xs text-slate-500">Unpaid monthly dues automatically downgrades status to Red</div>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-emerald-600 rounded"
              checked={requireSocialDues}
              onChange={(e) => setRequireSocialDues(e.target.checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-2 font-bold py-2.5 text-xs flex items-center justify-center gap-1.5"
              disabled={isSaving}
            >
              <Save size={15} />
              {isSaving ? 'Recalculating Roster...' : 'SAVE & APPLY RULES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
