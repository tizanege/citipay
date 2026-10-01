import { useState } from 'react'
import {
  History, Download, Search, Filter, CheckCircle2,
  FileText, Calendar, ArrowUpRight, ShieldCheck, Printer
} from 'lucide-react'
import { useCitiPay } from '../contexts/CitiPayContext'
import './PaymentHistoryPage.css'

export default function PaymentHistoryPage() {
  const { transactions, currentMember, setReceiptModalState } = useCitiPay()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.receipt_no && tx.receipt_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.member_name && tx.member_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || tx.payment_type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="payment-history-page-wrapper">
      {/* Header */}
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-success text-2xs font-bold flex items-center gap-1">
              <ShieldCheck size={12} /> Paystack & Bank Ledger
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">PAYMENT HISTORY</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete transaction history and official downloadable receipts for <strong>{currentMember.full_name} ({currentMember.member_id})</strong>
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2 text-xs font-semibold" onClick={() => window.print()}>
            <Printer size={15} /> Print Statement
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card ledger-controls-card mb-6 p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="search-box-wrap flex-1 min-w-[240px]">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by Reference (e.g. SL00124), description, or receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-medium"
            />
          </div>

          <div className="filter-box-wrap min-w-[180px]">
            <Filter size={15} className="text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-medium"
            >
              <option value="all">All Payment Types</option>
              <option value="membership">Membership</option>
              <option value="membership_installment">Membership Installment</option>
              <option value="social_dues">Social Dues</option>
              <option value="merchandise">Merchandise & Kits</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table (Item 7 Requirement) */}
      <div className="card ledger-table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '110px' }}>Date</th>
                <th style={{ minWidth: '220px' }}>Description</th>
                <th style={{ minWidth: '130px', textAlign: 'right' }}>Amount</th>
                <th style={{ minWidth: '90px', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: '120px' }}>Reference</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setReceiptModalState({ isOpen: true, transaction: tx })}
                >
                  <td>
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{tx.date_display}</span>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-slate-900 text-xs">{tx.description}</div>
                    <div className="text-3xs text-slate-500 font-mono mt-0.5">{tx.method}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-extrabold text-slate-900 font-mono text-sm">
                      ₦{Number(tx.amount).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success text-xs font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 size={11} /> Paid
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {tx.reference}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary text-2xs py-1 px-2.5 font-bold flex items-center gap-1 mx-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        setReceiptModalState({ isOpen: true, transaction: tx })
                      }}
                    >
                      <FileText size={12} />
                      <span>Receipt</span>
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
