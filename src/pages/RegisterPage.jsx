import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Lock, Phone, Shield, Trophy, ChevronRight,
  ChevronLeft, Check, Upload, CheckCircle2, AlertCircle,
  ShieldCheck, Sparkles, CreditCard, Calendar, Star, DollarSign
} from 'lucide-react'
import { mockClubs } from '../lib/mockData'
import './RegisterPage.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    // Step 1: Account
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'player',

    // Step 2: Football Profile
    selectedClubId: mockClubs[0]?.id || '',
    primaryPosition: 'CAM',
    secondaryPosition: 'LW',
    preferredFoot: 'Right',
    jerseyNumber: '10',
    heightCm: '182',
    weightKg: '75',
    dob: '2001-05-14',

    // Step 3: Registration Plan
    paymentType: 'installment',
    installmentsCount: 2,
    agreeTerms: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleClubSelect = (clubId) => {
    setFormData(prev => ({ ...prev, selectedClubId: clubId }))
  }

  const selectedClub = mockClubs.find(c => c.id === formData.selectedClubId) || mockClubs[0]

  const nextStep = () => {
    setError(null)
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Please complete all required account fields.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }
    if (step === 2) {
      if (!formData.selectedClubId) {
        setError('Please select your football club.')
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => {
    setError(null)
    setStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.agreeTerms) {
      setError('Please agree to the CitiLeague rules and terms of registration.')
      return
    }

    setLoading(true)
    setError(null)

    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1800)
    }, 1000)
  }

  const positions = [
    { cat: 'Goalkeeper', items: ['GK'] },
    { cat: 'Defenders', items: ['CB', 'LB', 'RB', 'LWB', 'RWB'] },
    { cat: 'Midfielders', items: ['CDM', 'CM', 'CAM', 'LM', 'RM'] },
    { cat: 'Forwards', items: ['LW', 'RW', 'ST', 'CF'] }
  ]

  return (
    <div className="register-layout-wrap">
      {/* Left Athletic Hero Showcase Sidebar */}
      <div className="register-hero-sidebar">
        <div className="register-hero-top">
          <div className="reg-brand-box">
            <div className="reg-brand-icon">
              <Trophy size={20} />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg font-heading">CitiLeague</span>
              <span className="text-emerald-400 font-bold text-xs block uppercase">Official Onboarding</span>
            </div>
          </div>

          <h1 className="register-hero-title">
            Register for the <span>2026/27 Season.</span>
          </h1>
          <p className="register-hero-desc">
            Complete your registration in 3 simple steps to join an official CitiLeague premier club, secure matchday eligibility, and manage payments with Paystack.
          </p>

          {/* Guided Steps Overview */}
          <div className="reg-steps-vertical">
            <div className={`reg-step-guide-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <div className="reg-step-num-badge">{step > 1 ? <Check size={14} /> : '1'}</div>
              <div>
                <div className="reg-step-title">Account & Credentials</div>
                <div className="reg-step-desc">Player legal name, email & secure login</div>
              </div>
            </div>

            <div className={`reg-step-guide-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <div className="reg-step-num-badge">{step > 2 ? <Check size={14} /> : '2'}</div>
              <div>
                <div className="reg-step-title">Club Affiliation & Position</div>
                <div className="reg-step-desc">Pick your team, kit number & tactical role</div>
              </div>
            </div>

            <div className={`reg-step-guide-item ${step === 3 ? 'active' : ''}`}>
              <div className="reg-step-num-badge">3</div>
              <div>
                <div className="reg-step-title">Payment Plan & Terms</div>
                <div className="reg-step-desc">Flexible Paystack installment structure</div>
              </div>
            </div>
          </div>
        </div>

        <div className="reg-trust-footer">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Paystack Secured</span>
          <span>·</span>
          <span>Season 2026/27</span>
        </div>
      </div>

      {/* Right Multi-Step Form Card Panel */}
      <div className="register-form-panel">
        <div className="register-main-card">
          <div className="reg-form-header">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-accent font-bold">Step {step} of 3</span>
              <span className="badge badge-secondary font-medium">Player Portal</span>
            </div>
            <h2 className="reg-form-title">
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Football Profile & Club Selection'}
              {step === 3 && 'Membership Fee & Payment Structure'}
            </h2>
            <p className="reg-form-sub">
              {step === 1 && 'Enter your official legal name and secure account credentials'}
              {step === 2 && 'Choose your affiliated club and football attributes'}
              {step === 3 && 'Select your preferred Paystack settlement option'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="reg-progress-bar-wrap">
            <div className={`reg-prog-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="reg-prog-circle">{step > 1 ? <Check size={16} /> : '1'}</div>
              <span>Credentials</span>
            </div>
            <div className={`reg-prog-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`reg-prog-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="reg-prog-circle">{step > 2 ? <Check size={16} /> : '2'}</div>
              <span>Club & Role</span>
            </div>
            <div className={`reg-prog-line ${step >= 3 ? 'active' : ''}`} />
            <div className={`reg-prog-step ${step >= 3 ? 'active' : ''}`}>
              <div className="reg-prog-circle">3</div>
              <span>Payment</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Registration Complete!</h3>
              <p className="text-sm text-slate-500 mb-4">
                Welcome to <strong>{selectedClub.name}</strong>. Redirecting you to your player dashboard...
              </p>
              <div className="text-xs font-bold text-emerald-600">Setting up your profile dossier...</div>
            </div>
          ) : (
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* STEP 1: Personal & Account Details */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="form-group">
                    <label>Full Legal Name *</label>
                    <div className="input-with-icon">
                      <User size={18} />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="e.g. Babatunde Johnson"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <div className="input-with-icon">
                        <Mail size={18} />
                        <input
                          type="email"
                          name="email"
                          placeholder="you@domain.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone Number *</label>
                      <div className="input-with-icon">
                        <Phone size={18} />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+234 800 000 0000"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Password *</label>
                      <div className="input-with-icon">
                        <Lock size={18} />
                        <input
                          type="password"
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm Password *</label>
                      <div className="input-with-icon">
                        <Lock size={18} />
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Football Profile & Club Selection */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Select Your Football Club *
                    </label>
                    <div className="club-picker-list">
                      {mockClubs.map(club => (
                        <div
                          key={club.id}
                          onClick={() => handleClubSelect(club.id)}
                          className={`club-picker-item ${formData.selectedClubId === club.id ? 'selected' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={club.logo_url} alt={club.name} className="club-item-crest" />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{club.name}</div>
                              <div className="text-xs text-slate-500">{club.stadium} · {club.city}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-emerald-600 font-mono">₦{club.membership_fee.toLocaleString()}</div>
                            <div className="text-xs text-slate-400">Season Fee</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Primary Position</label>
                      <select name="primaryPosition" value={formData.primaryPosition} onChange={handleChange}>
                        {positions.map(group => (
                          <optgroup key={group.cat} label={group.cat}>
                            {group.items.map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Preferred Foot</label>
                      <select name="preferredFoot" value={formData.preferredFoot} onChange={handleChange}>
                        <option value="Right">Right</option>
                        <option value="Left">Left</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Jersey Number</label>
                      <input
                        type="number"
                        name="jerseyNumber"
                        placeholder="10"
                        min="1"
                        max="99"
                        value={formData.jerseyNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input type="number" name="heightCm" placeholder="180" value={formData.heightCm} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input type="number" name="weightKg" placeholder="75" value={formData.weightKg} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Plan & Confirmation */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="selected-club-preview">
                    <img src={selectedClub.logo_url} alt={selectedClub.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                    <div className="flex-1">
                      <span className="badge badge-accent font-bold mb-1">Selected Club</span>
                      <h4 className="font-extrabold text-base text-slate-900">{selectedClub.name}</h4>
                      <p className="text-xs text-slate-500">{selectedClub.stadium} · Total Season Fee: <strong className="text-emerald-600 font-mono">₦{selectedClub.membership_fee.toLocaleString()}</strong></p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Choose Payment Structure *
                    </label>

                    <div className="flex flex-col gap-2.5">
                      <div
                        className={`reg-payment-card ${formData.paymentType === 'installment' ? 'selected' : ''}`}
                        onClick={() => setFormData(p => ({ ...p, paymentType: 'installment' }))}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="installment"
                          checked={formData.paymentType === 'installment'}
                          onChange={handleChange}
                        />
                        <div className="flex-1">
                          <div className="reg-payment-title">Installmental Payment (Recommended)</div>
                          <div className="reg-payment-desc">
                            Pay in 2 installments (50% split) of ₦{(selectedClub.membership_fee / 2).toLocaleString()} via Paystack
                          </div>
                        </div>
                        <span className="badge badge-success font-bold text-xs">Flexible</span>
                      </div>

                      <div
                        className={`reg-payment-card ${formData.paymentType === 'full' ? 'selected' : ''}`}
                        onClick={() => setFormData(p => ({ ...p, paymentType: 'full' }))}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="full"
                          checked={formData.paymentType === 'full'}
                          onChange={handleChange}
                        />
                        <div className="flex-1">
                          <div className="reg-payment-title">Full One-Time Payment</div>
                          <div className="reg-payment-desc">
                            Pay the full ₦{selectedClub.membership_fee.toLocaleString()} registration fee in a single transaction
                          </div>
                        </div>
                        <span className="badge badge-secondary font-bold text-xs">Single Settle</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed font-medium">
                        I agree to the <a href="#terms" className="text-emerald-600 font-bold hover:underline">CitiLeague Code of Conduct</a>, anti-doping policies, and player matchday clearance obligations.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="btn btn-secondary flex items-center gap-1.5 font-bold text-xs py-2.5 px-4">
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button type="submit" className="btn btn-primary flex items-center gap-1.5 font-bold text-xs py-2.5 px-5">
                    Next Step <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2 font-bold text-xs py-2.5 px-5">
                    {loading ? (
                      <span>Processing Registration...</span>
                    ) : (
                      <>
                        <ShieldCheck size={16} /> Complete & Join {selectedClub.name}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="text-center mt-6 text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
