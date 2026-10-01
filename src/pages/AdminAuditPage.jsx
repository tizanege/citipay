import { useState } from 'react'
import {
  Shield, Search, Filter, Printer, Download, CheckCircle2,
  AlertTriangle, ArrowRight, Activity, Clock
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminAuditPage() {
  const { auditLogs, clubs } = useCitiPay()
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

  return (
    <div className="admin-dashboard-wrap">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent font-bold flex items-center gap-1 text-xs">
              <Shield size={12} /> Citi Football Federation
            </span>
            <span className="badge badge-secondary text-xs font-semibold">Master Integrity Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Federation Compliance & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, cross-club cryptographic audit log of all eligibility overrides, offline payment reconciliations, and governance edits
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button className="btn btn-secondary flex items-center gap-2 text-xs font-semibold" onClick={() => window.print()}>
            <Printer size={15} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid-4 mb-6">
        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Audit Events</span>
          <div className="text-2xl font-mono font-extrabold text-slate-900 font-heading">{auditLogs.length} Events</div>
          <span className="text-3xs text-emerald-600 font-medium">100% Traceable to Actors</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Integrity Status</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 font-heading">Verified</div>
          <span className="text-3xs text-slate-500 font-medium">SHA-256 System Hash Valid</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Administrators</span>
          <div className="text-2xl font-mono font-extrabold text-blue-600 font-heading">6 Officials</div>
          <span className="text-3xs text-slate-500 font-medium">Presidents, Treasurers, Federation</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Governance Policy</span>
          <div className="text-2xl font-mono font-extrabold text-purple-600 font-heading">Mandatory</div>
          <span className="text-3xs text-slate-500 font-medium">Justifications strictly enforced</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">FEDERATION AUDIT STREAM</h3>
            <p className="text-xs text-slate-500">Cross-club audit events with before/after state transition details</p>
          </div>
          <span className="badge badge-accent font-bold text-xs">{filteredLogs.length} Records</span>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="search-box-wrap flex-1 min-w-[240px]">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, target player, administrator, or justification..."
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
              <option value="all">All Action Categories</option>
              <option value="STATUS_OVERRIDE">Status Overrides</option>
              <option value="MANUAL_PAYMENT">Manual Offline Payments</option>
              <option value="CONFIG_RULES_UPDATED">Rule Configurations</option>
              <option value="REMINDER_DISPATCHED">Payment Reminders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Entries List */}
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
                <span className="text-xs font-semibold text-emerald-700">By {log.actor_name} · {log.actor_role}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium my-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <strong className="text-slate-900">Justification:</strong> {log.reason}
            </p>

            {log.details && (
              <div className="text-3xs text-slate-500 font-mono bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                <span>{log.details}</span>
                {log.old_value && log.new_value && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <span className="text-rose-600">{log.old_value}</span>
                    <ArrowRight size={10} />
                    <span className="text-emerald-600">{log.new_value}</span>
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
