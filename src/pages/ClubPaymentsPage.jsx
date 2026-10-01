import { useState } from 'react'
import {
  CreditCard, Landmark, Download, Search, Filter, ShieldCheck,
  CheckCircle2, DollarSign, ArrowUpRight, FileText, Printer, Plus
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './ClubDashboard.css'

export default function ClubPaymentsPage() {
  const {
    currentClub,
    members,
    transactions,
    adminMetrics,
    setManualPaymentModalState,
    setReceiptModalState
  } = useCitiPay()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')

  // Filter transactions for this club
  const clubTransactions = transactions.filter(tx => {
    const matchesClub = !tx.club || tx.club.toLowerCase().includes(currentClub.name.toLowerCase()) || tx.club === currentClub.name
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.receipt_no && tx.receipt_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.member_name && tx.member_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.member_id && tx.member_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter === 'all' || tx.payment_type === typeFilter
    const matchesChannel = channelFilter === 'all' || tx.channel === channelFilter

    return matchesClub && matchesSearch && matchesType && matchesChannel
  })

  // Calculation of revenue streams
  const membershipTotal = clubTransactions
    .filter(tx => tx.payment_type === 'membership' || tx.payment_type === 'membership_installment')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

  const duesTotal = clubTransactions
    .filter(tx => tx.payment_type === 'social_dues')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

  const merchTotal = clubTransactions
    .filter(tx => tx.payment_type === 'merchandise')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

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
                <ShieldCheck size={12} /> {currentClub.code} Financial Command
              </span>
              <span className="badge badge-accent font-bold text-xs">Season 2026/27</span>
            </div>
            <h1 className="club-banner-title">Club Collections Ledger</h1>
            <p className="club-banner-sub flex items-center gap-1 text-xs">
              Live tracking of membership installments, monthly social dues, merchandise, and bank reconciliations
            </p>
          </div>
        </div>

        <div className="club-header-right flex items-center gap-2 flex-wrap">
          <button
            className="btn btn-primary flex items-center gap-1.5 text-xs font-bold py-2.5 px-4"
            onClick={() => setManualPaymentModalState({ isOpen: true, member: members[0] })}
          >
            <Plus size={15} />
            <span>Record Offline Payment</span>
          </button>

          <button
            className="btn btn-secondary flex items-center gap-1.5 text-xs font-bold py-2.5 px-3.5"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid-4 mb-6">
        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Expected Revenue</span>
          <div className="text-xl font-mono font-extrabold text-slate-900">₦{adminMetrics.expectedRevenue.toLocaleString()}</div>
          <span className="text-3xs text-slate-500 font-medium">30 Members @ ₦100,000</span>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Collected</span>
          <div className="text-xl font-mono font-extrabold text-emerald-600">₦{adminMetrics.collectedRevenue.toLocaleString()}</div>
          <span className="text-3xs text-emerald-700 font-semibold">81.7% Collection Rate</span>
        </div>

        <div className="card p-4 border-l-4 border-l-rose-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Outstanding Balance</span>
          <div className="text-xl font-mono font-extrabold text-rose-600">₦{adminMetrics.outstandingBalance.toLocaleString()}</div>
          <span className="text-3xs text-rose-700 font-semibold">Across 8 Unsettled Members</span>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Recorded Transactions</span>
          <div className="text-xl font-mono font-extrabold text-blue-600">{clubTransactions.length} Settled</div>
          <span className="text-3xs text-slate-500 font-medium">Paystack & Direct Bank</span>
        </div>
      </div>

      {/* Revenue Stream Categories Banner */}
      <div className="card mb-6 p-5">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Revenue Streams Breakdown</h4>
        <div className="grid-3">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-900 block">Season Memberships</span>
            <div className="text-lg font-extrabold font-mono text-emerald-700 mt-1">₦{membershipTotal.toLocaleString()}</div>
            <span className="text-3xs text-emerald-600">Primary club operating fund</span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <span className="text-xs font-bold text-blue-900 block">Monthly Social Dues</span>
            <div className="text-lg font-extrabold font-mono text-blue-700 mt-1">₦{duesTotal.toLocaleString()}</div>
            <span className="text-3xs text-blue-600">Matchday refreshments & turf dues</span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <span className="text-xs font-bold text-amber-900 block">Kits & Merchandise</span>
            <div className="text-lg font-extrabold font-mono text-amber-700 mt-1">₦{merchTotal.toLocaleString()}</div>
            <span className="text-3xs text-amber-600">Numbered jersey kit packs</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="section-title text-base font-extrabold text-slate-900">SETTLED TRANSACTIONS REGISTER</h3>
            <p className="text-xs text-slate-500">Every payment confirmed through Paystack direct or administrative manual recording</p>
          </div>
          <span className="badge badge-accent font-bold text-xs">{clubTransactions.length} Items</span>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="search-box-wrap flex-1 min-w-[240px]">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, member name, ID, or receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="filter-box-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Payment Types</option>
              <option value="membership">Full Membership</option>
              <option value="membership_installment">Installments</option>
              <option value="social_dues">Social Dues</option>
              <option value="merchandise">Merchandise</option>
            </select>
          </div>

          <div className="filter-box-wrap">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Channels</option>
              <option value="online">Paystack Direct (Online)</option>
              <option value="admin_manual">Bank Transfer / Cash (Manual)</option>
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
                <th style={{ minWidth: '120px' }}>Reference</th>
                <th style={{ minWidth: '120px' }}>Date</th>
                <th style={{ minWidth: '170px' }}>Member</th>
                <th style={{ minWidth: '160px' }}>Description</th>
                <th style={{ minWidth: '110px', textAlign: 'right' }}>Amount</th>
                <th style={{ minWidth: '130px' }}>Channel</th>
                <th style={{ minWidth: '90px', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: '100px', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {clubTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    No transactions found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                clubTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <span className="font-mono text-xs font-bold text-slate-800">{tx.reference}</span>
                      {tx.receipt_no && (
                        <span className="text-3xs text-slate-400 block font-mono">{tx.receipt_no}</span>
                      )}
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
                      <span className={`badge ${tx.channel === 'online' ? 'badge-accent' : 'badge-secondary'} text-3xs font-semibold`}>
                        {tx.method || (tx.channel === 'online' ? 'Paystack' : 'Manual Bank')}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success text-3xs font-bold">
                        ✓ PAID
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
