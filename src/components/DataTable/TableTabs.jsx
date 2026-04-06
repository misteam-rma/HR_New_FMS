import React from "react";

/**
 * Standardized Table Tabs Component
 * 
 * Props:
 * - activeTab: string
 * - onTabChange: function
 * - tabs: Array of { 
 *     id: string, 
 *     label: string, 
 *     count?: number | string, 
 *     icon?: ReactNode 
 *   }
 */
const TableTabs = ({
  activeTab = "",
  onTabChange = () => {},
  tabs = []
}) => {
  return (
    <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/40 transition-all self-start md:self-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 py-1.5 px-4 text-[11px] font-semibold uppercase tracking-widest rounded-lg transition-all duration-200 active:scale-95 ${
            activeTab === tab.id
              ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
              : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
          }`}
        >
          {tab.icon && React.cloneElement(tab.icon, { size: 14, strokeWidth: 2.5 })}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums transition-colors ${
                activeTab === tab.id ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TableTabs;
