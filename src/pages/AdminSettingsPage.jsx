import { useState } from 'react'
import {
  Sliders, ShieldCheck, Activity, Key, Globe, Database,
  Lock, Save, CheckCircle2, Shield, AlertCircle, RefreshCw
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminSettingsPage() {
  const { clubRules, setRulesConfigModalState } = useCitiPay()
  const [paystackConfig, setPaystackConfig] = useState({
    publicKey: 'pk_live_948f20a91e48bc8271a04917',
    webhookUrl: 'https://citipay.citileague.ng/api/paystack-webhook',
    settlementCycle: 'T+1 Daily Auto-Settlement',
    splitRatio: '98% Club / 2% Processing',
    autoReceiptEmail: true
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
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
            League-wide eligibility criteria, season parameters, Paystack payment gateway integrations, and security policies
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button
            className="btn btn-primary flex items-center gap-2 text-xs font-semibold"
            onClick={handleSave}
          >
            <Save size={15} /> Save Configuration
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="card p-3 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} /> Federation governance parameters and Paystack integration settings updated successfully.
        </div>
      )}

      <div className="grid-2 mb-6">
        {/* League Season Governance */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">SEASON PARAMETERS</h3>
              <p className="text-xs text-slate-500">Official tournament operating boundaries</p>
            </div>
            <span className="badge badge-accent font-bold text-xs">Championship 2026/27</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Competition Title:</span>
              <strong className="text-slate-900">Citi Football Premier Championship</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Current Matchday:</span>
              <strong className="font-mono text-emerald-700 font-bold">Gameweek 14 of 38</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Player Fee Baseline Cap:</span>
              <strong className="text-slate-900 font-mono">₦100,000 / Season</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Max Allowed Installments:</span>
              <strong className="text-slate-900 font-mono">4 Installment Tranches</strong>
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
