import { useState } from 'react'
import {
  X, Bell, MessageSquare, Mail, Send, CheckCircle2,
  Smartphone, ShieldCheck, AlertCircle, Clock
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function ReminderModal() {
  const {
    reminderModalState,
    setReminderModalState,
    sendReminder,
    currentClub
  } = useCitiPay()

  const member = reminderModalState.member
  const [channel, setChannel] = useState(reminderModalState.channel || 'whatsapp')
  const [isSent, setIsSent] = useState(false)

  if (!reminderModalState.isOpen || !member) return null

  const isYellow = member.status === 'yellow'
  const isRed = member.status === 'red'

  // Item 13 Copy Requirements
  const reminderMessage = isYellow
    ? `⚠️ PAYMENT REMINDER — ${currentClub.name.toUpperCase()}\n\nHello ${member.full_name},\nYour club account currently has an outstanding balance of ₦${member.membership_outstanding.toLocaleString()}.\nPlease pay before your eligibility deadline to remain cleared for upcoming Matchdays.\n\nQuick Pay Link: https://citipay.ng/pay?ref=${member.member_id}`
    : `🔴 MEMBERSHIP STATUS UPDATE — ${currentClub.name.toUpperCase()}\n\nHello ${member.full_name},\nYour account is currently ineligible due to an outstanding balance of ₦${member.membership_outstanding.toLocaleString()}.\nPlease contact the club, or pay your outstanding balance to update your status to Eligible.\n\nQuick Pay Link: https://citipay.ng/pay?ref=${member.member_id}`

  const handleSend = () => {
    sendReminder({
      memberId: member.id,
      channel,
      reminderType: isYellow ? 'yellow_due_soon' : 'red_ineligible'
    })
    setIsSent(true)
    setTimeout(() => {
      setIsSent(false)
      setReminderModalState({ isOpen: false, member: null, channel: 'whatsapp' })
    }, 1500)
  }

  const handleClose = () => {
    setIsSent(false)
    setReminderModalState({ isOpen: false, member: null, channel: 'whatsapp' })
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-portal">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${isRed ? 'badge-danger' : 'badge-warning'} text-xs font-bold`}>
                {isRed ? '🔴 Ineligible Notification' : '⚠️ Due Soon Reminder'}
              </span>
            </div>
            <h2 className="modal-title-portal">Send Member Reminder</h2>
            <p className="text-xs text-slate-500">Automated dispatch to {member.full_name} ({member.member_id})</p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body-portal flex flex-col gap-4">
          {isSent ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Reminder Dispatched!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Successfully sent via <strong>{channel === 'whatsapp' ? 'WhatsApp Business' : 'Email'}</strong> to {member.full_name}.
              </p>
            </div>
          ) : (
            <>
              {/* Channel Selector */}
              <div>
                <label className="form-label-portal">DELIVERY CHANNEL</label>
                <div className="grid-2 gap-2">
                  <button
                    type="button"
                    className={`method-pill-btn ${channel === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => setChannel('whatsapp')}
                  >
                    <Smartphone size={16} className="text-emerald-600" />
                    <span>WhatsApp ({member.phone})</span>
                  </button>
                  <button
                    type="button"
                    className={`method-pill-btn ${channel === 'email' ? 'active' : ''}`}
                    onClick={() => setChannel('email')}
                  >
                    <Mail size={16} className="text-blue-600" />
                    <span>Email ({member.email})</span>
                  </button>
                </div>
              </div>

              {/* Message Preview (Item 13 exact text) */}
              <div>
                <label className="form-label-portal">MESSAGE PREVIEW</label>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs whitespace-pre-line leading-relaxed border border-slate-800">
                  {reminderMessage}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  className="btn btn-secondary flex-1 py-2.5 text-xs font-semibold"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-2 font-bold py-2.5 text-xs flex items-center justify-center gap-1.5"
                  onClick={handleSend}
                >
                  <Send size={15} />
                  <span>DISPATCH REMINDER</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
