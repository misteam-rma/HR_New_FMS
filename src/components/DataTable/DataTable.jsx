import React from "react";
import LoadingSpinner from "../LoadingSpinner";
import TablePagination from "./TablePagination";

/**
 * Generic Data Table Component
 * Supports Desktop (Table) and Mobile (Card) views.
 * 
 * Props:
 * - columns: Array of { header: string, accessor: string | function, className?: string, align?: 'left' | 'center' | 'right' }
 * - data: Array of items to display
 * - loading: Boolean
 * - error: String | null
 * - onRetry: Function
 * - emptyMessage: String
 * - pagination: { currentPage, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }
 * - renderMobileCard: Function (item, index) => ReactNode
 * - minHeight: string
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  onRetry = null,
  emptyMessage = "No records found.",
  pagination = null,
  renderMobileCard = null,
  minHeight = "530px",
  className = ""
}) => {
  const renderCell = (item, column, index) => {
    if (typeof column.accessor === "function") {
      return column.accessor(item, index);
    }
    return item[column.accessor] ?? "—";
  };

  return (
    <div className={`overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col transition-all duration-300 ${className}`}>
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12" style={{ minHeight }}>
          <LoadingSpinner message="Processing records..." minHeight={minHeight} />
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" style={{ minHeight }}>
          <div className="bg-rose-50 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-rose-600 font-semibold mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition shadow-md active:scale-95"
            >
              Retry Connection
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block flex-1 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide" style={{ maxHeight: `calc(100vh - 320px)`, minHeight }}>
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
                  <tr>
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        className={`px-6 py-4 text-${col.align || 'center'} text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-gray-100 ${col.className || ""}`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                          <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{emptyMessage}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        {columns.map((col, i) => (
                          <td
                            key={i}
                            className={`px-6 py-3.5 text-${col.align || 'center'} text-sm text-slate-600 font-medium whitespace-nowrap ${col.className || ""}`}
                          >
                            {renderCell(item, col, idx)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden flex-1 overflow-y-auto bg-slate-50/30">
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-40">
                <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{emptyMessage}</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {data.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transform transition-active active:scale-[0.98]">
                    {renderMobileCard ? (
                      renderMobileCard(item, idx)
                    ) : (
                      <div className="p-4 space-y-3">
                         {/* Fallback Mobile View if no custom renderer provided */}
                         <div className="flex justify-between items-start">
                           <div className="font-bold text-indigo-600">Row #{idx + 1}</div>
                         </div>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                           {columns.slice(0, 6).map((col, i) => (
                             <div key={i}>
                               <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-tight">{col.header}</span>
                               <span className="text-sm font-medium text-slate-700 truncate block">
                                 {renderCell(item, col, idx)}
                               </span>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          {pagination && (
            <TablePagination
              currentPage={pagination.currentPage}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
              onPageChange={pagination.onPageChange}
              onItemsPerPageChange={pagination.onItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
