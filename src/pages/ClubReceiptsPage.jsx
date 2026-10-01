import { useState } from 'react'
import {
  FileText, Search, Filter, ShieldCheck, Printer, Download,
  CheckCircle2, ArrowUpRight, History, Calendar, Check
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './ClubDashboard.css'

export default function ClubReceiptsPage() {
  const { currentClub, transactions, setReceiptModalState } = useCitiPay()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Filter transactions for this club
  const clubReceipts = transactions.filter(tx => {
    const matchesClub = !tx.club || tx.club.toLowerCase().includes(currentClub.name.toLowerCase()) || tx.club === currentClub.name
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.receipt_no && tx.receipt_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.member_name && tx.member_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.member_id && tx.member_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || tx.payment_type === filterType
    return matchesClub && matchesSearch && matchesType
  })

  const totalReceiptsAmount = clubReceipts.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

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
                <ShieldCheck size={12} /> {currentClub.code} Official Documents
              </span>
              <span className="badge badge-accent font-bold text-xs">Verified Ledger</span>
            </div>
            <h1 className="club-banner-title">Official Club Receipts & Invoices</h1>
            <p className="club-banner-sub flex items-center gap-1 text-xs">
              Complete archive of payment receipts issued to players across Paystack online channels and manual bank settlements
            </p>
          </div>
        </div>

        <div className="club-header-right flex items-center gap-2 flex-wrap">
          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-3.5"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Print All Receipts</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid-3 mb-6">
        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Issued Receipts</span>
          <div className="text-2xl font-mono font-extrabold text-slate-900">{clubReceipts.length} Documents</div>
          <span className="text-3xs text-emerald-600 font-semibold">100% Reconciled & Stamped</span>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Receipted Volume</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600">₦{totalReceiptsAmount.toLocaleString()}</div>
          <span className="text-3xs text-slate-500 font-medium">Credited to {currentClub.name}</span>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Verification Standard</span>
          <div className="text-2xl font-mono font-extrabold text-blue-600">Paystack 256-bit</div>
          <span className="text-3xs text-slate-500 font-medium">Digital Watermark & QR Enabled</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">RECEIPT REPOSITORY</h3>
            <p className="text-xs text-slate-500">Search and generate downloadable official PDF receipts for any member</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="search-box-wrap flex-1 min-w-[240px]">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search receipt number (e.g. SL-2026-000124), member name, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="filter-box-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Receipt Categories</option>
              <option value="membership">Membership</option>
              <option value="membership_installment">Installments</option>
              <option value="social_dues">Social Dues</option>
              <option value="merchandise">Merchandise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '150px' }}>Receipt Number</th>
                <th style={{ minWidth: '110px' }}>Issue Date</th>
                <th style={{ minWidth: '170px' }}>Recipient Member</th>
                <th style={{ minWidth: '170px' }}>Payment Purpose</th>
                <th style={{ minWidth: '110px', textAlign: 'right' }}>Amount</th>
                <th style={{ minWidth: '130px' }}>Payment Method</th>
                <th style={{ minWidth: '90px', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: '110px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {clubReceipts.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {tx.receipt_no || `SL-2026-${tx.reference}`}
                    </span>
                    <span className="text-3xs text-slate-400 block font-mono">Ref: {tx.reference}</span>
                  </td>

                  <td>
                    <span className="text-xs text-slate-700 font-medium">{tx.date_display}</span>
                  </td>

                  <td>
                    <div className="font-bold text-slate-900 text-xs">{tx.member_name}</div>
                    <div className="text-3xs text-slate-500 font-mono">{tx.member_id}</div>
                  </td>

                  <td>
                    <span className="text-xs text-slate-800 font-semibold">{tx.description}</span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono text-xs font-extrabold text-emerald-700">
                      ₦{Number(tx.amount).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-secondary text-3xs font-semibold">
                      {tx.method || 'Paystack Direct'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success text-3xs font-bold">
                      ✓ VERIFIED
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary text-3xs py-1 px-3 font-bold"
                      onClick={() => setReceiptModalState({ isOpen: true, transaction: tx })}
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
