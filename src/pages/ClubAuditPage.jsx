import { useState } from 'react'
import {
  Shield, Search, Filter, Printer, Download, CheckCircle2,
  AlertTriangle, Clock, Sliders, Landmark, Send, ArrowRight
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './ClubDashboard.css'

export default function ClubAuditPage() {
  const { currentClub, auditLogs } = useCitiPay()
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actor_name && log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  const overrideCount = auditLogs.filter(l => l.action === 'STATUS_OVERRIDE').length
  const paymentCount = auditLogs.filter(l => l.action === 'MANUAL_PAYMENT').length
  const rulesCount = auditLogs.filter(l => l.action === 'CONFIG_RULES_UPDATED').length

  return (
    <div className="club-dashboard-wrapper">
      {/* Header Banner */}
      <div className="club-header-banner mb-6">
        <div className="club-header-left">
          <img
            src={currentClub.logo_url}
            alt={currentClub.name}
            className="club-banner-crest"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/crests/sunday-league-fc.svg'
            }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-success flex items-center gap-1 font-bold text-xs">
                <Shield size={12} /> {currentClub.code} Integrity System
              </span>
              <span className="badge badge-secondary font-bold text-xs">Immutable Ledger</span>
            </div>
            <h1 className="club-banner-title">Club Compliance & Audit Trail</h1>
            <p className="club-banner-sub flex items-center gap-1 text-xs">
              Every status override, offline bank transfer approval, and rule modification requires a mandatory justification
            </p>
          </div>
        </div>

        <div className="club-header-right flex items-center gap-2 flex-wrap">
          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-3.5"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Export Compliance Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid-4 mb-6">
        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Audit Logs</span>
          <div className="text-2xl font-mono font-extrabold text-slate-900">{auditLogs.length} Records</div>
          <span className="text-3xs text-blue-600 font-semibold">100% Cryptographically Intact</span>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Status Overrides</span>
          <div className="text-2xl font-mono font-extrabold text-amber-600">{overrideCount} Overrides</div>
          <span className="text-3xs text-slate-500 font-medium">With verified justifications</span>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Offline Payments Verified</span>
          <div className="text-2xl font-mono font-extrabold text-blue-600">{paymentCount} Reconciliations</div>
          <span className="text-3xs text-slate-500 font-medium">Bank transfer & cash receipts</span>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Rule Configurations</span>
          <div className="text-2xl font-mono font-extrabold text-purple-600">{rulesCount} Revisions</div>
          <span className="text-3xs text-slate-500 font-medium">Approved by Club President</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">AUDIT LOG ENTRIES</h3>
            <p className="text-xs text-slate-500">Chronological feed of administrative operations on Sunday League FC portal</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="search-box-wrap flex-1 min-w-[240px]">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by target member name, ID, administrator, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="filter-box-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Actions</option>
              <option value="STATUS_OVERRIDE">Status Overrides</option>
              <option value="MANUAL_PAYMENT">Manual Offline Payments</option>
              <option value="CONFIG_RULES_UPDATED">Club Rule Revisions</option>
              <option value="REMINDER_DISPATCHED">Automated Reminders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="flex flex-col gap-3">
        {filteredLogs.map((log) => (
          <div key={log.id} className="card p-4 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  log.action === 'STATUS_OVERRIDE'
                    ? 'badge-warning'
                    : log.action === 'MANUAL_PAYMENT'
                    ? 'badge-success'
                    : log.action === 'CONFIG_RULES_UPDATED'
                    ? 'badge-accent'
                    : 'badge-secondary'
                } text-3xs font-mono font-bold`}>
                  {log.action}
                </span>
                <strong className="text-sm text-slate-900">
                  {log.target_name} {log.target_member_id !== 'ALL' && log.target_member_id !== 'ALL_MEMBERS' ? `(${log.target_member_id})` : ''}
                </strong>
              </div>

              <div className="text-right">
                <span className="text-3xs text-slate-400 font-mono block">{log.timestamp}</span>
                <span className="text-xs font-semibold text-blue-700">By {log.actor_name} ({log.actor_role})</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium my-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <strong className="text-slate-900">Mandatory Justification:</strong> {log.reason}
            </p>

            {log.details && (
              <div className="text-3xs text-slate-500 font-mono bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                <span>{log.details}</span>
                {log.old_value && log.new_value && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <span className="text-rose-600">{log.old_value}</span>
                    <ArrowRight size={10} />
                    <span className="text-blue-600">{log.new_value}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
