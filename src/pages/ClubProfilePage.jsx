import { useState, useEffect } from 'react'
import {
  Building2, ShieldCheck, MapPin, Sliders, Landmark,
  Users, Mail, Phone, Calendar, CheckCircle2, Shield,
  CreditCard, Edit3, Save, Sparkles, Award
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import EditClubModal from '../components/modals/EditClubModal'
import './ClubDashboard.css'

export default function ClubProfilePage() {
  const {
    currentClub,
    clubRules,
    members,
    setRulesConfigModalState,
    adminMetrics,
    updateClubFees,
    updateClubMatchday,
    updateClubDetails,
    leagueSettings
  } = useCitiPay()

  const [isEditingFees, setIsEditingFees] = useState(false)
  const [membershipFee, setMembershipFee] = useState(currentClub.membership_fee || 100000)
  const [monthlyDues, setMonthlyDues] = useState(currentClub.monthly_social_dues || 5000)
  const [clubMatchday, setClubMatchday] = useState(currentClub.current_matchday || leagueSettings.current_matchday || 14)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [editClubModalOpen, setEditClubModalOpen] = useState(false)

  // Dynamic Bank Account State synced with localStorage
  const [bankAccount, setBankAccount] = useState(() => {
    try {
      const saved = localStorage.getItem(`citipay_bank_account_${currentClub.id}`)
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return {
      bankName: 'Access Bank',
      accountName: 'Oxsa int’l Nig Ltd.',
      accountNumber: '0092042084',
      sortCode: '044-152062'
    }
  })
  const [isEditingBank, setIsEditingBank] = useState(false)
  const [bankForm, setBankForm] = useState(bankAccount)
  const [bankSuccess, setBankSuccess] = useState(false)

  useEffect(() => {
    setMembershipFee(currentClub.membership_fee || 100000)
    setMonthlyDues(currentClub.monthly_social_dues || 5000)
    setClubMatchday(currentClub.current_matchday || leagueSettings.current_matchday || 14)
    try {
      const saved = localStorage.getItem(`citipay_bank_account_${currentClub.id}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setBankAccount(parsed)
        setBankForm(parsed)
      } else {
        const defaultBank = {
          bankName: 'Access Bank',
          accountName: `${currentClub.name} / Oxsa int’l Nig Ltd.`,
          accountNumber: '0092042084',
          sortCode: '044-152062'
        }
        setBankAccount(defaultBank)
        setBankForm(defaultBank)
      }
    } catch (e) {}
  }, [currentClub.id, currentClub.name, currentClub.membership_fee, currentClub.monthly_social_dues, currentClub.current_matchday, leagueSettings.current_matchday])

  const handleSaveBank = () => {
    setBankAccount(bankForm)
    try {
      localStorage.setItem(`citipay_bank_account_${currentClub.id}`, JSON.stringify(bankForm))
    } catch (e) {}
    setIsEditingBank(false)
    setBankSuccess(true)
    setTimeout(() => setBankSuccess(false), 3500)
  }

  const handleSaveFees = () => {
    updateClubFees({
      clubId: currentClub.id,
      membership_fee: Number(membershipFee),
      monthly_social_dues: Number(monthlyDues),
      max_installments: 2,
      current_matchday: Number(clubMatchday)
    })
    if (updateClubMatchday) {
      updateClubMatchday(currentClub.id, Number(clubMatchday), 'Club Administrator')
    }
    setIsEditingFees(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3500)
  }

  // Real member count for this club
  const clubMembers = members.filter(m => m.club_id === currentClub.id || (!m.club_id && currentClub.slug === 'ikoyi-sunday-league'))
  const squadSize = clubMembers.length || 30

  return (
    <div className="club-dashboard-wrapper">
      {/* Header Banner */}
      <div className="club-header-banner mb-6">
        <div className="club-header-left">
          <img
            src={currentClub.logo_url}
            alt={currentClub.name}
            className="club-banner-crest"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/crests/sunday-league-fc.svg'
            }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-success flex items-center gap-1 font-bold text-xs">
                <ShieldCheck size={12} /> Club Executive Profile
              </span>
              <span className="badge badge-accent font-bold text-xs">{currentClub.code}</span>
            </div>
            <h1 className="club-banner-title">{currentClub.name}</h1>
            <p className="club-banner-sub flex items-center gap-1 text-xs">
              <MapPin size={13} /> {currentClub.stadium} · {currentClub.city}, {currentClub.country} · Founded {currentClub.founded_year || 2021}
            </p>
          </div>
        </div>

        <div className="club-header-right flex items-center gap-2 flex-wrap">
          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-4"
            onClick={() => setEditClubModalOpen(true)}
          >
            <Edit3 size={14} className="text-blue-600" />
            <span>Edit Club Details</span>
          </button>
          <button
            className="btn btn-primary flex items-center gap-1.5 text-xs font-bold py-2.5 px-4"
            onClick={() => setRulesConfigModalState({ isOpen: true })}
          >
            <Sliders size={15} />
            <span>Configure Eligibility Rules</span>
          </button>
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Club Details & Identity */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">CLUB IDENTITY & VENUE</h3>
              <p className="text-xs text-slate-500">Official club licensing details registered with Citi Football</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-secondary text-xs py-1 px-2.5 font-bold flex items-center gap-1"
                onClick={() => setEditClubModalOpen(true)}
              >
                <Edit3 size={11} className="text-blue-600" /> Edit
              </button>
              <span className="badge badge-success font-bold text-xs">Licensed Active</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Club Full Name:</span>
              <strong className="text-slate-900">{currentClub.name}</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Official Code / Slug:</span>
              <strong className="font-mono text-emerald-700 font-bold">{currentClub.code} ({currentClub.slug})</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Home Stadium:</span>
              <strong className="text-slate-900">{currentClub.stadium}</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Headquarters City:</span>
              <strong className="text-slate-900">{currentClub.city}, {currentClub.country}</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Official Club Tagline:</span>
              <span className="text-slate-700 italic font-medium">"{currentClub.tagline || 'Premier Recreational & Competitive Football Club'}"</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Brand Palette:</span>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border border-slate-200" style={{ background: currentClub.primary_color }} title="Primary" />
                <span className="w-5 h-5 rounded-full border border-slate-200" style={{ background: currentClub.secondary_color }} title="Secondary" />
                <span className="w-5 h-5 rounded-full border border-slate-200" style={{ background: currentClub.accent_color }} title="Accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Club Dues & Membership Fee Card */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">DUES & MEMBERSHIP FEES</h3>
              <p className="text-xs text-slate-500">Official club fee obligations for competitive squad registration</p>
            </div>
            <div className="flex items-center gap-2">
              {isEditingFees ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary text-xs py-1 px-3 font-semibold"
                    onClick={() => {
                      setMembershipFee(currentClub.membership_fee || 100000)
                      setMonthlyDues(currentClub.monthly_social_dues || 5000)
                      setIsEditingFees(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary text-xs py-1 px-3 font-bold flex items-center gap-1"
                    onClick={handleSaveFees}
                  >
                    <Save size={13} /> Save Fees
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1"
                  onClick={() => setIsEditingFees(true)}
                >
                  <Edit3 size={13} /> Edit Fees
                </button>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="p-2.5 mb-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Club membership fees and monthly dues updated successfully!
            </div>
          )}

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div>
                <span className="text-slate-700 font-bold block">Annual / Season Membership:</span>
                <span className="text-3xs text-slate-500">Paid in 2 bi-annual installments</span>
              </div>
              {isEditingFees ? (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">₦</span>
                  <input
                    type="number"
                    className="form-input-portal font-mono font-bold text-xs py-1 px-2 w-32"
                    value={membershipFee}
                    onChange={(e) => setMembershipFee(e.target.value)}
                    step="1000"
                    min="1000"
                  />
                </div>
              ) : (
                <strong className="text-emerald-700 font-mono text-sm font-extrabold">
                  ₦{(currentClub.membership_fee || 100000).toLocaleString()}
                </strong>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div>
                <span className="text-slate-700 font-bold block">Monthly Social Dues:</span>
                <span className="text-3xs text-slate-500">Monthly recurring dues for pitch & gear</span>
              </div>
              {isEditingFees ? (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">₦</span>
                  <input
                    type="number"
                    className="form-input-portal font-mono font-bold text-xs py-1 px-2 w-32"
                    value={monthlyDues}
                    onChange={(e) => setMonthlyDues(e.target.value)}
                    step="500"
                    min="100"
                  />
                </div>
              ) : (
                <strong className="text-slate-900 font-mono text-sm font-extrabold">
                  ₦{(currentClub.monthly_social_dues || 5000).toLocaleString()}/mo
                </strong>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <div>
                <span className="text-slate-700 font-bold block flex items-center gap-1.5">
                  <Calendar size={13} className="text-blue-600" /> Active Club Gameweek / Matchday:
                </span>
                <span className="text-3xs text-slate-500">Tournament round determining squad roster clearance</span>
              </div>
              {isEditingFees ? (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500">GW</span>
                  <input
                    type="number"
                    className="form-input-portal font-mono font-bold text-xs py-1 px-2 w-20 text-center"
                    value={clubMatchday}
                    onChange={(e) => setClubMatchday(Math.max(1, Math.min(16, Number(e.target.value) || 1)))}
                    step="1"
                    min="1"
                    max="16"
                  />
                </div>
              ) : (
                <span className="badge badge-accent font-bold font-mono text-xs">
                  GW {currentClub.current_matchday || leagueSettings.current_matchday || 14} of 16
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Installment Payment Structure:</span>
              <span className="badge badge-accent font-bold font-mono text-3xs">
                2 Installments (50% / 50%) — 2x ₦{Math.round((Number(membershipFee || 100000)) / 2).toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
              💡 <strong>Instant Sync:</strong> Updating dues or membership fees immediately recalculates squad balances, installment tranches, and Paystack payment defaults for all registered members of {currentClub.name}.
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Official Club Bank Account (For Offline Reconciliations) */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">OFFICIAL BANK DETAILS</h3>
              <p className="text-xs text-slate-500">Destination account for player manual direct transfers</p>
            </div>
            <div className="flex items-center gap-2">
              {isEditingBank ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary text-xs py-1 px-3 font-semibold"
                    onClick={() => {
                      setBankForm(bankAccount)
                      setIsEditingBank(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary text-xs py-1 px-3 font-bold flex items-center gap-1"
                    onClick={handleSaveBank}
                  >
                    <Save size={13} /> Save Bank
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1"
                  onClick={() => setIsEditingBank(true)}
                >
                  <Edit3 size={13} /> Edit Bank
                </button>
              )}
            </div>
          </div>

          {bankSuccess && (
            <div className="p-2.5 mb-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Club bank details updated successfully!
            </div>
          )}

          {isEditingBank ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex flex-col gap-3">
              <div>
                <label className="form-label-portal">FINANCIAL INSTITUTION (BANK)</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. Access Bank"
                  className="form-input-portal text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label-portal">ACCOUNT NUMBER</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="0092042084"
                    className="form-input-portal font-mono text-sm font-extrabold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="form-label-portal">SORT CODE</label>
                  <input
                    type="text"
                    value={bankForm.sortCode}
                    onChange={(e) => setBankForm({ ...bankForm, sortCode: e.target.value })}
                    placeholder="044-152062"
                    className="form-input-portal font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="form-label-portal">ACCOUNT BENEFICIARY NAME</label>
                <input
                  type="text"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  placeholder="e.g. Oxsa int'l Nig Ltd."
                  className="form-input-portal text-xs font-semibold"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Financial Institution</div>
              <div className="text-base font-bold text-slate-900">{bankAccount.bankName}</div>

              <div className="mt-3 flex justify-between">
                <div>
                  <span className="text-3xs text-slate-500 uppercase font-semibold">Account Number</span>
                  <div className="text-lg font-mono font-extrabold text-emerald-700 tracking-wider">{bankAccount.accountNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-3xs text-slate-500 uppercase font-semibold">Sort Code</span>
                  <div className="text-xs font-mono font-bold text-slate-700">{bankAccount.sortCode}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200">
                <span className="text-3xs text-slate-500 uppercase font-semibold">Account Beneficiary</span>
                <div className="text-xs font-semibold text-slate-800">{bankAccount.accountName}</div>
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500 bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-emerald-800 font-medium">
            💡 <strong>Offline Payment Process:</strong> When members pay into this account, use <strong>+ Record Payment</strong> in the Collections Ledger to log the reference and credit the player's account.
          </div>
        </div>

        {/* Dynamic 3-Color Eligibility Rules Configuration */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">ELIGIBILITY THRESHOLD RULES</h3>
              <p className="text-xs text-slate-500">Rules determining matchday squad clearance</p>
            </div>
            <button
              className="btn btn-secondary text-xs py-1.5 px-3 font-bold"
              onClick={() => setRulesConfigModalState({ isOpen: true })}
            >
              Edit Rules
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="status-dot-sm green" />
                <strong className="text-xs text-emerald-900">🟢 GREEN STATUS (MATCHDAY CLEARED)</strong>
              </div>
              <p className="text-xs text-slate-600">
                Outstanding balance must be exactly <strong>₦{clubRules.green_max_balance.toLocaleString()}</strong> and all monthly social dues must be up to date.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="status-dot-sm yellow" />
                <strong className="text-xs text-amber-900">🟡 YELLOW STATUS (PAYMENT DUE SOON)</strong>
              </div>
              <p className="text-xs text-slate-600">
                Outstanding balance between <strong>₦{(clubRules.green_max_balance + 1).toLocaleString()}</strong> and <strong>₦{clubRules.yellow_max_balance.toLocaleString()}</strong>. Grace period window: <strong>{clubRules.yellow_due_days_window || 14} days</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="status-dot-sm red" />
                <strong className="text-xs text-rose-900">🔴 RED STATUS (INELIGIBLE / SUSPENDED)</strong>
              </div>
              <p className="text-xs text-slate-600">
                Outstanding balance exceeds <strong>₦{clubRules.red_min_balance.toLocaleString()}</strong> or social dues unpaid. Player barred from starting lineup.
              </p>
            </div>
          </div>
        </div>

        {/* Club Executive Leadership Roster */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">EXECUTIVE COMMITTEE</h3>
              <p className="text-xs text-slate-500">Club officials with administrative portal clearance</p>
            </div>
            <span className="badge badge-accent font-bold text-xs">4 Officers</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  AI
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">ATILOLA ISMAIL</div>
                  <div className="text-3xs text-emerald-700 font-semibold">Club President</div>
                </div>
              </div>
              <span className="badge badge-secondary text-3xs font-mono font-bold">President Authority</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  TN
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">TIZA NEGE</div>
                  <div className="text-3xs text-blue-700 font-semibold">Super Admin / League HQ</div>
                </div>
              </div>
              <span className="badge badge-accent text-3xs font-mono font-bold">Super Admin</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  AO
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">ANWAR OIZA</div>
                  <div className="text-3xs text-purple-700 font-semibold">Super Admin / League HQ</div>
                </div>
              </div>
              <span className="badge badge-accent text-3xs font-mono font-bold">Super Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Club Modal */}
      <EditClubModal
        isOpen={editClubModalOpen}
        club={currentClub}
        onClose={() => setEditClubModalOpen(false)}
        onClubUpdated={(clubId, details) => updateClubDetails(clubId, details, 'Club Executive')}
      />
    </div>
  )
}
