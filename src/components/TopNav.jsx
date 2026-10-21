import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Search, Bell, CreditCard, ChevronDown, Trophy,
  ShieldCheck, Database
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './TopNav.css'

export default function TopNav() {
  const location = useLocation()
  const {
    currentClub,
    currentMember,
    dbStatus,
    recheckDatabase,
    leagueSettings
  } = useCitiPay()

  const [showNotifications, setShowNotifications] = useState(false)

  const isClubAdmin = location.pathname.startsWith('/club')
  const isAdmin = location.pathname.startsWith('/admin')
  const isPlayer = !isClubAdmin && !isAdmin

  return (
    <header className="topnav-bar">
      {/* Left: Global Contextual Search */}
      <div className="topnav-search-wrap">
        <Search size={16} className="topnav-search-icon" />
        <input
          type="text"
          placeholder={
            isAdmin
              ? 'Search federation players, clubs, Paystack logs, audit...'
              : isClubAdmin
              ? `Search ${currentClub.code} members, receipts, dues...`
              : 'Search receipts, dues, fixtures...'
          }
          className="topnav-search-input text-xs"
        />
        <span className="topnav-kbd-shortcut">⌘K</span>
      </div>

      {/* Right: Actions, Badges & Switchers */}
      <div className="topnav-actions-wrap">
        {/* Database Status Indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-bold border transition-all cursor-pointer"
          title={dbStatus?.message || 'Database status'}
          style={{
            background: dbStatus?.isLive ? '#eff6ff' : '#f8fafc',
            borderColor: dbStatus?.isLive ? '#bfdbfe' : '#e2e8f0',
            color: dbStatus?.isLive ? '#1d4ed8' : '#64748b'
          }}
          onClick={() => recheckDatabase && recheckDatabase()}
        >
          <Database size={11} className={dbStatus?.isLive ? 'text-blue-600' : 'text-slate-400'} />
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: dbStatus?.isLive ? '#2563eb' : dbStatus?.connected ? '#eab308' : '#94a3b8'
            }}
          />
          <span>{dbStatus?.isLive ? 'Supabase Live' : 'Database Ready'}</span>
        </div>

        {/* Club Badge (Static Pill Display) */}
        <div className="topnav-club-card">
          <div className="club-crest-box-mini" style={{ background: currentClub.primary_color || '#2563EB' }}>
            <span>{currentClub.code.slice(0, 3)}</span>
          </div>
          <div className="club-card-details">
            <span className="club-card-code font-bold">{currentClub.code}</span>
            <span className="club-card-rank text-3xs font-semibold text-blue-700">{currentClub.name}</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="topnav-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="topnav-unread-pip" />
          </button>

          {showNotifications && (
            <div className="topnav-dropdown-menu notif-panel">
              <div className="dropdown-title-row">
                <span className="font-extrabold text-xs text-slate-900">
                  {isAdmin ? 'Federation Alerts' : isClubAdmin ? `${currentClub.code} Alerts` : 'Member Notifications'}
                </span>
                <span className="badge badge-accent text-3xs">2 New</span>
              </div>
              <div className="dropdown-scroll-list">
                {isAdmin ? (
                  <>
                    <div className="notif-card-item unread">
                      <div className="notif-dot-marker" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Paystack T+1 Payout Scheduled</div>
                        <div className="text-3xs text-slate-500 mt-0.5">₦2,401,000 net disbursement queued</div>
                      </div>
                    </div>
                    <div className="notif-card-item unread">
                      <div className="notif-dot-marker" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Gameweek {leagueSettings?.current_matchday || 14} Clearance Audit</div>
                        <div className="text-3xs text-slate-500 mt-0.5">Sunday League FC roster 22/30 verified</div>
                      </div>
                    </div>
                  </>
                ) : isClubAdmin ? (
                  <>
                    <div className="notif-card-item unread">
                      <div className="notif-dot-marker" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Gameweek {leagueSettings?.current_matchday || 14} Roster Open</div>
                        <div className="text-3xs text-slate-500 mt-0.5">22 green cleared, 5 in yellow grace period</div>
                      </div>
                    </div>
                    <div className="notif-card-item unread">
                      <div className="notif-dot-marker" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Direct Bank Settlement Recorded</div>
                        <div className="text-3xs text-slate-500 mt-0.5">Manual payment verified by Treasurer</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="notif-card-item unread">
                      <div className="notif-dot-marker" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Gameweek {leagueSettings?.current_matchday || 14} Matchday Squad</div>
                        <div className="text-3xs text-slate-500 mt-0.5">Your status: 🟢 Cleared for kickoff</div>
                      </div>
                    </div>
                    <div className="notif-card-item unread">
                      <div className="notif-dot-marker" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Official Receipt Available</div>
                        <div className="text-3xs text-slate-500 mt-0.5">SL-2026-000124 downloadable in Receipts</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Badge (Static Pill Display) */}
        <div className="topnav-user-profile-btn" style={{ cursor: 'default' }}>
          <div className="user-avatar-ring">
            {isAdmin ? (
              <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xs">
                FA
              </div>
            ) : isClubAdmin ? (
              <img
                src={currentClub?.logo_url || '/crests/sunday-league-fc.svg'}
                alt={currentClub?.name || 'Club'}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/crests/sunday-league-fc.svg'
                }}
              />
            ) : (
              <img
                src={currentMember?.avatar_url || '/avatar-fallback.svg'}
                alt={currentMember?.full_name || 'Member'}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/avatar-fallback.svg'
                }}
              />
            )}
          </div>
          <div className="user-text-column">
            <span className="user-display-name">
              {isAdmin ? 'Federation' : isClubAdmin ? `${currentClub?.code || 'SLFC'} Exec` : (currentMember?.full_name || 'Member').split(' ')[0]}
            </span>
            <span className="user-role-badge font-mono">
              {isAdmin ? 'SUPER ADMIN' : isClubAdmin ? 'CLUB ADMIN' : (currentMember?.member_id || 'SL001')}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
