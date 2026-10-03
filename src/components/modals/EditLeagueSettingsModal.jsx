import { useState, useEffect } from 'react'
import {
  X, Calendar, Shirt, Tag, CheckCircle2, ShieldCheck,
  Save, Sparkles, Plus, Minus, ArrowRight
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function EditLeagueSettingsModal() {
  const {
    leagueSettingsModalState,
    setLeagueSettingsModalState,
    leagueSettings,
    updateLeagueSettings
  } = useCitiPay()

  const [matchday, setMatchday] = useState(leagueSettings.current_matchday || 14)
  const [jerseyPrice, setJerseyPrice] = useState(leagueSettings.jersey_price || 18000)
  const [bibPrice, setBibPrice] = useState(leagueSettings.bib_price || 6500)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Keep in sync when modal opens
  useEffect(() => {
    if (leagueSettingsModalState.isOpen) {
      setMatchday(leagueSettings.current_matchday || 14)
      setJerseyPrice(leagueSettings.jersey_price || 18000)
      setBibPrice(leagueSettings.bib_price || 6500)
      setSuccess(false)
    }
  }, [leagueSettingsModalState.isOpen, leagueSettings])

  if (!leagueSettingsModalState.isOpen) return null

  const handleClose = () => {
    setSuccess(false)
    setLeagueSettingsModalState({ isOpen: false })
  }

  const handleSave = (e) => {
    e?.preventDefault()
    setIsSaving(true)

    setTimeout(() => {
      updateLeagueSettings({
        current_matchday: Number(matchday),
        jersey_price: Number(jerseyPrice),
        bib_price: Number(bibPrice),
        adminName: 'Chief Segun Adeleke (Super Admin)'
      })
      setIsSaving(false)
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 900)
    }, 400)
  }

  const stepMatchday = (delta) => {
    setMatchday(prev => Math.max(1, Math.min(38, Number(prev) + delta)))
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent text-xs font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Federation Executive HQ
              </span>
              <span className="badge badge-secondary text-xs font-semibold">Super Admin Override</span>
            </div>
            <h2 className="modal-title-portal">Set Matchday & Apparel Pricing</h2>
            <p className="text-xs text-slate-500">
              Configure official matchday and merchandise prices across all clubs & player stores
            </p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="modal-body-portal">
          {success ? (
            <div className="card p-6 text-center bg-emerald-50 border border-emerald-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-base font-extrabold text-emerald-950 mb-1">League Settings Updated!</h3>
              <p className="text-xs text-emerald-800">
                Gameweek <strong>{matchday}</strong> is now live. Official Jersey set to <strong>₦{Number(jerseyPrice).toLocaleString()}</strong> and Training Bib to <strong>₦{Number(bibPrice).toLocaleString()}</strong>.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* 1. MATCHDAY SECTION */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar size={14} className="text-blue-600" /> Current Matchday / Gameweek
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    GW {matchday} of 38
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Sets the active tournament round for matchday clearance, availability rosters, and team sheets.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                    onClick={() => stepMatchday(-1)}
                    disabled={matchday <= 1}
                  >
                    <Minus size={16} />
                  </button>

                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GW</span>
                    <input
                      type="number"
                      min="1"
                      max="38"
                      value={matchday}
                      onChange={(e) => setMatchday(Math.max(1, Math.min(38, Number(e.target.value) || 1)))}
                      className="form-input-portal text-center font-mono font-extrabold text-lg py-2 pl-9 pr-3 w-full"
                    />
                  </div>

                  <button
                    type="button"
                    className="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                    onClick={() => stepMatchday(1)}
                    disabled={matchday >= 38}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex gap-2 mt-2.5">
                  {[12, 13, 14, 15, 16].map(gw => (
                    <button
                      key={gw}
                      type="button"
                      className={`text-2xs font-bold px-2 py-1 rounded border transition-colors cursor-pointer ${
                        Number(matchday) === gw
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setMatchday(gw)}
                    >
                      GW {gw}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="text-2xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 ml-auto hover:bg-blue-100 cursor-pointer"
                    onClick={() => stepMatchday(1)}
                  >
                    Next Round +1
                  </button>
                </div>
              </div>

              {/* 2. OFFICIAL JERSEY PRICING */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Shirt size={14} className="text-emerald-600" /> Official Matchday Jersey Price (₦)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ₦{Number(jerseyPrice).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Official custom kit price charged to players when ordering Home & Away match jerseys.
                </p>

                <div className="relative mb-2.5">
                  <span className="currency-prefix">₦</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={jerseyPrice}
                    onChange={(e) => setJerseyPrice(Math.max(0, Number(e.target.value)))}
                    className="form-input-portal with-prefix font-mono font-bold text-base w-full"
                    placeholder="18,000"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xs text-slate-400 font-bold uppercase">Presets:</span>
                  {[15000, 18000, 20000, 25000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className={`text-2xs font-mono font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        Number(jerseyPrice) === amt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setJerseyPrice(amt)}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. OFFICIAL TRAINING BIB PRICING */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Tag size={14} className="text-amber-600" /> Official Training Bib Price (₦)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    ₦{Number(bibPrice).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Numbered pinnie/training bib set price for scrimmage and training sessions.
                </p>

                <div className="relative mb-2.5">
                  <span className="currency-prefix">₦</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={bibPrice}
                    onChange={(e) => setBibPrice(Math.max(0, Number(e.target.value)))}
                    className="form-input-portal with-prefix font-mono font-bold text-base w-full"
                    placeholder="6,500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xs text-slate-400 font-bold uppercase">Presets:</span>
                  {[4500, 6500, 8000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className={`text-2xs font-mono font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        Number(bibPrice) === amt
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setBibPrice(amt)}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Impact Note */}
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-3xs text-blue-900 flex items-start gap-2">
                <Sparkles size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Instant League Propagation:</strong> Saving applies new prices immediately to player merchandise stores, quick pay cards, and Paystack checkout modals. Matchday updates sync across all club dashboards, rosters, and audit trails.
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {!success && (
            <div className="modal-footer-portal mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary text-xs font-semibold py-2 px-3.5"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
                disabled={isSaving}
              >
                <Save size={14} />
                {isSaving ? 'Updating League...' : 'Save League Parameters'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
