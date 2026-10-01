import { useState } from 'react'
import {
  Trophy, Medal, Target, Award, Users, ChevronRight,
  TrendingUp, Star, Filter, Shield, Sparkles
} from 'lucide-react'
import { mockRankings } from '../lib/mockData'
import { useCitiPay } from '../contexts/CitiPayContext'
import './RankingsPage.css'

export default function RankingsPage() {
  const { currentMember, currentClub, clubs } = useCitiPay()
  const [activeTab, setActiveTab] = useState('players') // 'players' | 'clubs'
  const [positionFilter, setPositionFilter] = useState('all')

  const filteredPlayers = mockRankings.filter(p => {
    return positionFilter === 'all' || p.position === positionFilter
  })

  return (
    <div className="rankings-page-wrapper">
      {/* Header */}
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent text-2xs font-bold flex items-center gap-1">
              <Sparkles size={12} /> Citi Football Championship
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">League Rankings & Standings</h1>
          <p className="page-header-sub">Official 2026/27 Championship Leaderboard & Player Ratings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          className={`tab-pill-btn ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          <Star size={16} /> Player Power Rankings
        </button>
        <button
          className={`tab-pill-btn ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          <Trophy size={16} /> Club Standings Table
        </button>
      </div>

      {/* View 1: Player Power Rankings */}
      {activeTab === 'players' && (
        <div className="card rankings-table-card">
          <div className="rankings-card-header flex justify-between items-center mb-4 pb-4 border-b flex-wrap gap-2">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">Top Rated Players (Season 2026/27)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated based on match ratings, goals, assists, and referee scorecards</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="filter-select text-xs font-semibold"
              >
                <option value="all">All Positions</option>
                <option value="CAM">Attacking Midfielders (CAM)</option>
                <option value="ST">Strikers (ST)</option>
                <option value="LW">Wingers (LW)</option>
                <option value="CB">Defenders (CB)</option>
                <option value="GK">Goalkeepers (GK)</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th style={{ minWidth: '220px' }}>Player</th>
                  <th style={{ minWidth: '180px' }}>Club</th>
                  <th style={{ width: '90px' }}>Position</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Rating</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Goals</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Assists</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Matches</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>MVPs</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const isCurrent = player.name === currentMember.full_name || player.name === 'Michael Esu'
                  return (
                    <tr key={player.rank} className={isCurrent ? 'highlight-user-row' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <div className="rank-badge-wrap">
                          {player.rank === 1 && <span className="podium-badge gold">🥇 1</span>}
                          {player.rank === 2 && <span className="podium-badge silver">🥈 2</span>}
                          {player.rank === 3 && <span className="podium-badge bronze">🥉 3</span>}
                          {player.rank > 3 && <span className="rank-num-regular">#{player.rank}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{player.name}</span>
                          {isCurrent && (
                            <span className="badge badge-accent text-3xs font-bold">You</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600 font-medium">{player.club}</span>
                      </td>
                      <td>
                        <span className="badge badge-secondary text-3xs font-bold">{player.position}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="font-extrabold text-emerald-700 font-mono text-sm">{player.rating}</span>
                      </td>
                      <td style={{ textAlign: 'center' }} className="font-mono text-xs font-semibold">{player.goals}</td>
                      <td style={{ textAlign: 'center' }} className="font-mono text-xs font-semibold">{player.assists}</td>
                      <td style={{ textAlign: 'center' }} className="font-mono text-xs text-slate-500">{player.matches}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-accent text-3xs font-bold">{player.mvp} MVPs</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Club Standings Table */}
      {activeTab === 'clubs' && (
        <div className="card rankings-table-card">
          <div className="rankings-card-header flex justify-between items-center mb-4 pb-4 border-b">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">Championship League Table (2026/27)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live updated after each official matchday round</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Pos</th>
                  <th style={{ minWidth: '240px' }}>Club Name</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>P</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>W</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>D</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>L</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>GD</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((c, idx) => (
                  <tr key={c.id} className={c.id === currentClub.id ? 'highlight-user-row' : ''}>
                    <td style={{ textAlign: 'center' }} className="font-bold text-slate-900 text-xs">
                      #{idx + 1}
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.logo_url}
                          alt={c.name}
                          className="w-6 h-6 rounded-md object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/crests/sunday-league-fc.svg'
                          }}
                        />
                        <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                        {c.id === currentClub.id && (
                          <span className="badge badge-success text-3xs font-bold">Your Club</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-xs">15</td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-xs font-semibold text-emerald-700">12</td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-xs">2</td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-xs text-rose-600">1</td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-xs font-bold text-slate-700">+23</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="font-extrabold text-emerald-800 font-mono text-sm">38</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
