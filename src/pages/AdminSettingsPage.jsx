import { useState, useEffect } from 'react'
import {
  Sliders, ShieldCheck, Activity, Key, Globe, Database,
  Lock, Save, CheckCircle2, Shield, AlertCircle, RefreshCw,
  Shirt, Tag, Calendar, Plus, Minus, Sparkles
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminSettingsPage() {
  const { currentClub, clubRules, setRulesConfigModalState, updateClubFees, leagueSettings, updateLeagueSettings } = useCitiPay()
  const [seasonFee, setSeasonFee] = useState(currentClub.membership_fee || 100000)
  const [socialDues, setSocialDues] = useState(currentClub.monthly_social_dues || 5000)
  const [matchday, setMatchday] = useState(leagueSettings.current_matchday || 14)
  const [jerseyPrice, setJerseyPrice] = useState(leagueSettings.jersey_price || 18000)
  const [bibPrice, setBibPrice] = useState(leagueSettings.bib_price || 6500)

  useEffect(() => {
    if (leagueSettings) {
      setMatchday(leagueSettings.current_matchday)
      setJerseyPrice(leagueSettings.jersey_price)
      setBibPrice(leagueSettings.bib_price)
    }
  }, [leagueSettings])

  const [paystackConfig, setPaystackConfig] = useState({
    publicKey: 'pk_live_948f20a91e48bc8271a04917',
    webhookUrl: 'https://citipay.citileague.ng/api/paystack-webhook',
    settlementCycle: 'T+1 Daily Auto-Settlement',
    splitRatio: '98% Club / 2% Processing',
    autoReceiptEmail: true
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = () => {
    updateClubFees({
      clubId: currentClub.id,
      membership_fee: Number(seasonFee),
      monthly_social_dues: Number(socialDues),
      max_installments: 2,
      adminName: 'Chief Segun Adeleke (Super Admin)'
    })

    updateLeagueSettings({
      current_matchday: Number(matchday),
      jersey_price: Number(jerseyPrice),
      bib_price: Number(bibPrice),
      adminName: 'Chief Segun Adeleke (Super Admin)'
    })

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  const stepMatchday = (delta) => {
    setMatchday(prev => Math.max(1, Math.min(38, Number(prev) + delta)))
  }

  return (
    <div className="admin-dashboard-wrap">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent font-bold flex items-center gap-1 text-xs">
              <ShieldCheck size={12} /> Citi Football Federation
            </span>
            <span className="badge badge-secondary text-xs font-semibold">Federation Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            League-wide eligibility criteria, current tournament matchday, official jersey & bib pricing, and gateway integrations
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button
            className="btn btn-primary flex items-center gap-2 text-xs font-bold py-2.5 px-4 shadow-sm"
            onClick={handleSave}
          >
            <Save size={15} /> Save All Parameters
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="card p-3 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Federation parameters updated: Gameweek set to <strong>{matchday}</strong>, Jersey price set to <strong>₦{Number(jerseyPrice).toLocaleString()}</strong>, Bib price set to <strong>₦{Number(bibPrice).toLocaleString()}</strong>, and club fees saved.</span>
        </div>
      )}

      {/* Row 1: Matchday Governance & Apparel Pricing */}
      <div className="grid-2 mb-6">
        {/* Tournament Round & Matchday Governance */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <Calendar size={16} className="text-blue-600" />
                TOURNAMENT MATCHDAY SCHEDULE
              </h3>
              <p className="text-xs text-slate-500">Edit active league gameweek and tournament round</p>
            </div>
            <span className="badge badge-accent font-bold text-xs">Championship 2026/27</span>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-blue-800 block">Active League Gameweek</span>
                <div className="text-xl font-extrabold font-mono text-blue-950 mt-0.5">
                  Gameweek {matchday} <span className="text-xs font-normal text-blue-700">of 38</span>
                </div>
              </div>
              <span className="badge badge-primary font-mono font-bold text-xs py-1 px-2.5">
                LIVE ROUND
              </span>
            </div>

            {/* Stepper Controls */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SET CURRENT MATCHDAY (1 – 38)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                  onClick={() => stepMatchday(-1)}
                  disabled={matchday <= 1}
                  title="Previous Gameweek"
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
                    className="form-input-portal text-center font-mono font-extrabold text-base py-2 pl-9 pr-3 w-full"
                  />
                </div>

                <button
                  type="button"
                  className="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                  onClick={() => stepMatchday(1)}
                  disabled={matchday >= 38}
                  title="Next Gameweek"
                >
                  <Plus size={16} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary text-xs font-bold py-2.5 px-3 whitespace-nowrap"
                  onClick={() => stepMatchday(1)}
                  disabled={matchday >= 38}
                >
                  Advance +1
                </button>
              </div>

              {/* Quick Gameweek Selector */}
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <span className="text-3xs text-slate-400 font-bold uppercase">Quick Jumps:</span>
                {[1, 10, 14, 15, 19, 38].map(gw => (
                  <button
                    key={gw}
                    type="button"
                    className={`text-2xs font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      Number(matchday) === gw
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setMatchday(gw)}
                  >
                    GW {gw}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Competition Title:</span>
                <strong className="text-slate-900">Citi Football Premier Championship</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Clearance Synchronization:</span>
                <span className="text-emerald-700 font-bold">Auto-syncs team rosters & team sheets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Super Admin Official Apparel & Merchandise Pricing */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <Shirt size={16} className="text-emerald-600" />
                OFFICIAL APPAREL & MERCHANDISE PRICING
              </h3>
              <p className="text-xs text-slate-500">Super Admin uniform & training gear price matrix</p>
            </div>
            <span className="badge badge-success font-bold text-xs">Super Admin Authority</span>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            {/* Jersey Price */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Shirt size={13} className="text-emerald-600" /> Official Matchday Jersey Price (₦)
                </label>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  ₦{Number(jerseyPrice).toLocaleString()}
                </span>
              </div>
              <p className="text-3xs text-slate-500 mb-2">Customized Home & Away team jersey with player name & squad number.</p>

              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <span className="currency-prefix">₦</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    className="form-input-portal with-prefix font-mono font-bold text-xs py-1.5 w-full"
                    value={jerseyPrice}
                    onChange={(e) => setJerseyPrice(Math.max(0, Number(e.target.value)))}
                    placeholder="18,000"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
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

            {/* Bib Price */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Tag size={13} className="text-amber-600" /> Official Training Bib Price (₦)
                </label>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                  ₦{Number(bibPrice).toLocaleString()}
                </span>
              </div>
              <p className="text-3xs text-slate-500 mb-2">Numbered scrimmage bib pack for training and practice matches.</p>

              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <span className="currency-prefix">₦</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    className="form-input-portal with-prefix font-mono font-bold text-xs py-1.5 w-full"
                    value={bibPrice}
                    onChange={(e) => setBibPrice(Math.max(0, Number(e.target.value)))}
                    placeholder="6,500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
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

            {/* Live Impact Pill */}
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-2xs text-emerald-900">
              <Sparkles size={14} className="text-emerald-600 shrink-0" />
              <span>Instantly reflects in all Player Portals, Kit Store & Paystack Checkout.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* League Season Governance */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">CLUB FEE BASELINE</h3>
              <p className="text-xs text-slate-500">Official tournament operating boundaries & fee baseline</p>
            </div>
            <span className="badge badge-accent font-bold text-xs">Championship 2026/27</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Player Season Fee Baseline:</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-400">₦</span>
                <input
                  type="number"
                  className="form-input-portal font-mono font-bold text-xs py-1 px-2 w-32"
                  value={seasonFee}
                  onChange={(e) => setSeasonFee(e.target.value)}
                  step="1000"
                  min="1000"
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Monthly Social Dues Baseline:</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-400">₦</span>
                <input
                  type="number"
                  className="form-input-portal font-mono font-bold text-xs py-1 px-2 w-32"
                  value={socialDues}
                  onChange={(e) => setSocialDues(e.target.value)}
                  step="500"
                  min="100"
                />
              </div>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Max Allowed Installments:</span>
              <strong className="text-slate-900 font-mono">2 Installment Tranches (Twice per Season)</strong>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Operating Currency:</span>
              <strong className="font-mono text-slate-900">NGN (₦ - Nigerian Naira)</strong>
            </div>
          </div>
        </div>

        {/* Global Eligibility Thresholds */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">GLOBAL ELIGIBILITY RULES</h3>
              <p className="text-xs text-slate-500">Standardized Green / Yellow / Red rules</p>
            </div>
            <button
              className="btn btn-secondary text-xs py-1.5 px-3 font-bold"
              onClick={() => setRulesConfigModalState({ isOpen: true })}
            >
              <Sliders size={13} className="inline mr-1" /> Configure
            </button>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
              <div className="font-bold text-emerald-900 mb-0.5">🟢 Green (Eligible) Standard</div>
              <div className="text-slate-600">Zero outstanding balance (₦0) and current social dues settled.</div>
            </div>

            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
              <div className="font-bold text-amber-900 mb-0.5">🟡 Yellow (Due Soon) Grace Window</div>
              <div className="text-slate-600">Up to ₦{clubRules.yellow_max_balance.toLocaleString()} outstanding within {clubRules.yellow_due_days_window || 14}-day window.</div>
            </div>

            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50">
              <div className="font-bold text-rose-900 mb-0.5">🔴 Red (Ineligible) Barring</div>
              <div className="text-slate-600">Exceeds ₦{clubRules.red_min_balance.toLocaleString()} or dues overdue. Banned from matchday sheet.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Gateway Configuration */}
      <div className="card p-5 mb-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">PAYSTACK GATEWAY INTEGRATION</h3>
            <p className="text-xs text-slate-500">Live API credentials and automated webhook endpoints</p>
          </div>
          <span className="badge badge-success font-bold text-xs flex items-center gap-1">
            <Activity size={12} /> Connected & Verified
          </span>
        </div>

        <div className="grid-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Paystack Live Public Key</label>
            <div className="relative">
              <input
                type="text"
                value={paystackConfig.publicKey}
                onChange={(e) => setPaystackConfig({ ...paystackConfig, publicKey: e.target.value })}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
              />
              <Key size={14} className="absolute right-3 top-3 text-slate-400" />
            </div>
            <span className="text-3xs text-slate-400 mt-1 block">Used by clientside modal to initialize inline Paystack popups</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Webhook Endpoint URL</label>
            <div className="relative">
              <input
                type="text"
                value={paystackConfig.webhookUrl}
                onChange={(e) => setPaystackConfig({ ...paystackConfig, webhookUrl: e.target.value })}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
              />
              <Globe size={14} className="absolute right-3 top-3 text-slate-400" />
            </div>
            <span className="text-3xs text-slate-400 mt-1 block">Receives <code>charge.success</code> and settlement webhooks</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center flex-wrap gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Automatic Payout Schedule: </span>
            <strong className="text-slate-900">{paystackConfig.settlementCycle}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Automated Digital Receipts: </span>
            <strong className="text-emerald-700 font-bold">Enabled (Paystack & In-App)</strong>
          </div>
        </div>
      </div>

      {/* Federation Executive Leadership */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">FEDERATION GOVERNANCE OFFICERS</h3>
            <p className="text-xs text-slate-500">Super Admin authorization holders</p>
          </div>
          <span className="badge badge-accent font-bold text-xs">Authority Level 1</span>
        </div>

        <div className="grid-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-extrabold text-slate-900 text-xs">Chief Segun Adeleke</div>
            <div className="text-3xs text-emerald-700 font-semibold mb-2">Federation President</div>
            <div className="text-3xs text-slate-500 font-mono">ID: FED-SUP-001 · Full Override Authority</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-extrabold text-slate-900 text-xs">Barr. Funke Oshodi</div>
            <div className="text-3xs text-blue-700 font-semibold mb-2">Chief Legal & Compliance Officer</div>
            <div className="text-3xs text-slate-500 font-mono">ID: FED-LEG-002 · Audit & Rules Governance</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-extrabold text-slate-900 text-xs">Engr. Tolu Coker</div>
            <div className="text-3xs text-purple-700 font-semibold mb-2">Head of League Operations</div>
            <div className="text-3xs text-slate-500 font-mono">ID: FED-OPS-003 · Matchday Clearances</div>
          </div>
        </div>
      </div>
    </div>
  )
}
