import { useState, useEffect, useRef } from 'react'
import {
  X, Building2, ShieldCheck, MapPin, DollarSign,
  Upload, Camera, CheckCircle2, AlertCircle, Save, Sparkles, Palette
} from 'lucide-react'
import './ModalStyles.css'

export default function EditClubModal({ isOpen, club, onClose, onClubUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    tagline: '',
    stadium: '',
    city: 'Lagos',
    country: 'Nigeria',
    founded_year: 2021,
    membership_fee: 100000,
    monthly_social_dues: 5000,
    primary_color: '#2563EB',
    secondary_color: '#DC2626',
    accent_color: '#FFFFFF',
    logo_url: '/crests/sunday-league-fc.svg'
  })

  const [uploadedLogo, setUploadedLogo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (club && isOpen) {
      setFormData({
        name: club.name || '',
        code: club.code || '',
        tagline: club.tagline || 'Premier Recreational & Competitive Football Club',
        stadium: club.stadium || 'Campos Memorial Mini Stadium, Lagos Island',
        city: club.city || 'Lagos',
        country: club.country || 'Nigeria',
        founded_year: club.founded_year || 2021,
        membership_fee: club.membership_fee || 100000,
        monthly_social_dues: club.monthly_social_dues || 5000,
        primary_color: club.primary_color || '#2563EB',
        secondary_color: club.secondary_color || '#DC2626',
        accent_color: club.accent_color || '#FFFFFF',
        logo_url: club.logo_url || '/crests/sunday-league-fc.svg'
      })
      setUploadedLogo(club.logo_url || null)
      setError('')
      setSuccessMessage('')
    }
  }, [club, isOpen])

  if (!isOpen || !club) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedLogo(reader.result)
        setFormData(prev => ({ ...prev, logo_url: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please provide the Official Club Name.')
      return
    }

    if (!formData.code.trim()) {
      setError('Please provide the Club 3 or 4-letter Code (e.g. SLFC).')
      return
    }

    setIsSubmitting(true)

    try {
      await onClubUpdated(club.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        tagline: formData.tagline.trim(),
        stadium: formData.stadium.trim() || 'Campos Memorial Mini Stadium, Lagos Island',
        city: formData.city.trim() || 'Lagos',
        country: formData.country.trim() || 'Nigeria',
        founded_year: Number(formData.founded_year) || 2021,
        membership_fee: Number(formData.membership_fee) || 100000,
        monthly_social_dues: Number(formData.monthly_social_dues) || 5000,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        logo_url: formData.logo_url
      })

      setIsSubmitting(false)
      setSuccessMessage(`Club "${formData.name}" updated successfully!`)

      setTimeout(() => {
        setSuccessMessage('')
        onClose()
      }, 1000)
    } catch (err) {
      setIsSubmitting(false)
      setError(err?.message || 'Failed to update club details. Please retry.')
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={onClose}>
      <div
        className="modal-content-portal max-w-xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="badge badge-accent text-3xs font-extrabold flex items-center gap-1">
                  <ShieldCheck size={11} /> Federation Registry
                </span>
                <span className="badge badge-secondary font-mono text-3xs font-bold">{club.code}</span>
              </div>
              <h2 className="modal-title-portal">Edit Club Details</h2>
              <p className="text-3xs text-slate-500">Update official licensing, home stadium, colors, and dues</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="modal-body-portal flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Identity & Crest */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
            <div className="text-2xs font-extrabold tracking-wider uppercase text-slate-600 flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-600" /> Club Identity & Branding
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change club crest"
              >
                <img
                  src={uploadedLogo || formData.logo_url}
                  alt="Crest Preview"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/crests/sunday-league-fc.svg'
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-3xs font-bold flex-col gap-0.5">
                  <Camera size={14} /> Change
                </div>
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="text-xs font-bold text-slate-800 mb-1">Official Club Crest</div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary text-3xs py-1 px-2.5 font-bold flex items-center gap-1"
                >
                  <Upload size={11} /> Upload New Crest Image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="form-label-portal">OFFICIAL CLUB NAME</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Ikoyi Sunday League"
                  className="form-input-portal font-semibold text-xs"
                />
              </div>

              <div>
                <label className="form-label-portal">CODE / ABBR</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="ISL"
                  className="form-input-portal font-mono font-bold text-xs text-center"
                />
              </div>
            </div>

            <div>
              <label className="form-label-portal">CLUB TAGLINE / MOTTO</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="Premier Recreational & Competitive Football Club"
                className="form-input-portal text-xs italic"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="form-label-portal">PRIMARY COLOR</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="form-input-portal font-mono text-3xs py-1 px-1.5 flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="form-label-portal">SECONDARY COLOR</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="form-input-portal font-mono text-3xs py-1 px-1.5 flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="form-label-portal">ACCENT COLOR</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.accent_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="form-input-portal font-mono text-3xs py-1 px-1.5 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Home Stadium & Venue Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
            <div className="text-2xs font-extrabold tracking-wider uppercase text-slate-600 flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-600" /> Home Pitch & Headquarters
            </div>

            <div>
              <label className="form-label-portal">HOME STADIUM / VENUE</label>
              <input
                type="text"
                required
                value={formData.stadium}
                onChange={(e) => setFormData(prev => ({ ...prev, stadium: e.target.value }))}
                placeholder="Campos Memorial Mini Stadium, Lagos Island"
                className="form-input-portal text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="form-label-portal">CITY</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Lagos"
                  className="form-input-portal text-xs"
                />
              </div>

              <div>
                <label className="form-label-portal">COUNTRY</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Nigeria"
                  className="form-input-portal text-xs"
                />
              </div>

              <div>
                <label className="form-label-portal">FOUNDED YEAR</label>
                <input
                  type="number"
                  min="1900"
                  max="2099"
                  value={formData.founded_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, founded_year: e.target.value }))}
                  placeholder="2021"
                  className="form-input-portal text-xs font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Membership Fee & Social Dues */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
            <div className="text-2xs font-extrabold tracking-wider uppercase text-slate-600 flex items-center gap-1.5">
              <DollarSign size={12} className="text-amber-600" /> Financial Obligations & Dues
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label-portal">ANNUAL MEMBERSHIP FEE (NGN)</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  required
                  value={formData.membership_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, membership_fee: e.target.value }))}
                  className="form-input-portal font-mono font-bold text-xs"
                />
                <span className="text-3xs text-slate-400 mt-0.5 block">Split into 2 installments</span>
              </div>

              <div>
                <label className="form-label-portal">MONTHLY SOCIAL DUES (NGN)</label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  required
                  value={formData.monthly_social_dues}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_social_dues: e.target.value }))}
                  className="form-input-portal font-mono font-bold text-xs"
                />
                <span className="text-3xs text-slate-400 mt-0.5 block">Recurring monthly match pitch dues</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              className="btn btn-secondary text-xs py-2 px-4 font-semibold"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
              disabled={isSubmitting}
            >
              <Save size={14} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Club Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

