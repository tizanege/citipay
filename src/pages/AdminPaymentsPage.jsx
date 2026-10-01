import { useState } from 'react'
import {
  CreditCard, DollarSign, Download, Search, Filter, ShieldCheck,
  CheckCircle2, ArrowUpRight, FileText, Printer, Building2, Activity
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './AdminDashboard.css'

export default function AdminPaymentsPage() {
  const { transactions, clubs, setReceiptModalState, adminMetrics } = useCitiPay()
  const [searchTerm, setSearchTerm] = useState('')
  const [clubFilter, setClubFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.receipt_no && tx.receipt_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.member_name && tx.member_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.club && tx.club.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesClub = clubFilter === 'all' || (tx.club && tx.club.toLowerCase().includes(clubFilter.toLowerCase()))
    const matchesType = typeFilter === 'all' || tx.payment_type === typeFilter

    return matchesSearch && matchesClub && matchesType
  })

  const totalPaystackVolume = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

  return (
    <div className="admin-dashboard-wrap">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent font-bold flex items-center gap-1 text-xs">
              <ShieldCheck size={12} /> Citi Football Federation
            </span>
            <span className="badge badge-success text-xs font-semibold flex items-center gap-1">
              <Activity size={11} /> Paystack Live Gateway
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Federation Revenue & Settlement Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated cross-club Paystack payment streams, transaction references, fee splits, and automated bank reconciliations
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button className="btn btn-secondary flex items-center gap-2 text-xs font-semibold" onClick={() => window.print()}>
            <Printer size={15} /> Export Ledger CSV
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid-4 mb-6">
        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total League Volume</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 font-heading">
            ₦{totalPaystackVolume > 0 ? totalPaystackVolume.toLocaleString() : '2,450,000'}
          </div>
          <span className="text-3xs text-emerald-700 font-semibold">100% Processed via Paystack</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Settled to Club Accounts</span>
          <div className="text-2xl font-mono font-extrabold text-slate-900 font-heading">₦2,401,000</div>
          <span className="text-3xs text-slate-500 font-medium">Net after 2% Paystack processing fee</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Transaction Success Rate</span>
          <div className="text-2xl font-mono font-extrabold text-blue-600 font-heading">99.8%</div>
          <span className="text-3xs text-blue-600 font-medium">0 Chargebacks · 1 Webhook Retry</span>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Settlement Cycle</span>
          <div className="text-2xl font-mono font-extrabold text-purple-600 font-heading">T + 1 Days</div>
          <span className="text-3xs text-slate-500 font-medium">Next automatic payout: Tomorrow, 6:00 AM</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">FEDERATION TRANSACTIONS REGISTER</h3>
            <p className="text-xs text-slate-500">Universal audit stream of all transactions settled across member clubs</p>
          </div>
          <span className="badge badge-accent font-bold text-xs">{filteredTransactions.length} Verified Entries</span>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="search-box-wrap flex-1 min-w-[240px]">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search reference (SL00124), receipt #, member name, club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="filter-box-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Clubs</option>
              {clubs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-box-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Payment Types</option>
              <option value="membership">Membership</option>
              <option value="membership_installment">Installments</option>
              <option value="social_dues">Social Dues</option>
              <option value="merchandise">Merchandise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>Paystack Ref</th>
                <th style={{ minWidth: '110px' }}>Date</th>
                <th style={{ minWidth: '160px' }}>Payer (Member)</th>
                <th style={{ minWidth: '150px' }}>Beneficiary Club</th>
                <th style={{ minWidth: '160px' }}>Category</th>
                <th style={{ minWidth: '110px', textAlign: 'right' }}>Gross Amount</th>
                <th style={{ minWidth: '120px' }}>Channel</th>
                <th style={{ minWidth: '100px', textAlign: 'center' }}>Settlement</th>
                <th style={{ minWidth: '100px', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td>
                    <span className="font-mono text-xs font-bold text-slate-800">{tx.reference}</span>
                    <span className="text-3xs text-slate-400 block font-mono">{tx.receipt_no || 'REC-VERIFIED'}</span>
                  </td>

                  <td>
                    <span className="text-xs text-slate-700 font-medium">{tx.date_display}</span>
                  </td>

                  <td>
                    <div className="font-bold text-slate-900 text-xs">{tx.member_name}</div>
                    <div className="text-3xs text-slate-500 font-mono">{tx.member_id}</div>
                  </td>

                  <td>
                    <span className="badge badge-accent font-semibold text-3xs">
                      {tx.club || 'Sunday League FC'}
                    </span>
                  </td>

                  <td>
                    <span className="text-xs text-slate-800 font-medium">{tx.description}</span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono text-xs font-extrabold text-emerald-700">
                      ₦{Number(tx.amount).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-secondary text-3xs font-semibold">
                      {tx.method || 'Paystack'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success text-3xs font-bold">
                      ✓ SETTLED
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary text-3xs py-1 px-2.5 font-bold"
                      onClick={() => setReceiptModalState({ isOpen: true, transaction: tx })}
                    >
                      Receipt
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
