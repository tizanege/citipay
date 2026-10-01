import { useState } from 'react'
import {
  Building2, ShieldCheck, MapPin, Sliders, Landmark,
  Users, Mail, Phone, Calendar, CheckCircle2, Shield,
  CreditCard, Edit3, Save, Sparkles, Award
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './ClubDashboard.css'

export default function ClubProfilePage() {
  const { currentClub, clubRules, setRulesConfigModalState, adminMetrics } = useCitiPay()
  const [isEditing, setIsEditing] = useState(false)
  const [bankAccount, setBankAccount] = useState({
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountName: `${currentClub.name} Association Ltd`,
    accountNumber: '0123456789',
    sortCode: '058-152062'
  })

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
            <span className="badge badge-success font-bold text-xs">Licensed Active</span>
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

        {/* Official Club Bank Account (For Offline Reconciliations) */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title text-base font-extrabold text-slate-900">OFFICIAL BANK DETAILS</h3>
              <p className="text-xs text-slate-500">Destination account for player manual direct transfers</p>
            </div>
            <Landmark size={18} className="text-emerald-600" />
          </div>

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

          <div className="text-xs text-slate-500 bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-emerald-800 font-medium">
            💡 <strong>Offline Payment Process:</strong> When members pay into this account, use <strong>+ Record Payment</strong> in the Collections Ledger to log the reference and credit the player's account.
          </div>
        </div>
      </div>

      <div className="grid-2">
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
                  CP
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Dr. Babatunde Alabi</div>
                  <div className="text-3xs text-emerald-700 font-semibold">Club President & Founder</div>
                </div>
              </div>
              <span className="badge badge-secondary text-3xs font-mono font-bold">Admin Authority</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  CT
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Chinedu Okeke, FCA</div>
                  <div className="text-3xs text-blue-700 font-semibold">Club Treasurer & Financial Officer</div>
                </div>
              </div>
              <span className="badge badge-secondary text-3xs font-mono font-bold">Finance Admin</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  TM
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Coach Fatai Williams</div>
                  <div className="text-3xs text-purple-700 font-semibold">Team Manager & Head Coach</div>
                </div>
              </div>
              <span className="badge badge-secondary text-3xs font-mono font-bold">Squad Roster</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
