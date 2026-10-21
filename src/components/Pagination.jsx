import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import './Pagination.css'

/**
 * Reusable Pagination Component
 * 
 * @param {number} totalItems - Total count of unfiltered/filtered records
 * @param {number} currentPage - Currently active page (1-indexed)
 * @param {number} pageSize - Number of items shown per page
 * @param {function} onPageChange - Callback when page changes (newPage: number) => void
 * @param {function} [onPageSizeChange] - Optional callback when page size changes (newSize: number) => void
 * @param {number[]} [pageSizeOptions=[10, 25, 50]] - Array of per-page size options
 * @param {string} [itemName='items'] - Label for the item type (e.g. 'players', 'transactions')
 */
export default function Pagination({
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemName = 'records'
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // If there are no items, hide or show minimal state
  if (totalItems === 0) {
    return null
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(totalItems, currentPage * pageSize)

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages = []
    const delta = 1 // pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="pagination-container">
      {/* Left: Range and total info */}
      <div className="pagination-info">
        <span>
          Showing <strong>{startItem.toLocaleString()}</strong>–<strong>{endItem.toLocaleString()}</strong> of{' '}
          <strong>{totalItems.toLocaleString()}</strong> {itemName}
        </span>

        {onPageSizeChange && (
          <div className="pagination-size-selector">
            <span>· Per page:</span>
            <select
              className="pagination-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Controls & Page Pills */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            title="First Page"
          >
            <ChevronsLeft size={13} />
          </button>

          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Previous Page"
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="pagination-pages">
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="pagination-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={13} />
          </button>

          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Last Page"
          >
            <ChevronsRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
