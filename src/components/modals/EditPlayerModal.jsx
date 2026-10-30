import { useState, useEffect } from 'react'
import {
  X, UserCheck, RefreshCw, ShieldCheck, CheckCircle2,
  Mail, Phone, Shirt, Trophy, KeyRound, Lock,
  ChevronDown, AlertCircle
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF']

export default function EditPlayerModal() {
  const {
    editPlayerModalState,
    setEditPlayerModalState,
    updateMemberProfile,
    clubs
  } = useCitiPay()

  const member = editPlayerModalState?.member

  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('CAM')
  const [jerseyNumber, setJerseyNumber] = useState('10')
  const [selectedClubId, setSelectedClubId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (editPlayerModalState.isOpen && member) {
      setFullName(member.full_name || '')
      setNickname(member.nickname || '')
      setPhone(member.phone || '')
      setPosition(member.position || 'CAM')
      setJerseyNumber(member.jersey_number ? String(member.jersey_number) : '10')
      setSelectedClubId(member.club_id || (clubs[0]?.id || ''))
      setIsSuccess(false)
      setIsSubmitting(false)
      setErrorMessage('')
    }
  }, [editPlayerModalState.isOpen, member, clubs])

  if (!editPlayerModalState.isOpen || !member) return null

  const handleClose = () => {
    setEditPlayerModalState({ isOpen: false, member: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMessage('Full name is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await updateMemberProfile(member.id, {
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        phone: phone.trim(),
        position,
        jerseyNumber,
        clubId: selectedClubId
      })

      setIsSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1400)
    } catch (err) {
      console.error('Update player error:', err)
      setErrorMessage(err.message || 'Failed to update player details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div
        className="modal-container-portal max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-portal">
          <div className="modal-icon-badge">
            <UserCheck size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="modal-title-portal">Edit Player Profile</h3>
            <p className="modal-desc-portal">
              Update legal roster identity, tactical specs, and club allocation
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-900">Player Details Updated!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Successfully updated <strong>{fullName}</strong>'s dossier. Changes are synced live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Readonly Member ID badge */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs">
                <span className="text-slate-400 font-medium block">Unique Member ID</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{member.display_id || member.member_id}</span>
              </div>
              <span className={`squad-clearance-pill ${member.status} text-3xs`}>
                {member.status === 'green' && '🟢 Cleared'}
                {member.status === 'yellow' && '🟡 Due Soon'}
                {member.status === 'red' && '🔴 Ineligible'}
              </span>
            </div>

            {/* Name & Nickname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label-portal">FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victor Osimhen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input-portal text-xs"
                />
              </div>
              <div>
                <label className="form-label-portal">NICKNAME (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. Star Boy"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="form-input-portal text-xs"
                />
              </div>
            </div>

            {/* Phone & Club Affiliation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label-portal">PHONE NUMBER</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. +234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input-portal text-xs pl-8"
                  />
                </div>
              </div>

              <div>
                <label className="form-label-portal">AFFILIATED CLUB</label>
                <select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="form-input-portal text-xs"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tactical Specs: Position & Jersey Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label-portal">PRIMARY POSITION</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="form-input-portal text-xs font-semibold"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label-portal">JERSEY NUMBER</label>
                <div className="relative">
                  <Shirt size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    className="form-input-portal text-xs pl-8 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn btn-secondary flex-1 py-2 text-xs font-semibold"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 py-2 text-xs font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Player Details'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

