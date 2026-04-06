import React, { useState, useEffect } from "react";
import {
  BarChart3, History, Search, Filter, Calendar, ChevronDown, Check,
  ChevronRight, Download, Users, Briefcase, LayoutDashboard
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

// Professional Dummy Monthly History (Jan - Apr 2024)
const generateMonthlyData = () => {
  const employees = [
    { id: "EMP1001", name: "Rahul Sharma", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1002", name: "Priya Patel", dept: "HR", post: "HR Manager" },
    { id: "EMP1003", name: "Amit Kumar", dept: "Sales", post: "Sales Executive" },
    { id: "EMP1004", name: "Sneha Gupta", dept: "Finance", post: "Accountant" },
    { id: "EMP1005", name: "Vikram Singh", dept: "Operations", post: "Project Manager" },
    { id: "EMP1006", name: "Anjali Desai", dept: "Marketing", post: "Creative Director" },
    { id: "EMP1007", name: "Rohan Mehta", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1008", name: "Sonal Varma", dept: "HR", post: "HR Manager" },
    { id: "EMP1009", name: "Arjun Reddy", dept: "Sales", post: "Sales Executive" },
    { id: "EMP1010", name: "Neha Kapoor", dept: "Finance", post: "Accountant" },
    { id: "EMP1011", name: "Sandeep Nair", dept: "Operations", post: "Project Manager" },
    { id: "EMP1012", name: "Pooja Hegde", dept: "Marketing", post: "Creative Director" },
    { id: "EMP1013", name: "Karan Johar", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1014", name: "Aditi Rao", dept: "HR", post: "HR Manager" },
    { id: "EMP1015", name: "Abhishek Das", dept: "Sales", post: "Sales Executive" },
    { id: "EMP1016", name: "Deepika Roy", dept: "Finance", post: "Accountant" },
    { id: "EMP1017", name: "Vivek Joshi", dept: "Operations", post: "Project Manager" },
    { id: "EMP1018", name: "Shweta Tiwari", dept: "Marketing", post: "Creative Director" },
    { id: "EMP1019", name: "Manish Paul", dept: "Engineering", post: "Software Engineer" },
    { id: "EMP1020", name: "Kirti Sanon", dept: "HR", post: "HR Manager" },
  ];

  const months = ["January", "February", "March", "April"];
  const data = [];

  let serialCounter = 1;
  months.forEach(month => {
    employees.forEach(emp => {
      const punchDays = Math.floor(Math.random() * 5) + 21;
      const absents = Math.floor(Math.random() * 4);

      data.push({
        id: `${emp.id}-${month}-2024`,
        serialNo: serialCounter++,
        employeeCode: emp.id,
        empId: emp.id,
        year: "2024",
        month: month,
        analyticsMonth: `${month} 2024`,
        netPresent: `${punchDays} Days`,
        totalAbsents: absents,
        lateMarks: Math.floor(Math.random() * 4),
        missPunch: Math.random() > 0.85 ? 1 : 0,
        name: emp.name,
        designation: emp.post,
        department: emp.dept,
        status: absents > 0 ? "Under Review" : "Verified",
      });
    });
  });
  return data.reverse();
};

const DUMMY_MONTHLY_DATA = generateMonthlyData();

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [filterMonth, searchTerm, filterDepartment]);

  const filteredData = DUMMY_MONTHLY_DATA.filter(item => {
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDepartment || item.department === filterDepartment;
    const matchesMonth = !filterMonth || item.month === filterMonth;
    return matchesSearch && matchesDept && matchesMonth;
  });

  const departments = [...new Set(DUMMY_MONTHLY_DATA.map(d => d.department))].sort();
  const months = ["January", "February", "March", "April"];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.min(5, totalPages))].map((_, i) => (
        <button key={i} onClick={() => paginate(i + 1)} className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold ${currentPage === (i + 1) ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-3 pb-20 md:pb-8 font-outfit">

      {/* \ud83d\ude80 Header & Toolbar - Synced with Daily Logs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-[13px] shadow-sm bg-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
            {/* Department Filter */}
            <div className="relative">
              <div onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)} className="flex items-center gap-2 h-8 px-3 border border-gray-200 rounded bg-white text-[11px] text-gray-700 font-medium cursor-pointer hover:border-indigo-400 transition shadow-sm">
                <Filter size={11} className="text-gray-400" />
                <span className="truncate">{filterDepartment || "All Dept"}</span>
                <ChevronDown size={12} className={`ml-1 text-gray-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isDeptDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDeptDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 ring-1 ring-black ring-opacity-5">
                    <div
                      onClick={() => { setFilterDepartment(""); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                      className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${!filterDepartment ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 font-medium'}`}
                    >
                      All Departments
                      {!filterDepartment && <Check size={12} className="text-indigo-500" />}
                    </div>
                    {departments.map(d => (
                      <div
                        key={d}
                        onClick={() => { setFilterDepartment(d); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                        className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${filterDepartment === d ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 font-medium'}`}
                      >
                        {d}
                        {filterDepartment === d && <Check size={12} className="text-indigo-500" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Month Filter */}
            <div className="relative">
              <div onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)} className="flex items-center gap-2 h-8 px-3 border border-gray-200 rounded bg-white text-[11px] text-gray-700 font-medium cursor-pointer hover:border-indigo-400 transition shadow-sm min-w-[110px]">
                <Calendar size={11} className="text-gray-400" />
                <span className="truncate uppercase">{filterMonth || "All Months"}</span>
                <ChevronDown size={12} className={`ml-1 text-gray-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            {isMonthDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMonthDropdownOpen(false)}></div>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 ring-1 ring-black ring-opacity-5">
                  <div
                    onClick={() => { setFilterMonth(""); setIsMonthDropdownOpen(false); setCurrentPage(1); }}
                    className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${!filterMonth ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 font-medium whitespace-nowrap'}`}
                  >
                    All Months
                    {!filterMonth && <Check size={12} className="text-indigo-500" />}
                  </div>
                  {months.map(m => (
                    <div
                      key={m}
                      onClick={() => { setFilterMonth(m); setIsMonthDropdownOpen(false); setCurrentPage(1); }}
                      className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${filterMonth === m ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 font-medium whitespace-nowrap'}`}
                    >
                      {m}
                      {filterMonth === m && <Check size={12} className="text-indigo-500" />}
                    </div>
                  ))}
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* \ud83d\udcca Main Table Content Area - Daily Logs Mirror */}
      {/* 📊 Main Table Content Area - Desktop Table (Hidden on Mobile) */}
      <div className="overflow-hidden border border-gray-200 rounded-xl bg-white min-h-[530px] flex flex-col shadow-sm hidden md:flex min-w-[1000px] lg:min-w-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Generating monthly analytics..." minHeight="450px" />
          </div>
        ) : (
          <>
            <div className="max-h-[calc(105vh-300px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sr.</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap sticky left-0 z-30 bg-gray-50 shadow-sm border-r border-gray-100 italic">E-ID</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Analytics Month</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Full Name</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Department</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Designation</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Net Present</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Total Absents</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Late Marks</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Miss Punch</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-24 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No monthly logs found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-2 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold">{item.serialNo}</td>
                        <td className="px-6 py-2 whitespace-nowrap sticky left-0 z-10 bg-white/95 backdrop-blur group-hover:bg-gray-50/95 border-r border-gray-100 shadow-sm transition-colors text-center">
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">#{item.empId}</p>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-gray-500 font-medium uppercase">{item.analyticsMonth}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-700 font-bold uppercase tracking-tight">{item.name}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-gray-400 font-medium uppercase tracking-tight">{item.department}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-gray-500 font-medium uppercase tracking-tight">{item.designation}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-emerald-600 font-bold tracking-tight">{item.netPresent}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-rose-500 font-medium">{item.totalAbsents}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-normal">{item.lateMarks}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-normal">{item.missPunch}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${item.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100' : 'bg-amber-50 text-amber-600 shadow-sm shadow-amber-100'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* \ud83d\udcd1 Footer Pagination - Daily Logs Parity */}
            {/* 📑 Desktop Pagination Layer (Hidden on Mobile) */}
            <div className="hidden md:flex px-4 py-3 bg-white border-t border-gray-200 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <p className="text-[12px] text-gray-600 font-medium tracking-wide">
                  Showing <span className="font-medium text-gray-900">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-medium text-gray-900">{filteredData.length}</span> records
                </p>
                <div className="flex items-center gap-2 h-5">
                  <label className="text-[12px] text-gray-500 font-medium uppercase tracking-tighter opacity-70">Rows per page:</label>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-xs bg-transparent font-medium text-gray-700 outline-none cursor-pointer">
                    {[15, 30, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center w-auto justify-end">
                {renderPaginationNav()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 📱 Mobile Card View - Synced with Employee.jsx Aesthetic */}
      <div className="md:hidden flex flex-col h-[calc(105vh-280px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner minHeight="40px" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generating Analytics...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-2xl bg-white m-2">No analytics found.</div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 relative overflow-hidden active:scale-[0.98] transition-all duration-200 shadow-sm">
                
                {/* Card Header (Bleed Style) */}
                <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 rounded-full bg-indigo-500 shadow-sm" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter italic">#{item.empId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${item.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {item.status}
                  </span>
                </div>

                {/* Body: Identity & Main Metric */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-tight truncate tracking-tighter">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.analyticsMonth}</span>
                      <span className="h-1.5 w-[1px] bg-gray-200" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{item.department}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60 leading-none mb-1">Present</span>
                    <span className="text-sm font-black text-emerald-600 leading-none">{item.netPresent}</span>
                  </div>
                </div>

                {/* Secondary Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 text-center">
                  <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 opacity-60">Absents</span>
                    <span className="text-xs font-black text-rose-500">{item.totalAbsents}</span>
                  </div>
                  <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100/50 border-x border-gray-100">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 opacity-60">Late</span>
                    <span className="text-xs font-black text-gray-700">{item.lateMarks}</span>
                  </div>
                  <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5 opacity-60">Missed</span>
                    <span className="text-xs font-black text-gray-700">{item.missPunch}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 📱 Mobile Sticky Pagination (Synced with Employee.jsx) */}
        <div className="border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between w-full px-2 mb-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic opacity-60">Analytics Overview</p>
              <div className="flex items-center gap-2 h-5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Rows:</label>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-[10px] font-black text-indigo-600 bg-transparent outline-none">
                  {[15, 30, 50].map(val => <option key={val} value={val}>{val}</option>)}
                </select>
              </div>
           </div>
           {renderPaginationNav()}
        </div>
      </div>
    </div>
  );
};

export default Attendance;