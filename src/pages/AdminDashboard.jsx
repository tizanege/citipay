import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy, Users, CreditCard, Building2, TrendingUp,
  Shield, CheckCircle2, AlertTriangle, Download, ArrowUpRight,
  ShieldCheck, Activity, DollarSign, Sliders, Landmark, ArrowRight,
  Shirt, Calendar, Edit3, Trash2
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const {
    clubs,
    members,
    currentClub,
    adminMetrics,
    auditLogs,
    setRulesConfigModalState,
    leagueSettings,
    setLeagueSettingsModalState,
    islCupTeams,
    setIslCupModalState,
    deleteIslCupTeam
  } = useCitiPay()

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
          <p className="text-xs text-slate-500 mt-1">Cross-club payment ledgers and member eligibility clearance</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold"
            onClick={() => setLeagueSettingsModalState({ isOpen: true })}
          >
            <Shirt size={14} className="text-emerald-600" /> Set Matchday & Prices
          </button>
          <button
            className="btn btn-secondary flex items-center gap-2 text-xs font-semibold"
            onClick={() => setRulesConfigModalState({ isOpen: true })}
          >
            <Sliders size={15} /> Configure League Rules
          </button>
        </div>
      </div>

      {/* Quick Governance Links */}
      <div className="grid-4 mb-6">
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
            <span>{currentClub?.name || 'Ikoyi Sunday League'} Primary Active</span>
            <ArrowRight size={12} className="text-purple-500" />
          </div>
        </div>

        <div className="admin-metric-card cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setLeagueSettingsModalState({ isOpen: true })}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Championship Status</span>
            <div className="admin-metric-icon-box bg-amber-50 text-amber-600">
              <Trophy size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-amber-600 font-heading">
              Gameweek {leagueSettings.current_matchday}
            </div>
            <span className="text-3xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 flex items-center gap-1">
              <Edit3 size={10} /> Edit
            </span>
          </div>
          <div className="text-2xs text-slate-500 mt-1 font-medium flex items-center justify-between">
            <span>Jersey: <strong className="text-slate-800">₦{Number(leagueSettings.jersey_price).toLocaleString()}</strong></span>
            <span>Bib: <strong className="text-slate-800">₦{Number(leagueSettings.bib_price).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Affiliated League Clubs Summary */}
      <div className="card mb-6">
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

      {/* Super Admin Exclusive: ISL Cup Finals 2026 Registered Teams */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="section-title">ISL Cup Finals 2026 — Registered Teams</h3>
              <span className="badge badge-accent text-2xs font-bold">Super Admin Only ({islCupTeams.length}/10)</span>
            </div>
            <p className="text-xs text-slate-500">Submitted tournament team entries, coaching staff, captains, and VIP spectators</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
            onClick={() => setIslCupModalState({ isOpen: true })}
          >
            <Trophy size={14} className="text-amber-500" />
            <span>Open Tournament Modal</span>
          </button>
        </div>

        {islCupTeams.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No teams have registered for ISL Cup Finals 2026 yet (0/10 slots filled).
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Slot</th>
                  <th style={{ width: '220px' }}>Team</th>
                  <th>Coach</th>
                  <th>Captain</th>
                  <th>VIP Spectators</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {islCupTeams.map((team, idx) => (
                  <tr key={team.id || idx}>
                    <td className="font-mono font-bold text-xs text-slate-500">#{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={team.logoUrl || '/crests/sunday-league-fc.svg'}
                            alt={team.teamName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = '/crests/sunday-league-fc.svg'
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 text-xs block truncate">{team.teamName}</span>
                          <span className="text-3xs text-slate-400 font-mono block">₦300,000 Entry</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-semibold text-slate-800">{team.coachName}</td>
                    <td className="text-xs font-semibold text-slate-800">
                      <div>{team.captainName}</div>
                      {team.email && <span className="text-3xs text-slate-400 block font-mono">{team.email}</span>}
                    </td>
                    <td className="text-xs text-slate-600">
                      <div className="text-3xs text-slate-700">1. {team.vipSpectator1 || '—'}</div>
                      <div className="text-3xs text-slate-700">2. {team.vipSpectator2 || '—'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge text-3xs font-extrabold ${team.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {team.paymentStatus === 'Paid' ? '✓ SETTLED' : '⏳ PENDING'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remove team "${team.teamName}" from ISL Cup Finals?`)) {
                            deleteIslCupTeam(team.id)
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove Team Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
