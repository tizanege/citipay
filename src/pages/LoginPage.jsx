import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, Shield, Lock, User, Building2, KeyRound, Eye, EyeOff,
  ArrowRight, Sparkles, CheckCircle2, Trophy, Smartphone,
  HelpCircle, RefreshCw
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AuthPages.css'

export default function LoginPage() {
  const {
    clubs,
    selectedClubId,
    setSelectedClubId,
    currentClub,
    switchMember,
    members,
    setCurrentRole,
    setOtpModalState,
    setResetPassModalState
  } = useCitiPay()

  const navigate = useNavigate()

  // Form states (Item 1 & 2: Member ID / Phone / Email + Password / PIN)
  const defaultMember = members[0]
  const [authMode, setAuthMode] = useState('member_id') // 'member_id' | 'email' | 'phone'
  const [memberId, setMemberId] = useState(defaultMember?.member_id || 'SL-8K4P2')
  const [password, setPassword] = useState('••••••••')
  const [pin, setPin] = useState('1234')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      const cleanInput = memberId.trim()
      const cleanNoDash = cleanInput.toUpperCase().replace(/[^A-Z0-9]/g, '')

      // Robust match checking member_id (random/non-serial), display_id, or email
      const found = members.find(m => {
        const mNorm = (m.member_id || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
        const dNorm = (m.display_id || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
        return (
          mNorm === cleanNoDash ||
          dNorm === cleanNoDash ||
          (m.email && m.email.toLowerCase() === cleanInput.toLowerCase()) ||
          (m.phone && m.phone.replace(/[^0-9]/g, '') === cleanInput.replace(/[^0-9]/g, ''))
        )
      })
      
      if (found) {
        switchMember(found.id)
        setCurrentRole('member')
      } else {
        switchMember(defaultMember?.id || 'mem-001') // Default to Michael Esu
        setCurrentRole('member')
      }
      navigate('/dashboard')
    }, 600)
  }

  // Quick Demo Account Switcher
  const quickDemoLogin = (targetMemberId, role = 'member', targetRoute = '/dashboard') => {
    switchMember(targetMemberId)
    setCurrentRole(role)
    navigate(targetRoute)
  }

  return (
    <div className="auth-split-wrapper">
      {/* Left Athletic Showcase Panel */}
      <div className="auth-hero-panel">
        <div className="auth-hero-top">
          <div className="auth-hero-brand">
            <div className="auth-hero-logo-box">
              <Trophy size={18} />
            </div>
            <div>
              <span className="font-semibold text-white text-base tracking-tight font-heading">CitiPay</span>
              <span className="text-slate-400 text-xs block">Football Financial Platform</span>
            </div>
          </div>

          <h1 className="auth-hero-title">
            Streamlined payments <span>for modern clubs.</span>
          </h1>
          <p className="auth-hero-desc">
            Direct player registration, matchday eligibility tracking, and instant Paystack settlements for affiliated clubs.
          </p>
        </div>

        {/* Live League Statistics Grid */}
        <div className="auth-hero-stats-grid">
          <div className="auth-stat-card">
            <div className="auth-stat-val text-white">₦2.45M</div>
            <div className="auth-stat-lbl">Fees Settled</div>
          </div>
          <div className="auth-stat-card">
            <div className="auth-stat-val text-white">22 / 30</div>
            <div className="auth-stat-lbl">Eligible Squad</div>
          </div>
          <div className="auth-stat-card">
            <div className="auth-stat-val text-white">100%</div>
            <div className="auth-stat-lbl">Paystack Verified</div>
          </div>
        </div>

        {/* Highlight Card: Michael Esu Spotlight */}
        <div className="auth-spotlight-box">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Player Spotlight"
              className="spotlight-avatar"
            />
            <div>
              <div className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <Sparkles size={11} /> Featured Player
              </div>
              <div className="font-semibold text-white text-sm">Michael Esu (CAM #10)</div>
              <div className="text-xs text-slate-400 font-mono">ID: {defaultMember?.member_id || 'SL-8K4P2'} · Cleared</div>
            </div>
          </div>
          <span className="badge badge-success text-xs">Eligible</span>
        </div>

        <div className="auth-hero-footer">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Paystack Secured</span>
          <span>·</span>
          <span>Sunday League FC</span>
          <span>·</span>
          <span>Citi Football</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <span className="badge badge-secondary text-2xs font-medium mb-2">CitiPay Portal</span>
            <h2 className="auth-form-title">Sign In</h2>
            <p className="auth-form-sub">Sign in with your Member ID, Phone, or Email</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            {/* 2. CLUB SELECTION (Item 2 Requirement) */}
            <div>
              <label className="form-label-portal">
                Club Organization
              </label>
              <select
                className="form-input-portal font-medium text-slate-900 bg-white"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
              >
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.id === 'club-sunday-league' ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 1. MEMBER LOGIN CREDENTIALS (Item 1 Requirement) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="form-label-portal mb-0">Identifier</label>
                <div className="flex gap-1.5 text-2xs">
                  <button
                    type="button"
                    className={`px-1.5 py-0.5 rounded ${authMode === 'member_id' ? 'bg-slate-200 text-slate-900 font-medium' : 'text-slate-500'}`}
                    onClick={() => setAuthMode('member_id')}
                  >
                    Member ID
                  </button>
                  <button
                    type="button"
                    className={`px-1.5 py-0.5 rounded ${authMode === 'phone' ? 'bg-slate-200 text-slate-900 font-medium' : 'text-slate-500'}`}
                    onClick={() => setAuthMode('phone')}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    className={`px-1.5 py-0.5 rounded ${authMode === 'email' ? 'bg-slate-200 text-slate-900 font-medium' : 'text-slate-500'}`}
                    onClick={() => setAuthMode('email')}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="form-input-portal pl-9 font-mono"
                  placeholder={authMode === 'member_id' ? `e.g. ${defaultMember?.member_id || 'SL-8K4P2'}` : authMode === 'phone' ? '+234 802 345 6789' : 'michael.esu@sundayleague.ng'}
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password / PIN Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="form-label-portal mb-0">Password / PIN</label>
                <button
                  type="button"
                  className="text-2xs text-slate-500 font-medium hover:text-slate-900"
                  onClick={() => setResetPassModalState({ isOpen: true })}
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input-portal pl-9 pr-10"
                  placeholder="Enter password or PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Security Options */}
            <div className="flex items-center justify-between py-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-2xs text-slate-500 font-medium flex items-center gap-1 hover:text-slate-900"
                onClick={() => setOtpModalState({ isOpen: true, memberId })}
              >
                <Smartphone size={12} />
                <span>OTP Login</span>
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm mt-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Personas Selector */}
          <div className="demo-accounts-box">
            <div className="demo-section-label">
              <span>⚡</span>
              <span>1-CLICK QUICK ACCESS PERSONAS</span>
            </div>

            {/* Group 1: Players & Eligibility */}
            <div className="demo-group-label">
              <span>MEMBER ELIGIBILITY TIERS</span>
            </div>
            <div className="demo-players-grid">
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickDemoLogin('mem-001', 'member', '/dashboard')}
                title="Michael Esu - Cleared for matchday"
              >
                <div className="demo-pill-icon green">
                  <span className="status-dot-sm green" />
                </div>
                <div className="demo-pill-content">
                  <div className="demo-pill-title">Michael Esu</div>
                  <span className="demo-pill-badge green">🟢 ELIGIBLE</span>
                </div>
              </button>

              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickDemoLogin('mem-002', 'member', '/dashboard')}
                title="Player B - ₦10k payment due soon"
              >
                <div className="demo-pill-icon yellow">
                  <span className="status-dot-sm yellow" />
                </div>
                <div className="demo-pill-content">
                  <div className="demo-pill-title">Player B</div>
                  <span className="demo-pill-badge yellow">🟡 DUE SOON</span>
                </div>
              </button>

              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => quickDemoLogin('mem-003', 'member', '/dashboard')}
                title="Player C - Suspended / Overdue balance"
              >
                <div className="demo-pill-icon red">
                  <span className="status-dot-sm red" />
                </div>
                <div className="demo-pill-content">
                  <div className="demo-pill-title">Player C</div>
                  <span className="demo-pill-badge red">🔴 OVERDUE</span>
                </div>
              </button>
            </div>

            {/* Group 2: Executive & Federation Portals */}
            <div className="demo-group-label">
              <span>ADMINISTRATIVE PORTALS</span>
            </div>
            <div className="demo-admin-grid">
              <button
                type="button"
                className="demo-pill-btn admin-demo"
                onClick={() => quickDemoLogin('mem-001', 'president', '/club/dashboard')}
                title="Club Executive Hub - Roster, Overrides & Collections"
              >
                <div className="demo-pill-icon club">
                  <ShieldCheck size={15} />
                </div>
                <div className="demo-pill-content">
                  <div className="demo-pill-title">Club President</div>
                  <span className="demo-pill-badge club">Club Executive Hub</span>
                </div>
              </button>

              <button
                type="button"
                className="demo-pill-btn admin-demo"
                onClick={() => quickDemoLogin('mem-001', 'super_admin', '/admin/dashboard')}
                title="Federation Super Admin - Governance, Paystack & All Clubs"
              >
                <div className="demo-pill-icon admin">
                  <Shield size={15} />
                </div>
                <div className="demo-pill-content">
                  <div className="demo-pill-title">Super Admin</div>
                  <span className="demo-pill-badge admin">Federation Command</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
