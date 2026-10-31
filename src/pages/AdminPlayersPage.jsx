import { useState } from 'react'
import {
  Users, Search, Filter, ShieldCheck, Download, Award,
  CheckCircle2, AlertTriangle, Shield, Check, Eye, UserPlus, KeyRound, Edit3, Trash2, Landmark
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import Pagination from '../components/Pagination'
import './AdminDashboard.css'

export default function AdminPlayersPage() {
  const {
    members,
    clubs,
    setReceiptModalState,
    setStatusOverrideModalState,
    setAddPlayerModalState,
    setSendCredentialsModalState,
    setEditPlayerModalState,
    setDeletePlayerModalState,
    setManualPaymentModalState
  } = useCitiPay()
  const [searchTerm, setSearchTerm] = useState('')
  const [clubFilter, setClubFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  const totalItems = filteredPlayers.length
  const paginatedPlayers = filteredPlayers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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

        <div className="flex gap-2.5 flex-wrap items-center">
          {/* View Mode Switcher */}
          <div className="view-mode-toggle-bar">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>Table</span>
            </button>
          </div>

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

      {/* Players View: Grid View vs Table View */}
      {viewMode === 'grid' ? (
        <div className="flex flex-col gap-4">
          <div className="admin-players-grid">
            {filteredPlayers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                No players match your search or filter criteria.
              </div>
            ) : (
              paginatedPlayers.map((player) => {
                const playerClub = clubs.find(c => c.id === player.club_id) || clubs[0]
                const isGreen = player.status === 'green'
                const isYellow = player.status === 'yellow'
                const isRed = player.status === 'red'

                return (
                  <div key={player.id} className="player-grid-card">
                    {/* Card Top: Avatar, Name & Clearance Pill */}
                    <div className="player-grid-header">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatar_url}
                          alt={player.full_name}
                          className="player-grid-avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/avatar-fallback.svg'
                          }}
                        />
                        <div>
                          <h4 className="player-grid-name">{player.full_name}</h4>
                          <p className="player-grid-sub">
                            {player.nickname && player.nickname.trim().toLowerCase() !== (player.full_name || '').trim().toLowerCase() ? `"${player.nickname}" · ` : ''}Jersey #{player.jersey_number || '10'}
                          </p>
                        </div>
                      </div>

                      <span className={`status-badge-mini ${player.status}`}>
                        {isGreen && '🟢 Cleared'}
                        {isYellow && '🟡 Due Soon'}
                        {isRed && '🔴 Ineligible'}
                      </span>
                    </div>

                    {/* Card Middle: Identity & Metrics */}
                    <div className="player-grid-meta-row">
                      <div className="player-grid-meta-item">
                        <span className="player-meta-lbl">Member ID</span>
                        <span className="player-meta-val font-mono">{player.display_id || player.member_id}</span>
                      </div>
                      <div className="player-grid-meta-item">
                        <span className="player-meta-lbl">Club</span>
                        <span className="player-club-pill" style={{ background: playerClub.primary_color || '#2563EB' }}>
                          {playerClub.code}
                        </span>
                      </div>
                      <div className="player-grid-meta-item">
                        <span className="player-meta-lbl">Position</span>
                        <span className="player-meta-val font-semibold">{player.position || 'CAM'}</span>
                      </div>
                    </div>

                    {/* Financial Biomarkers Box (Settled vs Outstanding) */}
                    <div className="player-grid-finance-box">
                      <div className="finance-col">
                        <span className="finance-lbl">Total Settled</span>
                        <span className="finance-val text-emerald-700 font-mono">
                          ₦{Number(player.membership_paid ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="finance-col text-right">
                        <span className="finance-lbl">Outstanding</span>
                        <span className={`finance-val font-mono ${player.membership_outstanding > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          ₦{Number(player.membership_outstanding ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions Bottom Bar */}
                    <div className="player-grid-actions">
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold rounded-lg text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                        title="Record Offline Manual Payment"
                        onClick={() => setManualPaymentModalState({ isOpen: true, member: player })}
                      >
                        <Landmark size={11} className="inline mr-1 text-indigo-600" />
                        + Pay
                      </button>
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold rounded-lg"
                        title="Edit Player Details"
                        onClick={() => setEditPlayerModalState({ isOpen: true, member: player })}
                      >
                        <Edit3 size={11} className="inline mr-1 text-blue-600" />
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold text-emerald-800 bg-emerald-50 border-emerald-200 rounded-lg"
                        title="Dispatch Login Credentials via Email"
                        onClick={() => setSendCredentialsModalState({ isOpen: true, member: player })}
                      >
                        <KeyRound size={11} className="inline mr-1" />
                        Login
                      </button>
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold rounded-lg"
                        title="Override Player Eligibility Clearance"
                        onClick={() => setStatusOverrideModalState({ isOpen: true, member: player })}
                      >
                        Override
                      </button>
                      <button
                        className="btn btn-secondary text-3xs py-1 px-2 font-bold rounded-lg text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                        title="Remove Player from Registry"
                        onClick={() => setDeletePlayerModalState({ isOpen: true, member: player })}
                      >
                        <Trash2 size={11} className="inline mr-1 text-rose-600" />
                        Delete
                      </button>
                      <button
                        className="btn btn-primary text-3xs py-1 px-2.5 font-bold rounded-lg"
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
                  </div>
                )
              })
            )}
          </div>
          <div className="card p-0 overflow-hidden">
            <Pagination
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setCurrentPage(1)
              }}
              itemName="players"
            />
          </div>
        </div>
      ) : (
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
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                      No players match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedPlayers.map((player) => {
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
                                {player.nickname && player.nickname.trim().toLowerCase() !== (player.full_name || '').trim().toLowerCase() ? `"${player.nickname}" · ` : ''}Jersey #{player.jersey_number || '10'}
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
                            ₦{Number(player.membership_paid ?? 0).toLocaleString()}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span className={`font-mono text-xs font-bold ${player.membership_outstanding > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            ₦{Number(player.membership_outstanding ?? 0).toLocaleString()}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="btn btn-secondary text-3xs py-1 px-2 font-bold text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                              title="Record Offline Manual Payment"
                              onClick={() => setManualPaymentModalState({ isOpen: true, member: player })}
                            >
                              <Landmark size={10} className="inline mr-0.5 text-indigo-600" />
                              + Pay
                            </button>
                            <button
                              className="btn btn-secondary text-3xs py-1 px-2 font-bold"
                              title="Edit Player Details"
                              onClick={() => setEditPlayerModalState({ isOpen: true, member: player })}
                            >
                              <Edit3 size={10} className="inline mr-0.5 text-blue-600" />
                              Edit
                            </button>
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
                              className="btn btn-secondary text-3xs py-1 px-2 font-bold text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100"
                              title="Remove Player from Registry"
                              onClick={() => setDeletePlayerModalState({ isOpen: true, member: player })}
                            >
                              <Trash2 size={10} className="inline mr-0.5 text-rose-600" />
                              Delete
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
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
            itemName="players"
          />
        </div>
      )}
    </div>
  )
}
