import {
  X, Download, Printer, ShieldCheck, CheckCircle2,
  Share2, Trophy, QrCode, Building2, User
} from 'lucide-react'
import { useCitiPay } from '../../contexts/CitiPayContext'
import './ModalStyles.css'

export default function ReceiptModal() {
  const { receiptModalState, setReceiptModalState, currentClub, currentMember } = useCitiPay()

  if (!receiptModalState.isOpen) return null

  const tx = receiptModalState.transaction || {
    receipt_no: 'SL-2026-000124',
    reference: 'SL00124',
    member_name: currentMember.full_name,
    member_id: currentMember.member_id,
    description: 'Membership installment',
    amount: 50000,
    date_display: 'September 28, 2026',
    status: 'PAID',
    method: 'Paystack (Card)',
    club: currentClub.name
  }

  const handleClose = () => {
    setReceiptModalState({ isOpen: false, transaction: null })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-backdrop-portal" onClick={handleClose}>
      <div className="modal-content-portal max-w-md receipt-modal-wrapper" onClick={e => e.stopPropagation()}>
        {/* Top Controls */}
        <div className="receipt-actions-header">
          <div className="flex items-center gap-2">
            <span className="badge badge-success text-xs font-bold flex items-center gap-1">
              <ShieldCheck size={12} /> Verified Club Receipt
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="receipt-tool-btn" onClick={handlePrint} title="Print Receipt">
              <Printer size={16} />
            </button>
            <button className="receipt-tool-btn" onClick={() => alert('Official PDF Receipt downloaded to your device.')} title="Download PDF">
              <Download size={16} />
            </button>
            <button className="modal-close-btn ml-1" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Canvas (Item 15 Requirement) */}
        <div className="receipt-paper-canvas printable-section">
          {/* Receipt Top Header */}
          <div className="receipt-paper-header">
            <div className="receipt-club-brand">
              <div className="receipt-logo-box">
                <Trophy size={20} className="text-emerald-700" />
              </div>
              <div>
                <h2 className="receipt-club-name">{tx.club || currentClub.name}</h2>
                <div className="receipt-club-sub">Citi Football Member Payment System</div>
              </div>
            </div>
            <div className="receipt-badge-paid">
              <CheckCircle2 size={13} />
              <span>PAID</span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Receipt Title & Meta */}
          <div className="receipt-headline-row">
            <div>
              <span className="receipt-meta-lbl">OFFICIAL RECEIPT</span>
              <div className="receipt-ref-code">{tx.receipt_no || tx.reference}</div>
            </div>
            <div className="text-right">
              <span className="receipt-meta-lbl">DATE ISSUED</span>
              <div className="receipt-date-text">{tx.date_display || 'September 28, 2026'}</div>
            </div>
          </div>

          {/* Member Details */}
          <div className="receipt-member-box">
            <div className="receipt-row-item">
              <span className="receipt-key">Member Name:</span>
              <strong className="receipt-val">{tx.member_name || currentMember.full_name}</strong>
            </div>
            <div className="receipt-row-item">
              <span className="receipt-key">Unique Member ID:</span>
              <span className="receipt-val font-mono font-bold text-emerald-800">{tx.member_id || currentMember.member_id}</span>
            </div>
            <div className="receipt-row-item">
              <span className="receipt-key">Payment Description:</span>
              <span className="receipt-val">{tx.description}</span>
            </div>
            <div className="receipt-row-item">
              <span className="receipt-key">Payment Method:</span>
              <span className="receipt-val">{tx.method || 'Paystack Instant Settlement'}</span>
            </div>
            <div className="receipt-row-item">
              <span className="receipt-key">Transaction Status:</span>
              <span className="receipt-val text-emerald-700 font-bold">🟢 CONFIRMED & CLEARED</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="receipt-amount-container">
            <div className="receipt-amount-lbl">TOTAL AMOUNT PAID</div>
            <div className="receipt-amount-number">
              ₦{Number(tx.amount || 25000).toLocaleString()}
            </div>
            <div className="receipt-amount-words">Twenty-Five Thousand Naira Only</div>
          </div>

          {/* Verification Bar with Simulated QR Code */}
          <div className="receipt-security-footer">
            <div className="receipt-qr-cluster">
              <div className="receipt-qr-box">
                <QrCode size={36} className="text-slate-800" />
              </div>
              <div className="receipt-qr-text">
                <div className="font-mono text-2xs font-bold text-slate-800">AUTH REF: {tx.reference}</div>
                <div className="text-3xs text-slate-500">Scan to verify legitimacy on Citi Football central registry</div>
              </div>
            </div>
            <div className="receipt-stamp-seal">
              <div className="stamp-circle">
                <span>SLFC</span>
                <span>SEAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="receipt-footer-buttons">
          <button className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold py-2.5" onClick={handlePrint}>
            <Printer size={16} /> PRINT OFFICIAL RECEIPT
          </button>
        </div>
      </div>
    </div>
  )
}
