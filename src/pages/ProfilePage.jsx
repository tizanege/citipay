import { useState } from 'react'
import {
  User, Shield, CreditCard, Mail, Phone, Calendar,
  Trophy, Sparkles, CheckCircle2, QrCode, Download,
  ArrowRight, ShieldCheck, MapPin, Award, Layers, Smartphone
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { currentMember, currentClub, transactions, setPaymentModalState } = useCitiPay()

  const memberTxs = transactions.filter(
    tx => tx.member_id === currentMember.member_id || tx.member_name === currentMember.full_name
  )

  return (
    <div className="profile-page-wrapper">
      {/* Top Profile Hero Card */}
      <div className="card profile-hero-card mb-6">
        <div className="profile-hero-inner">
          <div className="profile-avatar-box">
            <img
              src={currentMember.avatar_url}
              alt={currentMember.full_name}
              className="profile-avatar-lg"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/avatar-fallback.svg'
              }}
            />
            <span className={`avatar-status-pip ${currentMember.status}`} />
          </div>

          <div className="profile-hero-details">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="badge badge-success text-xs font-bold font-mono">
                {currentMember.member_id}
              </span>
              <span className="badge badge-accent text-xs font-bold">
                {currentClub.name}
              </span>
              <span className={`badge ${currentMember.status === 'green' ? 'badge-success' : currentMember.status === 'yellow' ? 'badge-warning' : 'badge-danger'} text-xs font-bold`}>
                {currentMember.status === 'green' ? '🟢 ELIGIBLE' : currentMember.status === 'yellow' ? '🟡 DUE SOON' : '🔴 NOT ELIGIBLE'}
              </span>
            </div>

            <h1 className="profile-full-name">{currentMember.full_name}</h1>
            <p className="profile-nickname-line">
              {currentMember.nickname ? `Nickname: "${currentMember.nickname}" · ` : ''}Jersey #{currentMember.jersey_number || '10'} · {currentMember.position || 'CAM'}
            </p>

            <div className="profile-meta-chips mt-3 flex items-center gap-4 flex-wrap text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><Calendar size={13} /> Joined {currentMember.date_joined || 'Sept 2024'}</span>
              <span className="flex items-center gap-1.5"><Mail size={13} /> {currentMember.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={13} /> {currentMember.phone}</span>
            </div>
          </div>

          <div className="profile-hero-right">
            <div className="player-rating-badge">
              <span className="rating-num font-mono">{currentMember.rating || 85}</span>
              <span className="rating-lbl">OVR</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10. MEMBER PROFILE DETAILS & 17. FUTURE CITI FOOTBALL ROADMAP */}
      <div className="grid-2 gap-6 mb-6">
        {/* Left: Official Club Member Dossier (Item 10) */}
        <div className="card">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">OFFICIAL MEMBER DOSSIER</h3>
              <p className="text-xs text-slate-500">Verified club credentials and registration status</p>
            </div>
            <span className="badge badge-success text-2xs font-bold">Verified</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="dossier-row">
              <span className="dossier-label">Unique Member ID:</span>
              <span className="dossier-value font-mono font-bold text-emerald-800">{currentMember.member_id}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Full Name:</span>
              <span className="dossier-value font-bold text-slate-900">{currentMember.full_name}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Club Nickname:</span>
              <span className="dossier-value font-semibold text-slate-800">{currentMember.nickname || 'N/A'}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Jersey Number:</span>
              <span className="dossier-value font-mono font-bold text-slate-900">#{currentMember.jersey_number || '10'}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Primary Position:</span>
              <span className="dossier-value font-semibold text-slate-800">{currentMember.position || 'CAM'}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Date Joined:</span>
              <span className="dossier-value text-slate-800">{currentMember.date_joined || 'September 2024'}</span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Membership Status:</span>
              <span className={`dossier-value font-bold ${currentMember.status === 'green' ? 'text-emerald-700' : 'text-rose-600'}`}>
                {currentMember.status === 'green' ? '🟢 Active & Eligible' : currentMember.status === 'yellow' ? '🟡 Payment Due Soon' : '🔴 Inactive per rules'}
              </span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Subscription Status:</span>
              <span className="dossier-value font-semibold text-slate-800">
                {currentMember.membership_outstanding === 0 ? 'Full Season Cleared (₦100,000)' : `Installment Plan (₦${currentMember.membership_paid.toLocaleString()} Paid)`}
              </span>
            </div>
            <div className="dossier-row">
              <span className="dossier-label">Monthly Social Dues:</span>
              <span className={`dossier-value font-bold ${currentMember.social_dues_status === 'paid' ? 'text-emerald-700' : 'text-rose-600'}`}>
                {currentMember.social_dues_status === 'paid' ? '🟢 Current (September Paid)' : '🔴 Outstanding'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 17 & 18 FUTURE CITI FOOTBALL DIGITAL ECOSYSTEM (Items 17 & 18) */}
        <div className="card">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">FUTURE CITI FOOTBALL INTEGRATION</h3>
              <p className="text-xs text-slate-500">Universal Member ID across digital platforms</p>
            </div>
            <span className="badge badge-accent text-2xs font-bold">Roadmap</span>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl mb-4 font-mono text-xs leading-relaxed border border-slate-800">
            <div className="text-emerald-400 font-bold mb-2">Universal Member ID: {currentMember.member_id}</div>
            <div className="text-slate-300">
              Payment Portal <br />
              ↓ Citi Football Website <br />
              ↓ Citi Football Mobile App <br />
              ↓ Live League Statistics <br />
              ↓ Gameweek Availability <br />
              ↓ Fantasy League & Merchandise
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            This database is structured around your unique Member ID (<strong>{currentMember.member_id}</strong>) to prevent duplicate accounts when the full Citi Football mobile app launches.
          </p>
        </div>
      </div>
    </div>
  )
}
