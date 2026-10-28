import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, Shield, Lock, User, Building2, KeyRound, Eye, EyeOff,
  ArrowRight, Sparkles, CheckCircle2, Trophy, Smartphone,
  HelpCircle, RefreshCw
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import IslCupModal from '../components/modals/IslCupModal'
import PasswordResetModal from '../components/modals/PasswordResetModal'
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
    loginSession,
    setOtpModalState,
    setResetPassModalState,
    setIslCupModalState
  } = useCitiPay()

  const navigate = useNavigate()

  // Form states (Item 1 & 2: Member ID / Phone / Email + Password / PIN)
  const defaultMember = members[0]
  const [authMode, setAuthMode] = useState('member_id') // 'member_id' | 'email' | 'phone'
  const [memberId, setMemberId] = useState('')
  const [password, setPassword] = useState('')
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
      const lowerInput = cleanInput.toLowerCase()
      const cleanNoDash = cleanInput.toUpperCase().replace(/[^A-Z0-9]/g, '')
      const cleanPass = password.trim()

      // 1. Default Super Admin Credentials
      const isSuperAdminId =
        lowerInput === 'admin@citileague.com' ||
        lowerInput === 'superadmin@citileague.com' ||
        cleanNoDash === 'SUPERADMIN'
      if (isSuperAdminId) {
        if (cleanPass === 'Admin@2026' || cleanPass === '1234' || cleanPass === '••••••••') {
          loginSession({
            role: 'super_admin',
            clubId: '11111111-1111-1111-1111-111111111111'
          })
          navigate('/admin/dashboard')
          return
        }
        setError('Invalid Super Admin password.')
        return
      }

      // 2. Default Ikoyi Sunday League (Club Admin) Credentials
      const isIslAdminId =
        lowerInput === 'isl@citileague.com' ||
        lowerInput === 'ikoyi@citileague.com' ||
        cleanNoDash === 'ISLADMIN' ||
        cleanNoDash === 'ISL'
      if (isIslAdminId) {
        if (cleanPass === 'Isl@2026' || cleanPass === '1234' || cleanPass === '••••••••') {
          loginSession({
            role: 'club_admin',
            clubId: '11111111-1111-1111-1111-111111111111'
          })
          navigate('/club/dashboard')
          return
        }
        setError('Invalid Ikoyi Sunday League Admin password.')
        return
      }

      // 3. Player / Member Credentials Lookup
      const found = members.find(m => {
        const mNorm = (m.member_id || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
        const dNorm = (m.display_id || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
        return (
          mNorm === cleanNoDash ||
          dNorm === cleanNoDash ||
          (m.email && m.email.toLowerCase() === lowerInput) ||
          (m.phone && m.phone.replace(/[^0-9]/g, '') === cleanInput.replace(/[^0-9]/g, ''))
        )
      })

      if (found) {
        switchMember(found.id)
        loginSession({
          role: 'member',
          memberId: found.id,
          clubId: found.club_id || '11111111-1111-1111-1111-111111111111'
        })
        navigate('/dashboard')
        return
      }

      // Allow default player login if SL-8K4P2 is used even before Supabase finishes hydrating
      if (cleanNoDash === 'SL8K4P2' || lowerInput === 'player@citileague.com') {
        const fallbackId = defaultMember?.id || 'mem-001'
        switchMember(fallbackId)
        loginSession({
          role: 'member',
          memberId: fallbackId,
          clubId: '11111111-1111-1111-1111-111111111111'
        })
        navigate('/dashboard')
        return
      }

      setError('Invalid login credentials. Please use a valid Member ID, Ikoyi Sunday League Admin login, or Super Admin login.')
    }, 400)
  }

  // Quick Default Login Helper
  const handleQuickDefaultLogin = (preset) => {
    setError('')
    if (preset === 'isl_admin') {
      setMemberId('isl@citileague.com')
      setPassword('Isl@2026')
      loginSession({
        role: 'club_admin',
        clubId: '11111111-1111-1111-1111-111111111111'
      })
      navigate('/club/dashboard')
    } else if (preset === 'super_admin') {
      setMemberId('admin@citileague.com')
      setPassword('Admin@2026')
      loginSession({
        role: 'super_admin',
        clubId: '11111111-1111-1111-1111-111111111111'
      })
      navigate('/admin/dashboard')
    } else if (preset === 'player') {
      const target = defaultMember || members[0]
      setMemberId(target?.member_id || 'SL-8K4P2')
      setPassword('1234')
      if (target?.id) switchMember(target.id)
      loginSession({
        role: 'member',
        memberId: target?.id || 'mem-001',
        clubId: target?.club_id || '11111111-1111-1111-1111-111111111111'
      })
      navigate('/dashboard')
    }
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

        {/* Highlight Card: Ukpongote Esu Spotlight */}
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
              <div className="font-semibold text-white text-sm">Ukpongote Esu (CAM #10)</div>
              <div className="text-xs text-slate-400 font-mono">ID: {defaultMember?.member_id || 'SL-8K4P2'} · Cleared</div>
            </div>
          </div>
          <span className="badge badge-success text-xs">Eligible</span>
        </div>

        <div className="auth-hero-footer">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Paystack Secured</span>
          <span>·</span>
          <span>Ikoyi Sunday League</span>
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
            {/* 1. MEMBER LOGIN CREDENTIALS (Item 1 Requirement) */}
            <div>
              <label className="form-label-portal">Member ID, Email or Phone</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="form-input-portal pl-9 font-mono"
                  placeholder={`e.g. ${defaultMember?.member_id || 'SL-8K4P2'} or email`}
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

          {/* ISL Cup Finals 2026 Advert Card (Replaces quick access personas) */}
          <div
            className="isl-login-advert-card"
            onClick={() => setIslCupModalState({ isOpen: true })}
            role="button"
            tabIndex={0}
            title="Click to view full ISL Cup details & register team"
          >
            <div className="isl-login-advert-header">
              <div className="isl-login-advert-tag">OFFICIAL CUP FINALS</div>
              <span className="isl-login-advert-pool">₦2.8M PRIZE POOL</span>
            </div>

            <div className="isl-login-advert-body">
              <div className="isl-login-trophy-box">
                <Trophy size={24} />
              </div>
              <div className="isl-login-advert-info">
                <h3 className="isl-login-advert-title">THE ISL CUP FINALS 2026</h3>
                <p className="isl-login-advert-subtitle">
                  16 Teams · 2 Winners · Lagos Preparatory School, Ikoyi
                </p>
                <div className="isl-login-advert-meta">
                  <span>📅 Nov 22 & 29 (7:20 AM)</span>
                  <span>·</span>
                  <span>Reg: ₦300,000 (2 VIPs Incl.)</span>
                </div>
              </div>
            </div>

            <div className="isl-login-advert-footer">
              <div className="isl-login-prize">
                <span className="isl-login-prize-lbl">GRAND PRIZE</span>
                <span className="isl-login-prize-amt">₦2,000,000</span>
              </div>
              <button
                type="button"
                className="isl-login-advert-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setIslCupModalState({ isOpen: true })
                }}
              >
                <span>View & Register</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals available on Login Screen */}
      <IslCupModal />
      <PasswordResetModal />
    </div>
  )
}
