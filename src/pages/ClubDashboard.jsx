import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, CreditCard, Award, CheckCircle2, Clock,
  ArrowUpRight, AlertCircle, FileText, Plus, ShieldCheck,
  Building2, MapPin, Trophy, ArrowRight, Search, Filter,
  Sliders, Landmark, History, Send, Printer, Shield,
  PhoneCall, Check, X, Edit3, UserCheck, AlertTriangle,
  TrendingUp, DollarSign, UserPlus, KeyRound
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './ClubDashboard.css'

export default function ClubDashboard() {
  const navigate = useNavigate()
  const {
    currentClub,
    members,
    setMembers,
    adminMetrics,
    auditLogs,
    setManualPaymentModalState,
    setStatusOverrideModalState,
    setRulesConfigModalState,
    setReminderModalState,
    setReceiptModalState,
    setAddPlayerModalState,
    setSendCredentialsModalState,
    switchMember
  } = useCitiPay()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Search and filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.display_id && m.display_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.nickname && m.nickname.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Admin action: Suspend/Activate toggle
  const toggleSuspendMember = (member) => {
    const newStatus = member.account_status === 'suspended' ? 'active' : 'suspended'
    setMembers(prev => prev.map(m => {
      if (m.id === member.id) {
        return { ...m, account_status: newStatus }
      }
      return m
    }))
    alert(`Member ${member.full_name} account status updated to ${newStatus.toUpperCase()}`)
  }

  const collectionRate = Math.round((adminMetrics.collectedRevenue / (adminMetrics.expectedRevenue || 1)) * 100)

  return (
    <div className="club-dashboard-wrapper">
      {/* 12. ADMIN DASHBOARD HEADER & FINANCIAL SUMMARY */}
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
                <ShieldCheck size={12} /> Club Executive Command Center
              </span>
              <span className="badge badge-accent font-bold text-xs">{currentClub.code}</span>
            </div>
            <h1 className="club-banner-title">{currentClub.name} Payment Hub</h1>
            <p className="club-banner-sub flex items-center gap-1 text-xs">
              <MapPin size={13} /> {currentClub.stadium} · Lagos, Nigeria
            </p>
          </div>
        </div>

        <div className="club-header-right flex items-center gap-2 flex-wrap">
          {/* Item 5: Configure Rules Trigger */}
          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-3.5"
            onClick={() => setRulesConfigModalState({ isOpen: true })}
          >
            <Sliders size={15} />
            <span>Configure Status Rules</span>
          </button>

          {/* Item 14: Record Manual Payment Trigger */}
          <button
            className="btn btn-primary flex items-center gap-1.5 text-xs font-bold py-2.5 px-4"
            onClick={() => setManualPaymentModalState({ isOpen: true, member: members[0] })}
          >
            <Landmark size={15} />
            <span>+ Add Manual Payment</span>
          </button>
        </div>
      </div>

      {/* Executive Quick Links */}
      <div className="grid-5 mb-6">
        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/club/players')}
        >
          <div className="flex items-center justify-between mb-1">
            <Users size={18} className="text-blue-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Squad & Clearance</div>
          <div className="text-3xs text-slate-500 font-medium">30 Roster Players</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/club/payments')}
        >
          <div className="flex items-center justify-between mb-1">
            <CreditCard size={18} className="text-blue-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Collections Ledger</div>
          <div className="text-3xs text-slate-500 font-medium">₦{(adminMetrics?.collectedRevenue || 0).toLocaleString()} Collected</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/club/receipts')}
        >
          <div className="flex items-center justify-between mb-1">
            <History size={18} className="text-purple-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Club Receipts</div>
          <div className="text-3xs text-slate-500 font-medium">Official Invoices</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/club/audit')}
        >
          <div className="flex items-center justify-between mb-1">
            <Shield size={18} className="text-amber-600" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Audit Trail</div>
          <div className="text-3xs text-slate-500 font-medium">{auditLogs.length} Logged Actions</div>
        </button>

        <button
          className="card p-3 text-left hover:border-slate-300 transition-all cursor-pointer group"
          onClick={() => navigate('/club/profile')}
        >
          <div className="flex items-center justify-between mb-1">
            <Building2 size={18} className="text-slate-700" />
            <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-700 transition-colors" />
          </div>
          <div className="font-bold text-xs text-slate-900">Club Profile & Bank</div>
          <div className="text-3xs text-slate-500 font-medium">{currentClub.code} Settings</div>
        </button>
      </div>

      {/* 12. CLUB PAYMENT OVERVIEW (Executive Financial & Clearance Hub) */}
      <div className="club-overview-card mb-6">
        <div className="club-overview-header">
          <div className="flex items-center gap-3">
            <div className="club-overview-icon-badge">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="section-title text-base font-extrabold text-slate-900">CLUB PAYMENT OVERVIEW</h3>
                <span className="badge badge-accent font-bold text-3xs">Gameweek 14</span>
              </div>
              <p className="text-xs text-slate-500">Live roster clearance & financial collections ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="overview-season-pill">
              <span className="season-dot" /> Season 2026/27
            </span>
          </div>
        </div>

        {/* Member Status Breakdown */}
        <div className="grid-4 mb-5">
          <div className="kpi-mini-card">
            <div className="flex items-center justify-between mb-1">
              <span className="kpi-mini-lbl">TOTAL MEMBERS</span>
              <Users size={14} className="text-slate-400" />
            </div>
            <div className="kpi-mini-val text-slate-900 font-mono font-extrabold">{adminMetrics.totalMembers}</div>
            <span className="text-3xs text-slate-500 font-medium">Registered Squad</span>
          </div>

          <div className="kpi-mini-card green-kpi">
            <div className="flex items-center justify-between mb-1">
              <span className="kpi-mini-lbl text-blue-800">ELIGIBLE</span>
              <CheckCircle2 size={14} className="text-blue-600" />
            </div>
            <div className="kpi-mini-val text-blue-600 font-mono font-extrabold">{adminMetrics.eligibleGreen}</div>
            <span className="text-3xs text-blue-800 font-semibold">Cleared for Matchday</span>
          </div>

          <div className="kpi-mini-card yellow-kpi">
            <div className="flex items-center justify-between mb-1">
              <span className="kpi-mini-lbl text-amber-800">PAYMENT DUE SOON</span>
              <Clock size={14} className="text-amber-500" />
            </div>
            <div className="kpi-mini-val text-amber-600 font-mono font-extrabold">{adminMetrics.dueSoonYellow}</div>
            <span className="text-3xs text-amber-800 font-semibold">Grace Period Active</span>
          </div>

          <div className="kpi-mini-card red-kpi">
            <div className="flex items-center justify-between mb-1">
              <span className="kpi-mini-lbl text-rose-800">NOT ELIGIBLE</span>
              <AlertTriangle size={14} className="text-rose-500" />
            </div>
            <div className="kpi-mini-val text-rose-600 font-mono font-extrabold">{adminMetrics.notEligibleRed}</div>
            <span className="text-3xs text-rose-800 font-semibold">Suspended / Overdue</span>
          </div>
        </div>

        {/* Executive Financial Summary Banner */}
        <div className="fin-executive-banner">
          <div className="fin-stats-row">
            {/* Expected Revenue */}
            <div className="fin-stat-card">
              <div className="fin-stat-header">
                <span className="fin-stat-title">EXPECTED REVENUE:</span>
                <span className="fin-stat-tag blue">30 Members</span>
              </div>
              <div className="fin-stat-value expected-val">
                ₦{(adminMetrics?.expectedRevenue || 0).toLocaleString()}
              </div>
              <span className="fin-stat-sub text-slate-400">@ ₦100,000 / member season dues</span>
            </div>

            <div className="fin-v-divider" />

            {/* Collected Revenue */}
            <div className="fin-stat-card">
              <div className="fin-stat-header">
                <span className="fin-stat-title">COLLECTED REVENUE:</span>
                <span className="fin-stat-tag green">{collectionRate}% Rate</span>
              </div>
              <div className="fin-stat-value collected-val">
                ₦{(adminMetrics?.collectedRevenue || 0).toLocaleString()}
              </div>
              <span className="fin-stat-sub text-blue-400 font-medium">Reconciled via Paystack & Bank</span>
            </div>

            <div className="fin-v-divider" />

            {/* Outstanding Balance */}
            <div className="fin-stat-card">
              <div className="fin-stat-header">
                <span className="fin-stat-title">OUTSTANDING BALANCE:</span>
                <span className="fin-stat-tag rose">{(adminMetrics?.dueSoonYellow || 0) + (adminMetrics?.notEligibleRed || 0)} Unsettled</span>
              </div>
              <div className="fin-stat-value outstanding-val">
                ₦{(adminMetrics?.outstandingBalance || 0).toLocaleString()}
              </div>
              <span className="fin-stat-sub text-rose-300 font-medium">Arrears & installment balances</span>
            </div>
          </div>

          {/* Collection Progress Bar */}
          <div className="fin-progress-section">
            <div className="flex justify-between items-center text-3xs text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
              <span>Season Dues Collection Progress</span>
              <span className="text-blue-400 font-mono">{collectionRate}% of Season Target Achieved</span>
            </div>
            <div className="fin-progress-bar-bg">
              <div
                className="fin-progress-bar-fill"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 11. ADMIN MEMBER MANAGEMENT (Searchable Member Database) */}
      <div className="card member-table-card mb-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">ADMIN MEMBER MANAGEMENT</h3>
            <p className="text-xs text-slate-500">Searchable member database with 10 administrative functions</p>
          </div>

          {/* Search & Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="search-box-wrap min-w-[220px]">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search name, ID (e.g. SL-8K4P2)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="filter-box-wrap">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold"
              >
                <option value="all">All Statuses ({members.length})</option>
                <option value="green">🔵 Cleared Eligible ({adminMetrics.eligibleGreen})</option>
                <option value="yellow">🟡 Yellow Due Soon ({adminMetrics.dueSoonYellow})</option>
                <option value="red">🔴 Red Ineligible ({adminMetrics.notEligibleRed})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Member Table (Item 11 Display Specification) */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Member</th>
                <th style={{ minWidth: '100px' }}>ID</th>
                <th style={{ minWidth: '90px', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: '130px', textAlign: 'right' }}>Outstanding</th>
                <th style={{ minWidth: '135px', whiteSpace: 'nowrap' }}>Last Payment</th>
                <th style={{ minWidth: '270px', textAlign: 'right', whiteSpace: 'nowrap' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td>
                    <div className="squad-player-cell">
                      <div className="squad-avatar-box">
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="squad-avatar-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/avatar-fallback.svg'
                          }}
                        />
                        <span className={`squad-avatar-pip ${member.status}`} />
                      </div>
                      <div>
                        <div className="squad-player-name">{member.full_name}</div>
                        <div className="squad-meta-line">
                          <span className="squad-jersey-pill">#{member.jersey_number || '10'}</span>
                          <span className="squad-pos-pill">{member.position || 'CAM'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="font-mono text-xs font-bold text-slate-800" style={{ whiteSpace: 'nowrap' }}>
                      {member.display_id || member.member_id}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-pill ${member.status}`}>
                      <span className="status-dot" />
                      {member.status === 'green' ? 'Cleared' : member.status === 'yellow' ? 'Due Soon' : 'Ineligible'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span className={`font-mono text-xs font-bold ${(member.membership_outstanding || 0) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      ₦{(member.membership_outstanding || 0).toLocaleString()}
                    </span>
                  </td>

                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs text-slate-700 font-medium">{member.last_payment_date || 'Sept 28'}</span>
                  </td>

                  {/* Admin Actions */}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Email Login Details */}
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold text-emerald-800 bg-emerald-50 border-emerald-200"
                        title="Dispatch Login Credentials via Email"
                        onClick={() => setSendCredentialsModalState({ isOpen: true, member })}
                      >
                        <KeyRound size={11} className="inline mr-1" />
                        Login
                      </button>

                      {/* Change Status with Reason (Item 6) */}
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold"
                        title="Change Eligibility Status with Audit Reason"
                        onClick={() => setStatusOverrideModalState({ isOpen: true, member })}
                      >
                        Change Status
                      </button>

                      {/* Record Manual Payment (Item 14) */}
                      <button
                        className="btn btn-primary text-3xs py-1 px-2 font-bold"
                        title="Record Manual Bank Transfer / Cash Payment"
                        onClick={() => setManualPaymentModalState({ isOpen: true, member })}
                      >
                        + Payment
                      </button>

                      {/* Send Reminder (Item 13) */}
                      {member.status !== 'green' && (
                        <button
                          className="btn btn-secondary text-3xs py-1 px-2 font-bold text-amber-700 bg-amber-50 border-amber-200"
                          title="Send Email / WhatsApp Reminder"
                          onClick={() => setReminderModalState({ isOpen: true, member, channel: 'whatsapp' })}
                        >
                          <Send size={10} className="inline mr-1" />
                          Remind
                        </button>
                      )}

                      {/* View Receipt / View Dossier */}
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold"
                        title="View Official Receipt"
                        onClick={() => setReceiptModalState({
                          isOpen: true,
                          transaction: {
                            receipt_no: `SL-2026-REC-${member.display_id || '001'}`,
                            reference: member.display_id || member.member_id || 'SL-8K4P2',
                            member_name: member.full_name,
                            member_id: member.member_id,
                            description: 'Membership fee clearance',
                            amount: member.membership_paid,
                            date_display: member.last_payment_date || 'September 28, 2026',
                            status: 'PAID',
                            club: currentClub.name
                          }
                        })}
                      >
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. LIVE AUDIT LOGS (Item 6 & 19 Requirement) */}
      <div className="card">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">MANDATORY AUDIT TRAIL</h3>
            <p className="text-xs text-slate-500">Every manual status change, offline payment, and rule update is recorded</p>
          </div>
          <span className="badge badge-success font-bold text-xs flex items-center gap-1">
            <Shield size={12} /> Immutable Ledger
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-secondary text-3xs font-mono font-bold">{log.action}</span>
                  <strong className="text-xs text-slate-900">{log.target_name} ({log.target_member_id})</strong>
                </div>
                <span className="text-3xs text-slate-400 font-mono">{log.timestamp}</span>
              </div>

              <p className="text-xs text-slate-700 font-medium my-1">{log.reason}</p>
              
              {log.details && (
                <div className="text-3xs text-slate-500 font-mono mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                  {log.details}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
