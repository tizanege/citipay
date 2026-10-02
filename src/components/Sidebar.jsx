import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, CreditCard, History, TrendingUp,
  Trophy, Calendar, Bell, Settings, Users, ClipboardList,
  Building2, FileText, BarChart3, Shield, LogOut, Menu, X,
  ChevronLeft, Sparkles, ShieldCheck, Sliders, Landmark
} from 'lucide-react'
import { useState } from 'react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './Sidebar.css'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentMember, currentClub } = useCitiPay()

  const isClubAdmin = location.pathname.startsWith('/club')
  const isAdmin = location.pathname.startsWith('/admin')
  const isPlayer = !isClubAdmin && !isAdmin

  // 1. Member Access Level Navigation
  const playerNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Member Overview', badge: 'Active' },
    { to: '/payments', icon: CreditCard, label: 'Pay Fees & Dues', badge: 'Paystack' },
    { to: '/payment-history', icon: History, label: 'Official Receipts' },
    { to: '/profile', icon: User, label: 'Member Profile' }
  ]

  // 2. Club Executive Access Level Navigation
  const clubNav = [
    { to: '/club/dashboard', icon: LayoutDashboard, label: 'Executive Hub' },
    { to: '/club/players', icon: Users, label: 'Squad & Eligibility' },
    { to: '/club/payments', icon: CreditCard, label: 'Collections Ledger' },
    { to: '/club/receipts', icon: History, label: 'Club Receipts' },
    { to: '/club/audit', icon: Shield, label: 'Club Audit Trail' },
    { to: '/club/profile', icon: Building2, label: 'Club Profile & Rules' }
  ]

  // 3. Super Admin / Federation Access Level Navigation
  const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Federation Command' },
    { to: '/admin/clubs', icon: Building2, label: 'Affiliated Clubs' },
    { to: '/admin/players', icon: Users, label: 'League Player Registry' },
    { to: '/admin/payments', icon: CreditCard, label: 'Paystack Revenue' },
    { to: '/admin/audit', icon: Shield, label: 'Master Audit Trail' },
    { to: '/admin/settings', icon: Sliders, label: 'Governance & Rules' }
  ]

  const activeNav = isAdmin ? adminNav : isClubAdmin ? clubNav : playerNav

  const handleUserCardClick = () => {
    if (isAdmin) navigate('/admin/settings')
    else if (isClubAdmin) navigate('/club/profile')
    else navigate('/profile')
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="brand-text">
            <span className="brand-name">Citi Football</span>
            <span className="brand-tagline">Club Payment Portal</span>
          </div>
        </div>

        {/* Portal Context Banner */}
        <div className="portal-pill-container">
          <div className={`portal-tag-pill ${isAdmin ? 'admin-pill' : isClubAdmin ? 'club-pill' : 'player-pill'}`}>
            <span className="portal-dot" />
            <span>{isAdmin ? 'Super Admin Mode' : isClubAdmin ? `${currentClub.code} Admin Hub` : 'Member Portal'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {isAdmin ? 'Federation Navigation' : isClubAdmin ? `${currentClub.code} Navigation` : 'Member Navigation'}
          </div>
          {activeNav.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/club/dashboard' || to === '/admin/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{label}</span>
              {badge && <span className="nav-pill-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Sign Out */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card" onClick={handleUserCardClick} title="View Profile / Settings">
            {isAdmin ? (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
            ) : isClubAdmin ? (
              <img
                src={currentClub?.logo_url || '/crests/sunday-league-fc.svg'}
                alt={currentClub?.name || 'Club'}
                className="user-avatar-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/crests/sunday-league-fc.svg'
                }}
              />
            ) : (
              <img
                src={currentMember?.avatar_url || '/avatar-fallback.svg'}
                alt={currentMember?.full_name || 'Member'}
                className="user-avatar-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/avatar-fallback.svg'
                }}
              />
            )}

            <div className="user-card-info">
              <div className="user-card-name">
                {isAdmin ? 'Federation Admin' : isClubAdmin ? `${currentClub?.name || 'Club'} Admin` : (currentMember?.full_name || 'Member')}
              </div>
              <div className="user-card-sub font-mono">
                {isAdmin ? 'SUPER ADMIN · HQ' : isClubAdmin ? `${currentClub?.code || 'SLFC'} · Executive` : `${currentMember?.member_id || 'SL001'} · #${currentMember?.jersey_number || '10'}`}
              </div>
            </div>
          </div>

          <button className="sidebar-logout-btn" onClick={() => navigate('/login')}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
