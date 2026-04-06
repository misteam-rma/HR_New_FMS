import React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";

/**
 * Table Pagination Component
 * 
 * Props:
 * - currentPage: number
 * - itemsPerPage: number
 * - totalItems: number
 * - onPageChange: function
 * - onItemsPerPageChange: function
 */
const TablePagination = ({
  currentPage = 1,
  itemsPerPage = 15,
  totalItems = 0,
  onPageChange = () => {},
  onItemsPerPageChange = () => {}
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
      {/* Records Info */}
      <div className="flex items-center gap-8 flex-wrap">
        <div className="flex flex-col">
           <p className="text-[12px] text-slate-500 font-medium tracking-tight">
             Showing <span className="font-bold text-slate-900">{totalItems > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-slate-900">{indexOfLastItem}</span> of <span className="font-bold text-slate-900">{totalItems}</span> records
           </p>
        </div>
        
        {/* Rows Per Page */}
        <div className="flex items-center gap-2">
          <label className="text-[12px] text-slate-400 font-bold uppercase tracking-tighter">Rows per page</label>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold py-1 px-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {[15, 30, 50, 100].map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
               <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <nav className="relative z-0 inline-flex flex-row items-center gap-1.5" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
          title="Previous Page"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1 px-1">
          {getPageNumbers().map((pageNum, idx) => (
            <React.Fragment key={idx}>
              {pageNum === "..." ? (
                <span className="w-8 h-8 flex items-center justify-center text-slate-400">
                  <MoreHorizontal size={14} />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] font-bold transition-all ${
                    currentPage === pageNum
                      ? "z-10 bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                      : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30"
                  } active:scale-90`}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default TablePagination;
