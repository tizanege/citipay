import { useState } from 'react'
import {
  Building2, ShieldCheck, Plus, Search, Filter, MapPin,
  Users, DollarSign, Award, ArrowUpRight, CheckCircle2, Sliders, ExternalLink
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminClubsPage() {
  const { clubs, members, transactions, setRulesConfigModalState, setSelectedClubId } = useCitiPay()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.stadium.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInspectClub = (clubId) => {
    setSelectedClubId(clubId)
    alert(`Active club context switched to ${clubId}. You can manage this club in the executive portal.`)
  }

  const handleOpenClubRules = (clubId) => {
    setSelectedClubId(clubId)
    setRulesConfigModalState({ isOpen: true })
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
            <span className="badge badge-secondary text-xs font-semibold">Club Licensing Authority</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Affiliated Clubs Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Licensed football clubs, registered home grounds, fee structures, and financial compliance
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button
            className="btn btn-primary flex items-center gap-2 text-xs font-semibold"
            onClick={() => alert('New Club Licensing Application modal will open. Required documentation: CAC Registration, Home Ground lease agreement, and Federation charter.')}
          >
            <Plus size={15} /> License New Club
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid-4 mb-6">
        <div className="admin-metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Licensed Clubs</span>
            <div className="admin-metric-icon-box bg-purple-50 text-purple-600">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 font-heading">{clubs.length} Clubs</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">100% Federation Compliant</div>
        </div>

        <div className="admin-metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Squads</span>
            <div className="admin-metric-icon-box bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-heading">{members.length} Players</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">Active Member IDs Issued</div>
        </div>

        <div className="admin-metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Standard Season Dues</span>
            <div className="admin-metric-icon-box bg-emerald-50 text-emerald-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-heading">₦100,000</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Cap per player per season</div>
        </div>

        <div className="admin-metric-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Championship League</span>
            <div className="admin-metric-icon-box bg-amber-50 text-amber-600">
              <Award size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-heading">2026/27</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Gameweek 14 In Progress</div>
        </div>
      </div>

      {/* Clubs Filter & Search Bar */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent font-bold text-xs py-1.5 px-3">
              All Licensed Clubs ({clubs.length})
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Active Citi Football Federation Charter
            </span>
          </div>

          <div className="search-box-wrap min-w-[280px]">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search club name, code (SLFC), venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* Clubs Grid Cards */}
      <div className="grid-3 mb-6">
        {filteredClubs.map(club => {
          const clubMembersCount = members.filter(m => m.club_id === club.id).length || (club.id === 'club-sunday-league' ? 30 : 24)
          return (
            <div key={club.id} className="federation-club-card">
              <div>
                {/* Top: Crest & Compliance Pill */}
                <div className="club-card-top">
                  <div className="club-crest-container">
                    <img
                      src={club.logo_url}
                      alt={club.name}
                      className="club-crest-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/crests/sunday-league-fc.svg'
                      }}
                    />
                  </div>

                  <span className="club-compliance-pill">
                    <span className="club-compliance-dot" /> LICENSED
                  </span>
                </div>

                {/* Club Identity */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="club-card-title">{club.name}</h3>
                    <span className="badge badge-accent font-mono text-3xs font-extrabold">{club.code}</span>
                  </div>
                  <p className="club-card-sub">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{club.stadium} · {club.city}</span>
                  </p>
                </div>

                {/* Specifications Panel */}
                <div className="club-specs-panel">
                  <div className="club-spec-row">
                    <span className="text-slate-500 font-medium">Registered Squad:</span>
                    <strong className="text-slate-900 font-mono font-extrabold">{clubMembersCount} Players</strong>
                  </div>
                  <div className="club-spec-row">
                    <span className="text-slate-500 font-medium">Standard Season Dues:</span>
                    <strong className="text-emerald-700 font-mono font-extrabold">₦{club.membership_fee.toLocaleString()}</strong>
                  </div>
                  <div className="club-spec-row">
                    <span className="text-slate-500 font-medium">Monthly Social Dues:</span>
                    <strong className="text-slate-900 font-mono font-extrabold">₦{club.monthly_social_dues.toLocaleString()}/mo</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="club-card-actions">
                <button
                  className="btn btn-secondary flex-1 text-xs py-2 font-bold flex items-center justify-center gap-1.5"
                  onClick={() => handleOpenClubRules(club.id)}
                  title="Configure club dues, membership fees and eligibility rules"
                >
                  <Sliders size={13} />
                  <span>Rules & Fees</span>
                </button>
                <button
                  className="btn btn-primary flex-1 text-xs py-2 font-bold flex items-center justify-center gap-1.5"
                  onClick={() => handleInspectClub(club.id)}
                >
                  <ExternalLink size={13} />
                  <span>Select Club</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
