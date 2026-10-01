import { useState } from 'react'
import {
  TrendingUp, Award, Flame, Target, Zap, Activity,
  ChevronRight, Calendar, Star, Shield, CheckCircle2,
  Sparkles, Trophy, BarChart3
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './PerformancePage.css'

export default function PerformancePage() {
  const { currentMember, currentClub } = useCitiPay()

  const attributes = [
    { name: 'Pace & Acceleration', score: 88, color: '#2563EB', desc: 'Top speed & sprint burst' },
    { name: 'Shooting & Finishing', score: 82, color: '#1D4ED8', desc: 'Shot power & accuracy' },
    { name: 'Passing & Vision', score: 86, color: '#7C3AED', desc: 'Key passes & crossing' },
    { name: 'Dribbling & Agility', score: 89, color: '#DB2777', desc: 'Ball control & flair' },
    { name: 'Defensive Workrate', score: 55, color: '#D97706', desc: 'Interceptions & pressing' },
    { name: 'Physicality & Stamina', score: 76, color: '#3B82F6', desc: 'Strength & 90min endurance' }
  ]

  const recentMatches = [
    { opponent: 'Surulere Strikers FC', result: 'W 3 - 1', isWin: true, rating: 8.8, goals: 2, assists: 1, date: '21 Sep 2026', mvp: true, round: 'Matchday 15' },
    { opponent: 'Ikeja United Athletic', result: 'W 2 - 0', isWin: true, rating: 7.9, goals: 1, assists: 1, date: '14 Sep 2026', mvp: false, round: 'Matchday 14' },
    { opponent: 'Lekki City Stars', result: 'D 1 - 1', isDraw: true, rating: 8.2, goals: 0, assists: 1, date: '07 Sep 2026', mvp: true, round: 'Matchday 13' },
    { opponent: 'Ikoyi Royals SC', result: 'L 1 - 2', isLoss: true, rating: 7.1, goals: 1, assists: 0, date: '30 Aug 2026', mvp: false, round: 'Matchday 12' }
  ]

  return (
    <div className="perf-page">
      {/* Header Banner */}
      <div className="perf-header-banner mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge badge-accent font-bold flex items-center gap-1 text-2xs">
              <Sparkles size={12} /> Certified Matchday Statistics
            </span>
            <span className="badge badge-secondary text-2xs">Member: {currentMember.member_id}</span>
          </div>
          <h1 className="perf-main-title">{currentMember.full_name} — Performance Analytics</h1>
          <p className="perf-sub-title">Official {currentClub.name} technical attribute matrix and match history</p>
        </div>
        <div>
          <span className="badge badge-success text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-sm">
            <Flame size={16} className="text-emerald-700" /> Current Form: Excellent
          </span>
        </div>
      </div>

      {/* 4 KPI Top Cards: Row Grid */}
      <div className="grid-4 mb-6">
        <div className="card kpi-box">
          <div className="flex justify-between items-start mb-2">
            <span className="kpi-label">Overall Rating</span>
            <div className="kpi-icon-pill bg-emerald-50 text-emerald-600">
              <Trophy size={17} />
            </div>
          </div>
          <div className="kpi-value text-slate-900">
            {currentMember.rating || 85} <span className="kpi-badge-pill">Top 5%</span>
          </div>
          <span className="text-xs text-muted mt-2 block font-medium">{currentClub.name}</span>
        </div>

        <div className="card kpi-box">
          <div className="flex justify-between items-start mb-2">
            <span className="kpi-label">Goal Contributions</span>
            <div className="kpi-icon-pill bg-blue-50 text-blue-600">
              <Zap size={17} />
            </div>
          </div>
          <div className="kpi-value text-emerald-600">
            16 <span className="text-sm font-semibold text-slate-500">G+A</span>
          </div>
          <span className="text-xs text-muted mt-2 block font-medium">9 Goals · 7 Assists in 14 Matches</span>
        </div>

        <div className="card kpi-box">
          <div className="flex justify-between items-start mb-2">
            <span className="kpi-label">Man of Match Honors</span>
            <div className="kpi-icon-pill bg-amber-50 text-amber-600">
              <Award size={17} />
            </div>
          </div>
          <div className="kpi-value text-amber-600">
            4 <span className="text-sm font-semibold text-slate-500">MVPs</span>
          </div>
          <span className="text-xs text-muted mt-2 block font-medium">Top rated playmaker in league</span>
        </div>

        <div className="card kpi-box">
          <div className="flex justify-between items-start mb-2">
            <span className="kpi-label">Passing Accuracy</span>
            <div className="kpi-icon-pill bg-purple-50 text-purple-600">
              <BarChart3 size={17} />
            </div>
          </div>
          <div className="kpi-value text-blue-600">
            87.4%
          </div>
          <span className="text-xs text-muted mt-2 block font-medium">34 Key Chances Created</span>
        </div>
      </div>

      {/* Attributes Hex Grid */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">Technical Attribute Matrix</h3>
            <p className="text-xs text-slate-500">Evaluated on a 1-99 rating scale across premier matchdays</p>
          </div>
          <span className="badge badge-accent text-2xs font-bold">EA FC Radar Model</span>
        </div>

        <div className="grid-3 gap-4">
          {attributes.map((attr, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-xs text-slate-900">{attr.name}</span>
                <span className="font-mono font-extrabold text-sm text-slate-900">{attr.score}</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${attr.score}%`, background: attr.color }}
                />
              </div>
              <span className="text-3xs text-slate-500 mt-1 block">{attr.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
