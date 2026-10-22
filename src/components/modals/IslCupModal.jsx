import { useState, useRef } from 'react'
import {
  X, Trophy, Calendar, MapPin, Clock, DollarSign,
  Upload, Users, Shield, CheckCircle2, AlertCircle, Plus,
  Camera, Sparkles, ChevronRight, ArrowRight
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './IslCupModal.css'

export default function IslCupModal() {
  const { islCupModalState, setIslCupModalState, islCupTeams, registerIslCupTeam } = useCitiPay()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'register' | 'teams'
  const [formData, setFormData] = useState({
    teamName: '',
    coachName: '',
    captainName: '',
    vipSpectator1: '',
    vipSpectator2: '',
    logoUrl: '/crests/sunday-league-fc.svg'
  })
  const [uploadedLogo, setUploadedLogo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setError] = useState('')
  const fileInputRef = useRef(null)

  if (!islCupModalState?.isOpen) return null

  const handleClose = () => {
    setIslCupModalState({ isOpen: false })
    // Mark as dismissed in session storage so it doesn't harass on every subpage click
    sessionStorage.setItem('isl_cup_dismissed', 'true')
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedLogo(reader.result)
        setFormData(prev => ({ ...prev, logoUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.teamName.trim()) {
      setError('Please provide your Team Name.')
      return
    }
    if (!formData.coachName.trim()) {
      setError('Please provide your Coach Name.')
      return
    }
    if (!formData.captainName.trim()) {
      setError('Please provide your Team Captain Name.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      try {
        registerIslCupTeam({
          teamName: formData.teamName.trim(),
          coachName: formData.coachName.trim(),
          captainName: formData.captainName.trim(),
          vipSpectator1: formData.vipSpectator1.trim(),
          vipSpectator2: formData.vipSpectator2.trim(),
          logoUrl: formData.logoUrl || '/crests/sunday-league-fc.svg'
        })

        setIsSubmitting(false)
        setSuccessMessage(`Team "${formData.teamName}" successfully registered for ISL Cup Finals 2026!`)
        setTimeout(() => {
          setActiveTab('teams')
          setSuccessMessage('')
          setFormData({
            teamName: '',
            coachName: '',
            captainName: '',
            vipSpectator1: '',
            vipSpectator2: '',
            logoUrl: '/crests/sunday-league-fc.svg'
          })
          setUploadedLogo(null)
        }, 1200)
      } catch (err) {
        setIsSubmitting(false)
        setError(err.message || 'Registration failed. Maximum slots may be filled.')
      }
    }, 600)
  }

  // Ensure 10 visual slots (columns)
  const totalSlots = 10
  const slots = Array.from({ length: totalSlots }, (_, idx) => {
    return islCupTeams[idx] || null
  })

  return (
    <div className="isl-backdrop" onClick={handleClose}>
      <div className="isl-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <div className="isl-modal-topbar">
          <div className="flex items-center gap-2">
            <span className="isl-cup-badge">
              <Sparkles size={13} /> OFFICIAL TOURNAMENT ANNOUNCEMENT
            </span>
            <span className="isl-cup-subbadge">2026 CHAMPIONSHIP</span>
          </div>

          <button
            type="button"
            className="isl-close-btn"
            onClick={handleClose}
            aria-label="Close Announcement"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="isl-nav-tabs">
          <button
            type="button"
            className={`isl-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Trophy size={14} /> Tournament Announcement
          </button>
          <button
            type="button"
            className={`isl-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <Plus size={14} /> Register Your Team (₦300k)
          </button>
          <button
            type="button"
            className={`isl-tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <Users size={14} /> Registered Teams Showcase ({islCupTeams.length}/10)
          </button>
        </div>

        {/* TAB 1: OVERVIEW & POSTER */}
        {activeTab === 'overview' && (
          <div className="isl-content-split">
            {/* Left: Tournament Poster Visual */}
            <div className="isl-poster-col">
              <div className="isl-poster-wrap">
                <img
                  src="/isl-cup-finals-2026.jpg"
                  alt="ISL Cup Finals 2026 Poster"
                  className="isl-poster-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/crests/sunday-league-fc.svg'
                  }}
                />
              </div>
            </div>

            {/* Right: Rich Tournament Details */}
            <div className="isl-details-col">
              <div className="isl-headline-block">
                <div className="isl-hero-pre">IKOYI SUNDAY LEAGUE PRESENTS</div>
                <h1 className="isl-hero-title">THE ISL CUP FINALS 2026 IS HERE! ⚽🔥</h1>
                <p className="isl-hero-sub">
                  16 teams. 2 winners, and a <strong>₦2.8 million</strong> prize pool up for grabs!
                </p>
              </div>

              {/* Prize Pool Cards */}
              <div className="isl-prizes-grid">
                <div className="isl-prize-card gold">
                  <div className="isl-prize-medal">🥇</div>
                  <div>
                    <div className="isl-prize-lbl">GRAND WINNER</div>
                    <div className="isl-prize-amount font-mono">₦2,000,000</div>
                  </div>
                </div>

                <div className="isl-prize-card silver">
                  <div className="isl-prize-medal">🥈</div>
                  <div>
                    <div className="isl-prize-lbl">RUNNER-UP</div>
                    <div className="isl-prize-amount font-mono">₦800,000</div>
                  </div>
                </div>
              </div>

              {/* Key Event Details */}
              <div className="isl-info-card">
                <div className="isl-info-row">
                  <div className="isl-info-icon"><Calendar size={15} /></div>
                  <div>
                    <span className="isl-info-lbl">MATCH DATES</span>
                    <strong className="isl-info-val">November 22nd & 29th, 2026</strong>
                  </div>
                </div>

                <div className="isl-info-row">
                  <div className="isl-info-icon"><Clock size={15} /></div>
                  <div>
                    <span className="isl-info-lbl">KICK-OFF TIME</span>
                    <strong className="isl-info-val">7:20 AM (WAT)</strong>
                  </div>
                </div>

                <div className="isl-info-row">
                  <div className="isl-info-icon"><MapPin size={15} /></div>
                  <div>
                    <span className="isl-info-lbl">TOURNAMENT VENUE</span>
                    <strong className="isl-info-val">Lagos Preparatory School, Glover Road, Ikoyi</strong>
                  </div>
                </div>

                <div className="isl-info-row highlight">
                  <div className="isl-info-icon"><DollarSign size={15} /></div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <span className="isl-info-lbl">REGISTRATION FEE</span>
                      <strong className="isl-info-val text-emerald-700 font-mono text-base">₦300,000</strong>
                    </div>
                    <span className="badge badge-success text-2xs font-bold">Includes 2 VIP Spectators</span>
                  </div>
                </div>
              </div>

              {/* Registration Requirements Note */}
              <div className="isl-spec-badge-box">
                <div className="isl-spec-pill">✓ Team Name & Logo</div>
                <div className="isl-spec-pill">✓ Coach Name</div>
                <div className="isl-spec-pill">✓ Team Captain</div>
                <div className="isl-spec-pill">✓ 2 VIP Spectator Badges</div>
              </div>

              {/* CTA Action Bar */}
              <div className="isl-action-bar">
                <button
                  type="button"
                  className="isl-btn-primary"
                  onClick={() => setActiveTab('register')}
                >
                  <span>Register Your Team Now</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  className="isl-btn-secondary"
                  onClick={() => setActiveTab('teams')}
                >
                  <Users size={15} />
                  <span>View Registered Teams ({islCupTeams.length}/10)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER YOUR TEAM FORM */}
        {activeTab === 'register' && (
          <div className="isl-register-wrap">
            <div className="isl-register-header">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Register Team for ISL Cup Finals 2026</h2>
              <p className="text-xs text-slate-500">
                Official team entry sheet · Registration Fee: <strong className="text-emerald-700 font-mono">₦300,000</strong> · 16 Teams tournament format
              </p>
            </div>

            {successMessage && (
              <div className="isl-success-alert">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="isl-error-alert">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="isl-form-grid">
              {/* Left Form: Team Info & Crest Upload */}
              <div className="isl-form-section">
                <h3 className="isl-section-title">1. Team Identity & Crest</h3>

                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="isl-crest-upload-box"
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to upload team crest"
                  >
                    {uploadedLogo ? (
                      <img src={uploadedLogo} alt="Team Crest" className="isl-crest-uploaded-img" />
                    ) : (
                      <div className="isl-crest-placeholder">
                        <Camera size={20} className="text-slate-400 mb-1" />
                        <span className="text-4xs font-bold uppercase text-slate-500">Upload Crest</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex-1">
                    <label className="isl-input-lbl">Team Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ikoyi Strikers FC"
                      className="isl-input"
                      value={formData.teamName}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                    />
                    <span className="text-3xs text-slate-400">Click box to upload team logo image.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="isl-input-lbl">Coach Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coach Adekunle"
                      className="isl-input"
                      value={formData.coachName}
                      onChange={(e) => setFormData(prev => ({ ...prev, coachName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="isl-input-lbl">Team Captain Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chinedu Okafor"
                      className="isl-input"
                      value={formData.captainName}
                      onChange={(e) => setFormData(prev => ({ ...prev, captainName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Right Form: 2 VIP Spectators & Payment Clearance */}
              <div className="isl-form-section">
                <h3 className="isl-section-title">2. Two (2) VIP Spectators</h3>
                <p className="text-3xs text-slate-500 mb-3">
                  Each registration grants exclusive VIP access for 2 designated team patrons / spectators.
                </p>

                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <label className="isl-input-lbl">VIP Spectator 1 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Barrister Tunde Balogun"
                      className="isl-input"
                      value={formData.vipSpectator1}
                      onChange={(e) => setFormData(prev => ({ ...prev, vipSpectator1: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="isl-input-lbl">VIP Spectator 2 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ngozi Adeleke"
                      className="isl-input"
                      value={formData.vipSpectator2}
                      onChange={(e) => setFormData(prev => ({ ...prev, vipSpectator2: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="isl-reg-summary-box">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">Tournament Registration Fee:</span>
                    <strong className="text-slate-900 font-mono font-bold">₦300,000</strong>
                  </div>
                  <div className="flex justify-between items-center text-2xs text-slate-500 pt-1.5 border-t border-slate-200 mt-1.5">
                    <span>VIP Credentials:</span>
                    <span className="text-emerald-700 font-bold">2 Badges Included</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-span-full flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="isl-btn-secondary"
                  onClick={() => setActiveTab('overview')}
                >
                  Back to Overview
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="isl-btn-primary"
                >
                  <Trophy size={15} />
                  <span>{isSubmitting ? 'Registering Team...' : 'Submit Team Registration (₦300,000)'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: 10-COLUMN REGISTERED TEAMS SHOWCASE */}
        {activeTab === 'teams' && (
          <div className="isl-teams-wrap">
            <div className="isl-teams-header">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Registered Teams Matrix</h2>
                <p className="text-xs text-slate-500">
                  10 featured registration columns with team pictures, coaching staff, captaincy, and VIP spectators.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 rounded-xl"
                onClick={() => setActiveTab('register')}
              >
                <Plus size={14} /> Register Another Team
              </button>
            </div>

            {/* 10 Columns Grid */}
            <div className="isl-ten-columns-matrix">
              {slots.map((team, idx) => {
                const colNumber = idx + 1
                if (!team) {
                  return (
                    <div
                      key={`slot-${colNumber}`}
                      className="isl-slot-card empty"
                      onClick={() => setActiveTab('register')}
                      title="Available slot — click to register"
                    >
                      <div className="isl-slot-badge">COL {colNumber}</div>
                      <div className="isl-slot-empty-icon">
                        <Plus size={20} />
                      </div>
                      <strong className="text-xs font-bold text-slate-700">Open Slot {colNumber}</strong>
                      <span className="text-3xs text-slate-400">Available to Claim</span>
                      <button type="button" className="isl-slot-claim-btn mt-2">
                        + Register
                      </button>
                    </div>
                  )
                }

                return (
                  <div key={team.id || `team-${colNumber}`} className="isl-slot-card filled">
                    <div className="flex justify-between items-center mb-1">
                      <span className="isl-slot-badge filled">COL {colNumber}</span>
                      <span className="isl-status-pip">CONFIRMED</span>
                    </div>

                    {/* Team Picture / Crest */}
                    <div className="isl-team-crest-box">
                      <img
                        src={team.logoUrl || '/crests/sunday-league-fc.svg'}
                        alt={team.teamName}
                        className="isl-team-crest-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/crests/sunday-league-fc.svg'
                        }}
                      />
                    </div>

                    <h4 className="isl-team-name-title" title={team.teamName}>
                      {team.teamName}
                    </h4>

                    {/* Roster Specifications */}
                    <div className="isl-team-meta-list">
                      <div className="isl-meta-item">
                        <span className="isl-meta-k">Coach:</span>
                        <strong className="isl-meta-v">{team.coachName}</strong>
                      </div>
                      <div className="isl-meta-item">
                        <span className="isl-meta-k">Captain:</span>
                        <strong className="isl-meta-v">{team.captainName}</strong>
                      </div>

                      <div className="isl-vip-divider">
                        <span className="isl-vip-tag">2 VIP Spectators</span>
                      </div>
                      <div className="isl-vip-names">
                        <div className="isl-vip-name">• {team.vipSpectator1 || 'Designated VIP 1'}</div>
                        <div className="isl-vip-name">• {team.vipSpectator2 || 'Designated VIP 2'}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
