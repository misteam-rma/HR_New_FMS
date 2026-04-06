import React from "react";
import { Search, Filter, Calendar, ChevronDown, Check, X } from "lucide-react";

/**
 * Standardized Table Filters Component
 * 
 * Props:
 * - searchTerm: string
 * - onSearchChange: function
 * - searchPlaceholder: string
 * - filters: Array of { 
 *     label: string, 
 *     value: any, 
 *     options: Array<{label, value}>, 
 *     onSelect: function, 
 *     type: 'select' | 'date' | 'custom'
 *   }
 * - rightElement: ReactNode (optional, e.g. Add Button)
 */
const TableFilters = ({
  searchTerm = "",
  onSearchChange = () => {},
  searchPlaceholder = "Search records...",
  filters = [],
  rightElement = null
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4 mb-3">
      {/* Search Section */}
      <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
        <div className="relative flex-1 w-full lg:w-72 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors group-focus-within:text-indigo-600 text-gray-400">
            <Search size={16} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full text-sm shadow-sm transition-all bg-white font-medium placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Filters Stack */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
        <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full sm:w-auto">
          {filters.map((filter, idx) => (
            <div key={idx} className="relative col-span-1 min-w-[130px]">
              {filter.type === 'select' ? (
                <div className="relative group">
                  <div className="flex items-center gap-2 h-10 px-4 border border-slate-200 rounded-xl bg-white text-[13px] text-slate-700 font-bold cursor-pointer hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/10 transition shadow-sm relative overflow-hidden group-focus-within:ring-4 group-focus-within:ring-indigo-500/10">
                    <Filter size={13} className="text-slate-400 shrink-0" strokeWidth={2.5} />
                    <span className="truncate flex-1">{filter.value || filter.label}</span>
                    <ChevronDown size={14} className="ml-auto text-slate-400 transition-transform group-hover:text-indigo-500 group-focus-within:rotate-180" strokeWidth={2.5} />
                  </div>
                  
                  {/* Select Dropdown Overlay - Simple Native for accessibility or Custom overlay */}
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onSelect(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  >
                    <option value="">{filter.label}</option>
                    {filter.options.map((opt, i) => (
                      <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ) : filter.type === 'date' ? (
                <div className="flex items-center gap-2 h-10 px-4 border border-slate-200 rounded-xl bg-white text-[13px] text-slate-700 font-bold relative overflow-hidden shadow-sm hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/10 transition group focus-within:ring-4 focus-within:ring-indigo-500/10">
                  <Calendar size={13} className="text-slate-400 shrink-0" strokeWidth={2.5} />
                  <input
                    type="date"
                    value={filter.value}
                    onChange={(e) => filter.onSelect(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-[11px] font-bold cursor-pointer uppercase tracking-tight placeholder:text-slate-300"
                  />
                </div>
              ) : filter.type === 'custom' ? (
                filter.render()
              ) : null}
            </div>
          ))}
        </div>
        
        {rightElement && (
           <div className="w-full sm:w-auto">
             {rightElement}
           </div>
        )}
      </div>
    </div>
  );
};

export default TableFilters;
