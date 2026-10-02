import { useState } from 'react'
import {
  Users, Search, Filter, ShieldCheck, Download, Sliders,
  Landmark, Send, Shield, AlertTriangle, CheckCircle2, FileText,
  DollarSign, Check, ChevronDown, Printer, UserPlus, KeyRound,
  LayoutGrid, List, Copy, Sparkles
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './ClubDashboard.css'

export default function ClubSquadPage() {
  const {
    currentClub,
    members,
    adminMetrics,
    setManualPaymentModalState,
    setStatusOverrideModalState,
    setRulesConfigModalState,
    setReminderModalState,
    setReceiptModalState,
    setAddPlayerModalState,
    setSendCredentialsModalState
  } = useCitiPay()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'
  const [copiedId, setCopiedId] = useState(null)

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Search and filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.display_id && m.display_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.nickname && m.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.position && m.position.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter

    let matchesPosition = true
    if (positionFilter === 'GK') matchesPosition = m.position === 'GK'
    else if (positionFilter === 'DEF') matchesPosition = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(m.position)
    else if (positionFilter === 'MID') matchesPosition = ['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(m.position)
    else if (positionFilter === 'FWD') matchesPosition = ['ST', 'CF', 'LW', 'RW'].includes(m.position)

    return matchesSearch && matchesStatus && matchesPosition
  })

  return (
    <div className="club-dashboard-wrapper">
      {/* ── 1. Header Banner ─────────────────────────────── */}
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="badge badge-success flex items-center gap-1 font-bold text-xs">
                <ShieldCheck size={12} /> {currentClub.code} Executive Command
              </span>
              <span className="badge badge-accent font-bold text-xs">Gameweek 14 Clearance</span>
            </div>
            <h1 className="club-banner-title">Squad Roster & Matchday Clearance</h1>
            <p className="club-banner-sub flex items-center gap-1 text-xs">
              Manage member eligibility statuses, credentials dispatch, manual payments, and dues
            </p>
          </div>
        </div>

        <div className="club-header-right flex items-center gap-2 flex-wrap">
          <button
            className="btn btn-primary flex items-center gap-1.5 text-xs font-bold py-2.5 px-3.5"
            onClick={() => setAddPlayerModalState({ isOpen: true })}
          >
            <UserPlus size={15} />
            <span>+ Add Member</span>
          </button>

          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-3.5"
            onClick={() => setRulesConfigModalState({ isOpen: true })}
          >
            <Sliders size={15} />
            <span>Configure Rules</span>
          </button>

          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-4"
            onClick={() => setManualPaymentModalState({ isOpen: true, member: members[0] })}
          >
            <Landmark size={15} />
            <span>+ Record Payment</span>
          </button>

          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-3.5"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ─────────────────────────── */}
      <div className="grid-4 mb-6">
        <div className="kpi-mini-card">
          <span className="kpi-mini-lbl">REGISTERED SQUAD</span>
          <div className="kpi-mini-val text-slate-900 font-mono font-extrabold">{adminMetrics.totalMembers}</div>
          <span className="text-3xs text-slate-500 font-medium">Sunday League FC Roster</span>
        </div>

        <div className="kpi-mini-card green-kpi">
          <span className="kpi-mini-lbl text-emerald-800">🟢 MATCHDAY CLEARED</span>
          <div className="kpi-mini-val text-emerald-700 font-mono font-extrabold">{adminMetrics.eligibleGreen}</div>
          <span className="text-3xs text-emerald-800 font-semibold">100% Eligible to Kickoff</span>
        </div>

        <div className="kpi-mini-card yellow-kpi">
          <span className="kpi-mini-lbl text-amber-800">🟡 DUE SOON (GRACE)</span>
          <div className="kpi-mini-val text-amber-600 font-mono font-extrabold">{adminMetrics.dueSoonYellow}</div>
          <span className="text-3xs text-amber-800 font-semibold">In Active 14-Day Grace</span>
        </div>

        <div className="kpi-mini-card red-kpi">
          <span className="kpi-mini-lbl text-rose-800">🔴 INELIGIBLE / OVERDUE</span>
          <div className="kpi-mini-val text-rose-600 font-mono font-extrabold">{adminMetrics.notEligibleRed}</div>
          <span className="text-3xs text-rose-800 font-semibold">Barred from Starting Lineup</span>
        </div>
      </div>

      {/* ── 3. Filters & Quick Selection Controls ─────────── */}
      <div className="squad-filter-card">
        <div className="squad-filter-row">
          {/* Quick status filter chips */}
          <div className="squad-chips-wrap">
            <button
              type="button"
              className={`squad-chip-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <span>All Squad</span>
              <span className="font-mono">({members.length})</span>
            </button>

            <button
              type="button"
              className={`squad-chip-btn ${statusFilter === 'green' ? 'active green' : ''}`}
              onClick={() => setStatusFilter('green')}
            >
              <span>🟢 Cleared</span>
              <span className="font-mono">({adminMetrics.eligibleGreen})</span>
            </button>

            <button
              type="button"
              className={`squad-chip-btn ${statusFilter === 'yellow' ? 'active yellow' : ''}`}
              onClick={() => setStatusFilter('yellow')}
            >
              <span>🟡 Due Soon</span>
              <span className="font-mono">({adminMetrics.dueSoonYellow})</span>
            </button>

            <button
              type="button"
              className={`squad-chip-btn ${statusFilter === 'red' ? 'active red' : ''}`}
              onClick={() => setStatusFilter('red')}
            >
              <span>🔴 Ineligible</span>
              <span className="font-mono">({adminMetrics.notEligibleRed})</span>
            </button>
          </div>

          {/* Search box, Position selector & View Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="squad-search-box">
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search player name, ID (e.g. SL-8K4P2), position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="squad-search-input"
              />
            </div>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="squad-filter-select"
            >
              <option value="all">All Positions</option>
              <option value="GK">Goalkeepers (GK)</option>
              <option value="DEF">Defenders (CB/LB/RB)</option>
              <option value="MID">Midfielders (CM/CAM/CDM)</option>
              <option value="FWD">Forwards (ST/LW/RW)</option>
            </select>

            {/* View Mode Switcher */}
            <div className="squad-view-switcher">
              <button
                type="button"
                className={`squad-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={14} />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                className={`squad-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card View (Mobile Optimized)"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Main Squad Content (Table or Cards View) ─────── */}
      {viewMode === 'table' ? (
        <div className="card-table-wrap">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Player Details</th>
                  <th style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>Member ID</th>
                  <th style={{ minWidth: '115px', textAlign: 'center', whiteSpace: 'nowrap' }}>Clearance</th>
                  <th style={{ minWidth: '135px', textAlign: 'right', whiteSpace: 'nowrap' }}>Outstanding Dues</th>
                  <th style={{ minWidth: '130px', textAlign: 'right', whiteSpace: 'nowrap' }}>Paid to Date</th>
                  <th style={{ minWidth: '145px', whiteSpace: 'nowrap' }}>Last Payment</th>
                  <th style={{ minWidth: '270px', textAlign: 'right', whiteSpace: 'nowrap' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                      No squad members match the selected filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const percentPaid = Math.round((member.membership_paid / (member.membership_fee || 100000)) * 100)
                    const memberIdStr = member.display_id || member.member_id

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        {/* Player Profile & Position */}
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
                                {member.nickname && (
                                  <span className="text-3xs text-slate-400 font-medium truncate max-w-[90px]">
                                    "{member.nickname}"
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Unique Member ID with 1-click copy */}
                        <td>
                          <button
                            type="button"
                            onClick={() => handleCopyId(memberIdStr)}
                            className="squad-id-code hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                            title="Click to copy Member ID"
                          >
                            <span>{memberIdStr}</span>
                            {copiedId === memberIdStr ? (
                              <Check size={10} className="text-emerald-600" />
                            ) : (
                              <Copy size={10} className="text-slate-400 hover:text-slate-700" />
                            )}
                          </button>
                        </td>

                        {/* Clearance Badge */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`squad-clearance-pill ${member.status}`}>
                            {member.status === 'green' && '🟢 Cleared'}
                            {member.status === 'yellow' && '🟡 Due Soon'}
                            {member.status === 'red' && '🔴 Ineligible'}
                          </span>
                        </td>

                        {/* Outstanding Dues */}
                        <td style={{ textAlign: 'right' }}>
                          {member.membership_outstanding > 0 ? (
                            <div>
                              <span className="font-mono text-xs font-extrabold text-rose-600 block">
                                ₦{member.membership_outstanding.toLocaleString()}
                              </span>
                              <span className="text-3xs text-rose-700 font-semibold block">
                                Balance Due
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-mono text-xs font-extrabold text-emerald-700 block">
                                ₦0
                              </span>
                              <span className="text-3xs text-emerald-600 font-semibold block">
                                ✓ Cleared
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Paid to Date */}
                        <td style={{ textAlign: 'right' }}>
                          <span className="font-mono text-xs font-bold text-slate-900 block">
                            ₦{(member.membership_paid || 100000).toLocaleString()}
                          </span>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${percentPaid === 100 ? 'bg-emerald-500' : percentPaid > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${percentPaid}%` }}
                            />
                          </div>
                        </td>

                        {/* Last Payment Date */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-xs text-slate-700 font-semibold block">
                            {member.last_payment_date || 'Sept 28, 2026'}
                          </span>
                          <span className="text-3xs text-slate-400 font-mono">
                            {member.social_dues_status === 'paid' ? 'Social dues settled' : 'Social dues unpaid'}
                          </span>
                        </td>

                        {/* Admin Actions */}
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div className="squad-actions-wrap">
                            <button
                              type="button"
                              className="squad-action-btn btn-login"
                              title="Dispatch or Email Login Credentials"
                              onClick={() => setSendCredentialsModalState({ isOpen: true, member })}
                            >
                              <KeyRound size={12} />
                              <span>Login</span>
                            </button>

                            <button
                              type="button"
                              className="squad-action-btn btn-override"
                              title="Override Eligibility Status with Audit Reason"
                              onClick={() => setStatusOverrideModalState({ isOpen: true, member })}
                            >
                              <Sliders size={12} />
                              <span>Override</span>
                            </button>

                            <button
                              type="button"
                              className="squad-action-btn btn-pay"
                              title="Record Manual Offline Payment"
                              onClick={() => setManualPaymentModalState({ isOpen: true, member })}
                            >
                              <Landmark size={12} />
                              <span>+ Pay</span>
                            </button>

                            {member.status !== 'green' && (
                              <button
                                type="button"
                                className="squad-action-btn btn-remind"
                                title="Send Reminder via WhatsApp / Email"
                                onClick={() => setReminderModalState({ isOpen: true, member, channel: 'whatsapp' })}
                              >
                                <Send size={11} />
                                <span>Remind</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="squad-action-btn"
                              title="View Official Receipt"
                              onClick={() => setReceiptModalState({
                                isOpen: true,
                                transaction: {
                                  receipt_no: `SL-2026-REC-${member.display_id || '001'}`,
                                  reference: member.display_id || member.member_id || 'SL-8K4P2',
                                  member_name: member.full_name,
                                  member_id: member.member_id,
                                  description: 'Championship Season Membership',
                                  amount: member.membership_paid,
                                  date_display: member.last_payment_date || 'September 28, 2026',
                                  status: 'PAID',
                                  club: currentClub.name
                                }
                              })}
                            >
                              <FileText size={11} />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Card Grid View (Mobile / Ergonomic Mode) ────────── */
        <div className="squad-cards-grid">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No squad members match the selected filter or search criteria.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const percentPaid = Math.round((member.membership_paid / (member.membership_fee || 100000)) * 100)
              const memberIdStr = member.display_id || member.member_id

              return (
                <div key={member.id} className="squad-player-card">
                  {/* Top: Avatar, Name, Kit & Clearance */}
                  <div className="squad-card-top">
                    <div className="squad-card-player-info">
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
                          {member.nickname && (
                            <span className="text-3xs text-slate-400 font-medium truncate max-w-[100px]">
                              "{member.nickname}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`squad-clearance-pill ${member.status} text-3xs`}>
                      {member.status === 'green' && '🟢 Cleared'}
                      {member.status === 'yellow' && '🟡 Due Soon'}
                      {member.status === 'red' && '🔴 Ineligible'}
                    </span>
                  </div>

                  {/* ID & Contact Details */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCopyId(memberIdStr)}
                      className="squad-card-id-badge hover:bg-slate-200 transition cursor-pointer"
                      title="Click to copy Member ID"
                    >
                      <span>{memberIdStr}</span>
                      {copiedId === memberIdStr ? (
                        <Check size={11} className="text-emerald-600" />
                      ) : (
                        <Copy size={11} className="text-slate-400" />
                      )}
                    </button>
                    <span className="text-3xs text-slate-500 font-mono">
                      {member.email ? member.email : 'No email registered'}
                    </span>
                  </div>

                  {/* Dues & Progress Box */}
                  <div className="squad-card-dues-box">
                    <div className="squad-card-dues-row">
                      <span className="text-3xs text-slate-500 font-bold uppercase">Outstanding Dues</span>
                      <span className={`font-mono text-xs font-extrabold ${member.membership_outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {member.membership_outstanding > 0 ? `₦${member.membership_outstanding.toLocaleString()}` : '₦0 (Cleared)'}
                      </span>
                    </div>

                    <div className="squad-card-dues-row">
                      <span className="text-3xs text-slate-500 font-bold uppercase">Paid to Date</span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        ₦{(member.membership_paid || 100000).toLocaleString()} ({percentPaid}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${percentPaid === 100 ? 'bg-emerald-500' : percentPaid > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="squad-card-actions">
                    <button
                      type="button"
                      className="squad-action-btn btn-login"
                      onClick={() => setSendCredentialsModalState({ isOpen: true, member })}
                    >
                      <KeyRound size={12} />
                      <span>Email Login</span>
                    </button>

                    <button
                      type="button"
                      className="squad-action-btn btn-pay"
                      onClick={() => setManualPaymentModalState({ isOpen: true, member })}
                    >
                      <Landmark size={12} />
                      <span>+ Record Pay</span>
                    </button>

                    <button
                      type="button"
                      className="squad-action-btn btn-override"
                      onClick={() => setStatusOverrideModalState({ isOpen: true, member })}
                    >
                      <Sliders size={12} />
                      <span>Override</span>
                    </button>

                    {member.status !== 'green' ? (
                      <button
                        type="button"
                        className="squad-action-btn btn-remind"
                        onClick={() => setReminderModalState({ isOpen: true, member, channel: 'whatsapp' })}
                      >
                        <Send size={11} />
                        <span>Remind</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="squad-action-btn"
                        onClick={() => setReceiptModalState({
                          isOpen: true,
                          transaction: {
                            receipt_no: `SL-2026-REC-${member.display_id || '001'}`,
                            reference: member.display_id || member.member_id || 'SL-8K4P2',
                            member_name: member.full_name,
                            member_id: member.member_id,
                            description: 'Championship Season Membership',
                            amount: member.membership_paid,
                            date_display: member.last_payment_date || 'September 28, 2026',
                            status: 'PAID',
                            club: currentClub.name
                          }
                        })}
                      >
                        <FileText size={11} />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
