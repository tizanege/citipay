import { useState } from 'react'
import {
  CreditCard, DollarSign, Download, Search, Filter, ShieldCheck,
  CheckCircle2, ArrowUpRight, FileText, Printer, Building2, Activity, Eye, X
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import Pagination from '../components/Pagination'
import './AdminDashboard.css'

export default function AdminPaymentsPage() {
  const { transactions, clubs, setReceiptModalState, adminMetrics, confirmManualPayment, leagueSettings } = useCitiPay()
  const isPaystackEnabled = leagueSettings?.active_payment_gateway === 'paystack'
  const [searchTerm, setSearchTerm] = useState('')
  const [clubFilter, setClubFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewingProofTx, setViewingProofTx] = useState(null)

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.receipt_no && tx.receipt_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.member_name && tx.member_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.club && tx.club.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesClub = clubFilter === 'all' || (tx.club && tx.club.toLowerCase().includes(clubFilter.toLowerCase()))
    const matchesType = typeFilter === 'all' || tx.payment_type === typeFilter
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'pending' ? tx.status === 'Pending' : tx.status !== 'Pending')

    return matchesSearch && matchesClub && matchesType && matchesStatus
  })

  const totalItems = filteredTransactions.length
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  
  // Real dynamic financial calculations from actual ledger
  const paidTransactions = transactions.filter(tx => tx.status === 'Paid')
  const pendingTransactions = transactions.filter(tx => tx.status === 'Pending')
  
  const totalSettledVolume = paidTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
  const totalPendingVolume = pendingTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
  const pendingCount = pendingTransactions.length
  const paidCount = paidTransactions.length
  const totalCount = transactions.length
  
  const successRate = totalCount > 0 ? ((paidCount / totalCount) * 100).toFixed(1) : '100'

  return (
    <div className="admin-dashboard-wrap">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-accent font-bold flex items-center gap-1 text-xs">
              <ShieldCheck size={12} /> Citi Football Federation
            </span>
            <span className={`badge ${isPaystackEnabled ? 'badge-success' : 'badge-primary'} text-xs font-semibold flex items-center gap-1`}>
              <Activity size={11} /> {isPaystackEnabled ? 'Paystack Gateway Active' : 'Direct Bank Settlement Active'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Federation Revenue & Settlement Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated cross-club payment streams, verified transaction references, bank receipt proofs, and member dues clearance
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button className="btn btn-secondary flex items-center gap-2 text-xs font-semibold" onClick={() => window.print()}>
            <Printer size={15} /> Export Ledger CSV
          </button>
        </div>
      </div>

      {/* KPI Overview (100% Dynamic from Ledger) */}
      <div className="grid-4 mb-6">
        {/* Card 1: Total Settled League Revenue */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Settled Volume</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 font-heading">
            ₦{totalSettledVolume.toLocaleString()}
          </div>
          <span className="text-3xs text-emerald-700 font-semibold">
            {paidCount} verified & cleared {paidCount === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>

        {/* Card 2: Awaiting Approval / Pending */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Awaiting Verification</span>
          <div className={`text-2xl font-mono font-extrabold font-heading ${totalPendingVolume > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            ₦{totalPendingVolume.toLocaleString()}
          </div>
          <span className={`text-3xs font-medium ${pendingCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
            {pendingCount > 0 ? `${pendingCount} transfer ${pendingCount === 1 ? 'receipt' : 'receipts'} awaiting admin approval` : 'All submitted payments verified'}
          </span>
        </div>

        {/* Card 3: Settlement Success Rate */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Settlement Rate</span>
          <div className="text-2xl font-mono font-extrabold text-blue-600 font-heading">
            {successRate}%
          </div>
          <span className="text-3xs text-blue-600 font-medium">
            {paidCount} settled of {totalCount} total entries
          </span>
        </div>

        {/* Card 4: Active Settlement Mode */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Gateway Mode</span>
          <div className="text-2xl font-mono font-extrabold text-purple-600 font-heading">
            {isPaystackEnabled ? 'Paystack Auto' : 'Bank Transfer'}
          </div>
          <span className="text-3xs text-slate-500 font-medium">
            {isPaystackEnabled ? 'Daily T+1 Automated Settlement' : 'Access Bank (Oxsa int’l Nig Ltd)'}
          </span>
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
              <option value="isl_cup_entry">🏆 ISL Cup 2026 Entry</option>
              <option value="membership">Membership</option>
              <option value="membership_installment">Installments</option>
              <option value="social_dues">Social Dues</option>
              <option value="merchandise">Merchandise</option>
            </select>
          </div>

          <div className="filter-box-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">All Statuses ({totalItems})</option>
              <option value="pending">⏳ Awaiting Confirmation ({pendingCount})</option>
              <option value="paid">✓ Confirmed & Settled</option>
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
                <th style={{ minWidth: '110px' }}>Date</th>
                <th style={{ minWidth: '160px' }}>Payer (Member)</th>
                <th style={{ minWidth: '150px' }}>Beneficiary Club</th>
                <th style={{ minWidth: '160px' }}>Category</th>
                <th style={{ minWidth: '110px', textAlign: 'right' }}>Gross Amount</th>
                <th style={{ minWidth: '120px' }}>Channel</th>
                <th style={{ minWidth: '100px', textAlign: 'center' }}>Proof</th>
                <th style={{ minWidth: '100px', textAlign: 'center' }}>Settlement</th>
                <th style={{ minWidth: '120px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                    No transactions match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className={`hover:bg-slate-50 transition-colors ${tx.status === 'Pending' ? 'bg-amber-50/40' : ''}`}>
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
                        {tx.club || 'Ikoyi Sunday League'}
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
                      {tx.paymentProofUrl ? (
                        <button
                          type="button"
                          onClick={() => setViewingProofTx(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-3xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="View uploaded transfer receipt screenshot"
                        >
                          <Eye size={11} /> Proof
                        </button>
                      ) : (
                        <span className="text-4xs text-slate-400 font-mono italic">
                          {tx.method?.includes('Paystack') ? 'Gateway Auto' : '—'}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {tx.status === 'Pending' ? (
                        <span className="badge badge-warning text-3xs font-extrabold">
                          ⏳ PENDING
                        </span>
                      ) : (
                        <span className="badge badge-success text-3xs font-bold">
                          ✓ SETTLED
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {tx.status === 'Pending' ? (
                        <button
                          className="btn btn-primary text-3xs py-1.5 px-3 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm"
                          onClick={async () => {
                            if (window.confirm(`Confirm offline bank transfer of ₦${Number(tx.amount).toLocaleString()} for ${tx.member_name}?`)) {
                              await confirmManualPayment({ transactionId: tx.id, adminName: 'Super Admin' })
                            }
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>CONFIRM</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary text-3xs py-1 px-2.5 font-bold"
                          onClick={() => setReceiptModalState({ isOpen: true, transaction: tx })}
                        >
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
          itemName="payments"
        />
      </div>

      {/* Proof / Receipt Modal Viewer */}
      {viewingProofTx && (
        <div className="modal-backdrop-portal" onClick={() => setViewingProofTx(null)}>
          <div
            className="modal-content-portal max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-portal">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="modal-title-portal">Payment Proof & Receipt</h3>
                  <p className="modal-desc-portal">
                    Uploaded transfer confirmation for <strong>{viewingProofTx.member_name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewingProofTx(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-portal p-5 space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-3xs font-semibold">PAYER NAME</span>
                  <strong className="text-slate-800">{viewingProofTx.member_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-3xs font-semibold">MEMBER ID</span>
                  <strong className="text-slate-800 font-mono">{viewingProofTx.member_id}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-3xs font-semibold">CATEGORY</span>
                  <span className="text-slate-700 font-semibold">{viewingProofTx.description}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-3xs font-semibold">GROSS AMOUNT</span>
                  <strong className="text-emerald-700 font-mono text-sm">₦{Number(viewingProofTx.amount).toLocaleString()}</strong>
                </div>
                {viewingProofTx.reference && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-3xs font-semibold">TRANSFER REFERENCE</span>
                    <span className="text-slate-800 font-mono font-bold text-xs">{viewingProofTx.reference}</span>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-center p-2">
                <img
                  src={viewingProofTx.paymentProofUrl}
                  alt={`Receipt proof for ${viewingProofTx.member_name}`}
                  className="max-h-96 w-auto mx-auto object-contain rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <a
                  href={viewingProofTx.paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`Receipt-${viewingProofTx.reference || viewingProofTx.member_name}.png`}
                  className="btn btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Download size={14} /> Open Full Size / Download
                </a>
                {viewingProofTx.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Confirm offline bank transfer of ₦${Number(viewingProofTx.amount).toLocaleString()} for ${viewingProofTx.member_name}?`)) {
                        await confirmManualPayment({ transactionId: viewingProofTx.id, adminName: 'Super Admin' })
                        setViewingProofTx(null)
                      }
                    }}
                    className="btn btn-primary text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    ✓ Approve Payment Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
