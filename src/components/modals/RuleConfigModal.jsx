import { useState, useEffect } from 'react'
import {
  X, Sliders, ShieldCheck, CheckCircle2, AlertCircle,
  HelpCircle, RefreshCw, Save, Calendar, Plus, Minus
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function RuleConfigModal() {
  const {
    rulesConfigModalState,
    setRulesConfigModalState,
    clubRules,
    updateClubRules,
    updateClubFees,
    updateClubMatchday,
    currentClub,
    clubs,
    setSelectedClubId,
    leagueSettings,
    currentRole
  } = useCitiPay()

  const activeClub = rulesConfigModalState.club || currentClub
  const [selectedClubForRules, setSelectedClubForRules] = useState(activeClub.id)
  const targetClub = clubs.find(c => c.id === selectedClubForRules) || activeClub

  const [clubMatchday, setClubMatchday] = useState(targetClub.current_matchday || leagueSettings.current_matchday || 14)
  const [membershipFee, setMembershipFee] = useState(targetClub.membership_fee || 100000)
  const [monthlyDues, setMonthlyDues] = useState(targetClub.monthly_social_dues || 5000)
  const [greenMax, setGreenMax] = useState(clubRules.green_max_balance || 0)
  const [yellowMax, setYellowMax] = useState(clubRules.yellow_max_balance || 20000)
  const [yellowDays, setYellowDays] = useState(clubRules.yellow_due_days_window || 14)
  const [redMin, setRedMin] = useState(clubRules.red_min_balance || 20001)
  const [redDays, setRedDays] = useState(clubRules.red_overdue_days_threshold || 14)
  const [requireSocialDues, setRequireSocialDues] = useState(clubRules.require_social_dues_current ?? true)
  const [isSaving, setIsSaving] = useState(false)

  // Keep state synced when modal opens or selected club changes
  useEffect(() => {
    if (rulesConfigModalState.isOpen) {
      const c = rulesConfigModalState.club || targetClub || currentClub
      setSelectedClubForRules(c.id)
      setClubMatchday(c.current_matchday || leagueSettings.current_matchday || 14)
      setMembershipFee(c.membership_fee || 100000)
      setMonthlyDues(c.monthly_social_dues || 5000)
      setGreenMax(clubRules.green_max_balance || 0)
      setYellowMax(clubRules.yellow_max_balance || 20000)
      setYellowDays(clubRules.yellow_due_days_window || 14)
      setRedMin(clubRules.red_min_balance || 20001)
      setRedDays(clubRules.red_overdue_days_threshold || 14)
      setRequireSocialDues(clubRules.require_social_dues_current ?? true)
    }
  }, [rulesConfigModalState.isOpen, rulesConfigModalState.club, currentClub, clubRules, leagueSettings])

  const handleClubChange = (clubId) => {
    setSelectedClubForRules(clubId)
    setSelectedClubId(clubId)
    const newTarget = clubs.find(c => c.id === clubId)
    if (newTarget) {
      setClubMatchday(newTarget.current_matchday || leagueSettings.current_matchday || 14)
      setMembershipFee(newTarget.membership_fee || 100000)
      setMonthlyDues(newTarget.monthly_social_dues || 5000)
    }
  }

  if (!rulesConfigModalState.isOpen) return null

  const handleClose = () => {
    setRulesConfigModalState({ isOpen: false, club: null })
  }

  const stepMatchday = (delta) => {
    setClubMatchday(prev => Math.max(1, Math.min(16, Number(prev) + delta)))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)

    setTimeout(() => {
      const actorName = currentRole === 'super_admin' ? 'TIZA NEGE (Super Admin)' : 'ATILOLA ISMAIL (Club President)'
      updateClubFees({
        clubId: targetClub.id,
        membership_fee: Number(membershipFee),
        monthly_social_dues: Number(monthlyDues),
        max_installments: 2,
        current_matchday: Number(clubMatchday),
        adminName: actorName
      })
      updateClubRules({
        current_matchday: Number(clubMatchday),
        green_max_balance: Number(greenMax),
        yellow_max_balance: Number(yellowMax),
        yellow_due_days_window: Number(yellowDays),
        red_min_balance: Number(redMin),
        red_overdue_days_threshold: Number(redDays),
        require_social_dues_current: requireSocialDues
      })
      if (updateClubMatchday) {
        updateClubMatchday(targetClub.id, Number(clubMatchday), actorName)
      }
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
              {currentRole === 'super_admin' && (
                <span className="badge badge-accent text-3xs font-bold font-mono">
                  Super Admin
                </span>
              )}
            </div>
            <h2 className="modal-title-portal">Configure Eligibility Thresholds</h2>
            <p className="text-xs text-slate-500">
              Customize financial rules and threshold cutoffs for <strong>{targetClub.name}</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form (Item 5 Requirement) */}
        <form onSubmit={handleSave} className="modal-body-portal flex flex-col gap-4">
          {/* Super Admin Club Selector */}
          {currentRole === 'super_admin' && clubs.length > 1 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="form-label-portal">SELECT CLUB FOR RULES CONFIGURATION</label>
              <select
                className="form-input-portal font-bold text-xs"
                value={selectedClubForRules}
                onChange={(e) => handleClubChange(e.target.value)}
              >
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) · Active GW {c.current_matchday || 14}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Club Active Gameweek / Matchday Configuration */}
          <div className="rule-config-block" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
            <div className="rule-config-header">
              <div className="flex items-center gap-2">
                <span className="status-dot-sm" style={{ background: '#16a34a' }} />
                <strong className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-700" /> ACTIVE CLUB GAMEWEEK
                </strong>
              </div>
              <span className="badge badge-success text-3xs font-black font-mono">
                GW {clubMatchday} of 16
              </span>
            </div>

            <div className="rule-config-inputs mt-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-800 font-bold block">Tournament Gameweek / Round:</span>
                  <span className="text-3xs text-slate-500">Sets the active fixture round for {targetClub.name} clearance</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-7 h-7 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                    onClick={() => stepMatchday(-1)}
                    disabled={clubMatchday <= 1}
                  >
                    <Minus size={13} />
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-emerald-800 text-xs">GW</span>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      className="rule-input-field font-mono font-extrabold text-center text-xs py-1 px-2 w-14"
                      value={clubMatchday}
                      onChange={(e) => setClubMatchday(Math.max(1, Math.min(16, Number(e.target.value) || 1)))}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="w-7 h-7 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                    onClick={() => stepMatchday(1)}
                    disabled={clubMatchday >= 16}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Quick Jump Pills */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-emerald-200/60 flex-wrap">
                <span className="text-3xs text-emerald-800 font-bold uppercase tracking-wider">Quick Select:</span>
                {[1, 4, 8, 12, 14, 15, 16].map(gw => (
                  <button
                    key={gw}
                    type="button"
                    className={`text-3xs font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                      Number(clubMatchday) === gw
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50'
                    }`}
                    onClick={() => setClubMatchday(gw)}
                  >
                    GW {gw}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Club Dues & Membership Fee Configuration */}
          <div className="rule-config-block" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
            <div className="rule-config-header">
              <div className="flex items-center gap-2">
                <span className="status-dot-sm" style={{ background: '#2563eb' }} />
                <strong className="text-xs font-extrabold text-slate-800">💰 DUES & MEMBERSHIP FEES</strong>
              </div>
              <span className="badge badge-accent text-3xs font-bold font-mono">2 Installments</span>
            </div>

            <div className="rule-config-inputs mt-2 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-800 font-bold block">Season Membership Fee:</span>
                  <span className="text-3xs text-slate-500">Split into 2 tranches of ₦{Math.round(Number(membershipFee || 0) / 2).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">₦</span>
                  <input
                    type="number"
                    className="rule-input-field font-mono font-bold"
                    value={membershipFee}
                    onChange={(e) => setMembershipFee(e.target.value)}
                    required
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-800 font-bold block">Monthly Social Dues:</span>
                  <span className="text-3xs text-slate-500">Recurring monthly player obligation</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">₦</span>
                  <input
                    type="number"
                    className="rule-input-field font-mono font-bold"
                    value={monthlyDues}
                    onChange={(e) => setMonthlyDues(e.target.value)}
                    required
                    min="100"
                    step="500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-3xs text-blue-900 flex items-center justify-between">
                <span>Payment Plan: <strong>2 Installments (50% / 50%)</strong></span>
                <span className="font-mono font-bold">2x ₦{Math.round(Number(membershipFee || 0) / 2).toLocaleString()}</span>
              </div>
            </div>
          </div>

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
