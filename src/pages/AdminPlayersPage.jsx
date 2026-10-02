import { useState } from 'react'
import {
  Users, Search, Filter, ShieldCheck, Download, Award,
  CheckCircle2, AlertTriangle, Shield, Check, Eye, UserPlus, KeyRound
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminPlayersPage() {
  const { members, clubs, setReceiptModalState, setStatusOverrideModalState, setAddPlayerModalState, setSendCredentialsModalState } = useCitiPay()
  const [searchTerm, setSearchTerm] = useState('')
  const [clubFilter, setClubFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredPlayers = members.filter(player => {
    const matchesSearch =
      player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.display_id && player.display_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (player.position && player.position.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesClub = clubFilter === 'all' || player.club_id === clubFilter
    const matchesStatus = statusFilter === 'all' || player.status === statusFilter

    return matchesSearch && matchesClub && matchesStatus
  })

  const greenCount = members.filter(m => m.status === 'green').length
  const yellowCount = members.filter(m => m.status === 'yellow').length
  const redCount = members.filter(m => m.status === 'red').length

  return (
    <div className="admin-dashboard-wrap">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent font-bold flex items-center gap-1 text-xs">
              <ShieldCheck size={12} /> Citi Football Federation
            </span>
            <span className="badge badge-secondary text-xs font-semibold">Master Player Registry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">League Player Database</h1>
          <p className="text-xs text-slate-500 mt-1">
            Federation licensing, verified Member IDs, multi-club eligibility clearance, and financial status
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button
            className="btn btn-primary flex items-center gap-1.5 text-xs font-bold py-2 px-3.5"
            onClick={() => setAddPlayerModalState({ isOpen: true })}
          >
            <UserPlus size={15} /> + Register Player
          </button>
          <button className="btn btn-secondary flex items-center gap-2 text-xs font-semibold" onClick={() => window.print()}>
            <Download size={15} /> Export Registry
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid-4 mb-6">
        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Federation Players</span>
          <div className="text-2xl font-mono font-extrabold text-slate-900 font-heading">{members.length} Registered</div>
          <span className="text-3xs text-slate-500 font-medium">Across all licensed clubs</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Matchday Cleared (🟢)</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 font-heading">{greenCount} Players</div>
          <span className="text-3xs text-emerald-600 font-medium">100% dues settled</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Due Soon Grace (🟡)</span>
          <div className="text-2xl font-mono font-extrabold text-amber-600 font-heading">{yellowCount} Players</div>
          <span className="text-3xs text-amber-600 font-medium">Active grace period</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Suspended Overdue (🔴)</span>
          <div className="text-2xl font-mono font-extrabold text-rose-600 font-heading">{redCount} Players</div>
          <span className="text-3xs text-rose-600 font-medium">Barred from matchday</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">FEDERATION ROSTER</h3>
            <p className="text-xs text-slate-500">Cross-club registry with real-time clearance status verification</p>
          </div>
          <span className="badge badge-accent font-bold text-xs">{filteredPlayers.length} Active Records</span>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="search-box-wrap flex-1 min-w-[240px]">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search player name, Member ID (e.g. SL-8K4P2), position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="filter-box-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Affiliated Clubs</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div className="filter-box-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Clearance Statuses</option>
              <option value="green">🟢 Green Cleared</option>
              <option value="yellow">🟡 Yellow Due Soon</option>
              <option value="red">🔴 Red Ineligible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="card-table-wrap">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '190px' }}>Player Details</th>
                <th style={{ minWidth: '110px' }}>Member ID</th>
                <th style={{ minWidth: '160px' }}>Affiliated Club</th>
                <th style={{ minWidth: '90px' }}>Position</th>
                <th style={{ minWidth: '100px', textAlign: 'center', whiteSpace: 'nowrap' }}>Clearance</th>
                <th style={{ minWidth: '120px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Settled</th>
                <th style={{ minWidth: '120px', textAlign: 'right', whiteSpace: 'nowrap' }}>Outstanding</th>
                <th style={{ minWidth: '200px', textAlign: 'right', whiteSpace: 'nowrap' }}>Federation Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => {
                const playerClub = clubs.find(c => c.id === player.club_id) || clubs[0]
                return (
                  <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={player.avatar_url}
                          alt={player.full_name}
                          className="table-avatar w-9 h-9 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/avatar-fallback.svg'
                          }}
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{player.full_name}</div>
                          <div className="text-3xs text-slate-500 font-medium">
                            {player.nickname ? `"${player.nickname}" · ` : ''}Jersey #{player.jersey_number || '10'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {player.display_id || player.member_id}
                      </span>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="badge badge-accent font-bold text-3xs">{playerClub.code}</span>
                        <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">{playerClub.name}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-secondary font-mono text-3xs font-semibold">
                        {player.position || 'CAM'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span className={`status-badge-mini ${player.status}`}>
                        {player.status === 'green' && '🟢 Cleared'}
                        {player.status === 'yellow' && '🟡 Due Soon'}
                        {player.status === 'red' && '🔴 Ineligible'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        ₦{(player.membership_paid || 100000).toLocaleString()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span className={`font-mono text-xs font-bold ${player.membership_outstanding > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        ₦{(player.membership_outstanding || 0).toLocaleString()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="btn btn-secondary text-3xs py-1 px-2 font-bold text-emerald-800 bg-emerald-50 border-emerald-200"
                          title="Dispatch Login Credentials via Email"
                          onClick={() => setSendCredentialsModalState({ isOpen: true, member: player })}
                        >
                          <KeyRound size={10} className="inline mr-0.5" />
                          Login
                        </button>
                        <button
                          className="btn btn-secondary text-3xs py-1 px-2 font-bold"
                          title="Override Player Eligibility Clearance"
                          onClick={() => setStatusOverrideModalState({ isOpen: true, member: player })}
                        >
                          Override
                        </button>
                        <button
                          className="btn btn-primary text-3xs py-1 px-2 font-bold"
                          title="View Verified Receipt"
                          onClick={() => setReceiptModalState({
                            isOpen: true,
                            transaction: {
                              receipt_no: `SL-2026-REC-${player.display_id || '001'}`,
                              reference: player.display_id || player.member_id || 'SL-8K4P2',
                              member_name: player.full_name,
                              member_id: player.member_id,
                              description: 'Championship Season Clearance',
                              amount: player.membership_paid || 100000,
                              date_display: player.last_payment_date || 'September 28, 2026',
                              status: 'PAID',
                              club: playerClub.name
                            }
                          })}
                        >
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
