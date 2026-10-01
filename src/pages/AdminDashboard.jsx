import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy, Users, CreditCard, Building2, TrendingUp,
  Shield, CheckCircle2, AlertTriangle, Download, ArrowUpRight,
  ShieldCheck, Activity, DollarSign, Sliders, Landmark, ArrowRight
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { clubs, members, adminMetrics, auditLogs, setRulesConfigModalState } = useCitiPay()

  return (
    <div className="admin-dashboard-wrap">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent font-bold flex items-center gap-1 text-xs">
              <ShieldCheck size={12} /> Citi Football Federation
            </span>
            <span className="badge badge-secondary text-xs font-semibold">Super Admin Authority</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">League Operations & Governance</h1>
          <p className="text-xs text-slate-500 mt-1">Cross-club payment ledgers, member eligibility clearance, and automated Paystack audit trails</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            className="btn btn-secondary flex items-center gap-2 text-xs font-semibold"
            onClick={() => setRulesConfigModalState({ isOpen: true })}
          >
            <Sliders size={15} /> Configure League Rules
          </button>
          <button className="btn btn-primary flex items-center gap-2 text-xs font-semibold" onClick={() => window.print()}>
            <Download size={15} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* Quick Governance Links */}
      <div className="grid-5 mb-6">
        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/admin/clubs')}
        >
          <div className="flex items-center justify-between mb-1">
            <Building2 size={18} className="text-purple-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Affiliated Clubs</div>
          <div className="text-3xs text-slate-500 font-medium">{clubs.length} Licensed Clubs</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/admin/players')}
        >
          <div className="flex items-center justify-between mb-1">
            <Users size={18} className="text-blue-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Player Registry</div>
          <div className="text-3xs text-slate-500 font-medium">{members.length} Registered</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/admin/payments')}
        >
          <div className="flex items-center justify-between mb-1">
            <CreditCard size={18} className="text-emerald-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Paystack Revenue</div>
          <div className="text-3xs text-slate-500 font-medium">₦{adminMetrics.collectedRevenue.toLocaleString()} Volume</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/admin/audit')}
        >
          <div className="flex items-center justify-between mb-1">
            <Shield size={18} className="text-amber-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Master Audit Log</div>
          <div className="text-3xs text-slate-500 font-medium">{auditLogs.length} Verified Events</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/admin/settings')}
        >
          <div className="flex items-center justify-between mb-1">
            <Sliders size={18} className="text-slate-700" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-700 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Governance Settings</div>
          <div className="text-3xs text-slate-500 font-medium">Rules & Integrations</div>
        </button>
      </div>

      {/* League Wide Metrics (4 Horizontal Grid Cards) */}
      <div className="grid-4 mb-6">
        <div
          className="admin-metric-card cursor-pointer hover:border-emerald-300 transition-all"
          onClick={() => navigate('/admin/payments')}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total League Revenue</span>
            <div className="admin-metric-icon-box bg-emerald-50 text-emerald-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-heading">₦{adminMetrics.collectedRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-between">
            <span>100% Verified via Paystack</span>
            <ArrowRight size={12} className="text-emerald-500" />
          </div>
        </div>

        <div
          className="admin-metric-card cursor-pointer hover:border-blue-300 transition-all"
          onClick={() => navigate('/admin/players')}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Players</span>
            <div className="admin-metric-icon-box bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-heading">{members.length} Players</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center justify-between">
            <span>{adminMetrics.eligibleGreen} Matchday Eligible</span>
            <ArrowRight size={12} className="text-blue-500" />
          </div>
        </div>

        <div
          className="admin-metric-card cursor-pointer hover:border-purple-300 transition-all"
          onClick={() => navigate('/admin/clubs')}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Affiliated Clubs</span>
            <div className="admin-metric-icon-box bg-purple-50 text-purple-600">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 font-heading">{clubs.length} Clubs</div>
          <div className="text-xs text-slate-500 mt-1 font-medium flex items-center justify-between">
            <span>Sunday League FC Primary Active</span>
            <ArrowRight size={12} className="text-purple-500" />
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Championship Status</span>
            <div className="admin-metric-icon-box bg-amber-50 text-amber-600">
              <Trophy size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-heading">Gameweek 14</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Next Match: Saturday, 4:00 PM</div>
        </div>
      </div>

      {/* 2-Column: Clubs Summary & Realtime Audit Trail */}
      <div className="grid-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title">Affiliated League Clubs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active clubs licensed for 2026/27 Championship</p>
            </div>
            <button
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              onClick={() => navigate('/admin/clubs')}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {clubs.map(c => (
              <div key={c.id} className="club-overview-row">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={c.logo_url}
                    alt={c.name}
                    className="club-logo-thumb"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/crests/sunday-league-fc.svg'
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{c.name}</div>
                    <div className="text-xs text-slate-500 truncate">{c.stadium} · {c.city}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-bold text-emerald-600 font-mono text-sm whitespace-nowrap">Fee: ₦{c.membership_fee.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-medium whitespace-nowrap">Dues: ₦{c.monthly_social_dues.toLocaleString()}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title">Live Audit Trail & System Events</h3>
              <p className="text-xs text-slate-500 mt-0.5">Realtime Paystack transactions & compliance logs</p>
            </div>
            <button
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              onClick={() => navigate('/admin/audit')}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="audit-stream-row">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-sm">{log.action}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{log.target_name} · {log.reason}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-3xs text-slate-400 font-mono block">{log.timestamp}</span>
                  <div className="text-xs font-semibold text-emerald-600 mt-0.5">{log.actor_name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
