import { useState, useRef } from 'react'
import {
  X, Building2, ShieldCheck, MapPin, DollarSign,
  Upload, Camera, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react'
import './ModalStyles.css'

export default function LicenseClubModal({ isOpen, onClose, onClubCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    tagline: 'Premier Football Club',
    stadium: '',
    city: 'Lagos',
    country: 'Nigeria',
    founded_year: new Date().getFullYear(),
    membership_fee: 100000,
    monthly_social_dues: 5000,
    primary_color: '#1E3A8A',
    secondary_color: '#DC2626',
    logo_url: '/crests/sunday-league-fc.svg'
  })

  const [uploadedLogo, setUploadedLogo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

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
      await onClubCreated({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        tagline: formData.tagline.trim(),
        stadium: formData.stadium.trim() || 'Community Stadium, Lagos',
        city: formData.city.trim() || 'Lagos',
        country: formData.country.trim() || 'Nigeria',
        founded_year: Number(formData.founded_year) || new Date().getFullYear(),
        membership_fee: Number(formData.membership_fee) || 100000,
        monthly_social_dues: Number(formData.monthly_social_dues) || 5000,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        logo_url: formData.logo_url
      })

      setIsSubmitting(false)
      setSuccessMessage(`Club "${formData.name}" chartered and licensed successfully!`)

      setTimeout(() => {
        setSuccessMessage('')
        onClose()
      }, 1000)
    } catch (err) {
      setIsSubmitting(false)
      setError(err.message || 'Failed to license new club.')
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={onClose}>
      <div className="modal-content-portal max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="modal-title-portal font-extrabold text-sm text-slate-900">License New Affiliated Club</h3>
              <p className="text-3xs text-slate-500">Super Admin Federation Charter Issuance</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {successMessage ? (
          <div className="p-8 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">Club Affiliation Chartered!</h4>
            <p className="text-xs text-slate-500">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <div className="modal-body-portal flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Club Identity */}
              <div className="flex gap-4 items-center p-3.5 bg-slate-50 rounded-xl">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={uploadedLogo || formData.logo_url}
                    alt="Club Crest"
                    className="w-16 h-16 rounded-2xl object-cover bg-white shadow-sm border border-slate-200 p-1.5"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={18} />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-3xs font-extrabold uppercase text-slate-500 block mb-1">Club Crest / Badge</label>
                  <p className="text-3xs text-slate-500">Upload SVG/PNG crest or use official federation default template.</p>
                </div>
              </div>

              {/* Club Name & Short Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Official Club Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos City FC"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        name,
                        code: prev.code ? prev.code : name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()
                      }))
                    }}
                    className="form-input-portal text-xs w-full font-bold"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="LCFC"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="form-input-portal text-xs w-full font-mono font-bold text-center uppercase"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-3xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Motto / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strength, Pride and Community"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="form-input-portal text-xs w-full"
                />
              </div>

              {/* Stadium & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Home Ground / Stadium
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Onikan Stadium"
                    value={formData.stadium}
                    onChange={(e) => setFormData(prev => ({ ...prev, stadium: e.target.value }))}
                    className="form-input-portal text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    City & Region
                  </label>
                  <input
                    type="text"
                    placeholder="Lagos, Nigeria"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="form-input-portal text-xs w-full"
                  />
                </div>
              </div>

              {/* Dues Configuration */}
              <div className="p-3.5 bg-slate-50 rounded-xl flex flex-col gap-3">
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  Initial Season Financial Baseline
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-3xs font-bold text-slate-600 block mb-1">Season Membership (₦)</label>
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={formData.membership_fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, membership_fee: Number(e.target.value) }))}
                      className="form-input-portal font-mono font-bold text-xs w-full"
                    />
                  </div>

                  <div>
                    <label className="text-3xs font-bold text-slate-600 block mb-1">Monthly Social Dues (₦)</label>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={formData.monthly_social_dues}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_social_dues: Number(e.target.value) }))}
                      className="form-input-portal font-mono font-bold text-xs w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Club Color */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-3xs font-extrabold uppercase text-slate-600 block">Club Primary Brand Color</span>
                  <span className="text-3xs text-slate-400">Used for portal headers, tags and jersey badges</span>
                </div>
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer-portal p-3.5 px-5 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                className="btn btn-secondary text-xs font-semibold py-2 px-3.5 border-0 bg-slate-200/80 hover:bg-slate-300"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Chartering Club...</span>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Charter & License Club</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
