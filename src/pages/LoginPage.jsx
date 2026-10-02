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
              <Trophy size={22} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight font-heading">Citi Football</span>
              <span className="text-emerald-400 font-bold text-xs block uppercase tracking-wider">Club Payment Portal</span>
            </div>
          </div>

          <h1 className="auth-hero-title">
            Secure Digital <span>Club Member Payments.</span>
          </h1>
          <p className="auth-hero-desc">
            The dedicated financial portal for <strong>Sunday League FC</strong> and affiliated Citi Football clubs. Check instant matchday eligibility, settle Paystack installments, and access official club receipts.
          </p>
        </div>

        {/* Live League Statistics Grid */}
        <div className="auth-hero-stats-grid">
          <div className="auth-stat-card">
            <div className="auth-stat-val text-emerald-400">₦2.45M</div>
            <div className="auth-stat-lbl">Fees Collected</div>
          </div>
          <div className="auth-stat-card">
            <div className="auth-stat-val text-white">22 / 30</div>
            <div className="auth-stat-lbl">🟢 Eligible Squad</div>
          </div>
          <div className="auth-stat-card">
            <div className="auth-stat-val text-amber-400">100%</div>
            <div className="auth-stat-lbl">Paystack Secured</div>
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
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles size={12} /> Featured Member
              </div>
              <div className="font-bold text-white text-sm">Michael Esu (CAM #10)</div>
              <div className="text-xs text-slate-400 font-mono">Member ID: {defaultMember?.member_id || 'SL-8K4P2'} · 🟢 ELIGIBLE</div>
            </div>
          </div>
          <span className="badge badge-success font-bold text-xs">Fees Cleared</span>
        </div>

        <div className="auth-hero-footer">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Paystack Direct</span>
          <span>·</span>
          <span>Sunday League FC</span>
          <span>·</span>
          <span>Citi Football Platform</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-success text-2xs font-bold">Phase 1 Payment Portal</span>
            </div>
            <h2 className="auth-form-title">Member Sign In</h2>
            <p className="auth-form-sub">Sign in with your unique Member ID and password or PIN</p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* 2. CLUB SELECTION (Item 2 Requirement) */}
            <div>
              <label className="form-label-portal">
                <Building2 size={13} className="inline mr-1 text-slate-500" />
                SELECT CLUB
              </label>
              <select
                className="form-input-portal font-bold text-slate-900 bg-white"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
              >
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.id === 'club-sunday-league' ? '(Active Primary Club)' : '(Other Club)'}
                  </option>
                ))}
              </select>
              <p className="text-3xs text-slate-500 mt-1">
                Loads official {currentClub.name} branding, subscription rules, and dues.
              </p>
            </div>

            {/* 1. MEMBER LOGIN CREDENTIALS (Item 1 Requirement) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="form-label-portal mb-0">LOGIN IDENTIFIER</label>
                <div className="flex gap-2 text-2xs">
                  <button
                    type="button"
                    className={`font-semibold ${authMode === 'member_id' ? 'text-emerald-600 underline' : 'text-slate-500'}`}
                    onClick={() => setAuthMode('member_id')}
                  >
                    Member ID
                  </button>
                  <button
                    type="button"
                    className={`font-semibold ${authMode === 'phone' ? 'text-emerald-600 underline' : 'text-slate-500'}`}
                    onClick={() => setAuthMode('phone')}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    className={`font-semibold ${authMode === 'email' ? 'text-emerald-600 underline' : 'text-slate-500'}`}
                    onClick={() => setAuthMode('email')}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="form-input-portal pl-9 font-mono font-bold"
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
                <label className="form-label-portal mb-0">PASSWORD OR 4-DIGIT PIN</label>
                <button
                  type="button"
                  className="text-2xs text-emerald-700 font-bold hover:underline"
                  onClick={() => setResetPassModalState({ isOpen: true })}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input-portal pl-9 pr-10"
                  placeholder="Enter your password or PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Security Options: OTP trigger */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                <span>Remember this device</span>
              </label>
              <button
                type="button"
                className="text-2xs text-slate-500 font-semibold flex items-center gap-1 hover:text-emerald-700"
                onClick={() => setOtpModalState({ isOpen: true, memberId })}
              >
                <Smartphone size={12} />
                <span>Login with OTP</span>
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold py-3 text-sm mt-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Verifying Member ID...</span>
              ) : (
                <>
                  <span>SIGN IN TO PORTAL</span>
                  <ArrowRight size={17} />
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
