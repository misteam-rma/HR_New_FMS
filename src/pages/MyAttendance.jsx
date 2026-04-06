import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, MapPin, Search, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { MOCK_ATTENDANCE } from '../data/mockData';

const MyAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [userAttendanceData, setUserAttendanceData] = useState([]);
  const [activeTab, setActiveTab] = useState('monthly');
  
  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const getUsername = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return parsedUser.username || parsedUser.Name || parsedUser.salesPersonName || '';
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  const fetchReportDailySheet = () => {
    setLoading(true);
    setTimeout(() => {
      const mockReportData = MOCK_ATTENDANCE.map(item => ({
        Date: item.date,
        Name: item.name,
        "In Time": item.punchIn,
        "Out Time": item.punchOut,
        Status: item.status,
        "Working Hours": item.status === "Absent" ? "0.0" : (item.status === "Late" ? "8.2" : "9.0"),
        "Punch Status": item.location,
        Latitude: "28.6139",
        Longitude: "77.2090"
      }));
      setAttendanceData(mockReportData);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    const username = getUsername();
    if (username && attendanceData.length > 0) {
      const filteredData = attendanceData.filter(record => {
        const nameInSheet = record['Name'] || record['name'] || record['G'] || '';
        return nameInSheet.toLowerCase().includes(username.toLowerCase());
      }).reverse();
      setUserAttendanceData(filteredData);
    }
  }, [attendanceData]);

  useEffect(() => {
    fetchReportDailySheet();
  }, []);

  const getStatus = (record) => {
    const status = record['Status'] || record['status'] || record['L'] || '';
    if (status && status !== '' && status !== '-') return status;
    return (record['Check In'] || record['In Time']) ? 'Present' : 'Absent';
  };

  const getStatusColor = (status) => {
    if (!status) return 'slate';
    const s = status.toLowerCase();
    if (s.includes('present')) return 'emerald';
    if (s.includes('absent')) return 'rose';
    if (s.includes('late')) return 'amber';
    if (s.includes('holiday')) return 'indigo';
    return 'slate';
  };

  // 1. Data Processing
  const filteredDaily = userAttendanceData.filter(record => {
    const status = getStatus(record);
    const searchMatch = !searchTerm || 
      (record.Date && record.Date.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (status && status.toLowerCase().includes(searchTerm.toLowerCase()));
    return searchMatch;
  });

  const filteredMonthly = filteredDaily.filter(record => {
    const dateValue = record.Date || record.date || record['C'] || '';
    if (!dateValue) return false;
    try {
      let recordDate;
      if (dateValue.includes('-')) {
        const [year, month, day] = dateValue.split('-').map(Number);
        recordDate = new Date(year, month - 1, day);
      } else if (dateValue.includes('/')) {
        const parts = dateValue.split('/');
        recordDate = new Date(parts[2], parts[1] - 1, parts[0]);
      } else return true;
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    } catch (e) { return true; }
  });

  // Calculate stats for monthly view exactly
  const presentDays = filteredMonthly.filter(record => {
    const status = getStatus(record).toLowerCase();
    return status.includes('present') || status.includes('holiday');
  }).length;
  
  const absentDays = filteredMonthly.filter(record => {
    const status = getStatus(record).toLowerCase();
    return status.includes('absent');
  }).length;
  
  const totalWorkingHours = filteredMonthly.reduce((sum, record) => {
    const hours = parseFloat(record['Working Hours'] || '0');
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);
  
  const totalOvertime = filteredMonthly.reduce((sum, record) => {
    const ot = parseFloat(record['Overtime Hours'] || '0');
    return sum + (isNaN(ot) ? 0 : ot);
  }, 0);

  // Pagination Logic
  const activeDataset = activeTab === 'monthly' ? filteredMonthly : filteredDaily;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeDataset.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeDataset.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages || 1)))].map((_, i) => (
        <button key={i} onClick={() => paginate(i+1)} className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold ${currentPage === (i+1) ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm" : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"}`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2024, 2025, 2026];

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-4 pb-20 md:pb-8 font-outfit">
      
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Attendance History</h1>
           <p className="text-slate-500 text-sm font-medium">Track your presence and work duration logs.</p>
        </div>
        
        {/* Parity Search Bar */}
        <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
            <input 
               type="text" 
               placeholder="Search Logs..." 
               value={searchTerm} 
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
               className="pl-9 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-[13px] shadow-sm bg-white"
            />
        </div>
      </div>

      {/* Unified Filter Toolbar */}
      <div className="bg-white/60 backdrop-blur-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/60 shadow-sm">
         <div className="flex p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar justify-between md:justify-start">
            <button
              onClick={() => { setActiveTab('monthly'); setCurrentPage(1); }}
              className={`flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar size={16} /> Monthly
            </button>
            <button
              onClick={() => { setActiveTab('daily'); setCurrentPage(1); }}
              className={`flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'daily' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock size={16} /> Daily Feed
            </button>
         </div>

         {activeTab === 'monthly' && (
             <div className="flex items-center gap-3 w-full md:w-auto">
                 <select
                   value={selectedMonth}
                   onChange={(e) => { setSelectedMonth(parseInt(e.target.value)); setCurrentPage(1); }}
                   className="flex-1 md:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                 >
                   {months.map((month, index) => <option key={index} value={index}>{month}</option>)}
                 </select>
                 <select
                   value={selectedYear}
                   onChange={(e) => { setSelectedYear(parseInt(e.target.value)); setCurrentPage(1); }}
                   className="flex-1 md:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                 >
                   {years.map(year => <option key={year} value={year}>{year}</option>)}
                 </select>
             </div>
         )}
      </div>

      {activeTab === 'monthly' && (
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Present', value: presentDays, icon: CheckCircle, color: 'emerald' },
              { label: 'Absent', value: absentDays, icon: XCircle, color: 'rose' },
              { label: 'Hrs Worked', value: totalWorkingHours.toFixed(1), icon: Clock, color: 'indigo' },
              { label: 'Overtime', value: totalOvertime.toFixed(1), icon: Clock, color: 'amber' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md flex flex-col gap-2">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600 mb-1`}>
                      <Icon size={20} />
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                </div>
              );
            })}
         </div>
      )}

      {/* 📊 Main Data Grid - Desktop */}
      <div className="hidden md:flex flex-col bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden min-h-[500px]">
         {loading ? (
           <div className="flex-1 flex items-center justify-center min-h-[400px]">
             <LoadingSpinner message="Syncing records..." />
           </div>
         ) : error ? (
           <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
             <p className="text-rose-500 font-bold mb-3">{error}</p>
             <button onClick={fetchReportDailySheet} className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-100">Retry</button>
           </div>
         ) : (
           <>
             <div className="table-container max-h-[calc(105vh-320px)] min-h-[450px] overflow-y-auto scrollbar-hide w-full">
               <table className="w-full text-left border-collapse min-w-full">
                  <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/60">Date Phase</th>
                      {activeTab === 'daily' && <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/60">Work Location</th>}
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/60 text-center">In / Out</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/60 text-center">Duration</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/60 text-right">Status Focus</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {currentItems.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-24 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">No matching records found.</td></tr>
                    ) : currentItems.map((record, index) => {
                      const status = getStatus(record);
                      const color = getStatusColor(status);
                      return (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-slate-800">{record.Date || '-'}</p>
                            <p className="text-[11px] font-medium text-slate-400 uppercase mt-1 tracking-wider">{record.Day || 'Logged Entry'}</p>
                          </td>
                          {activeTab === 'daily' && (
                             <td className="px-6 py-4">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">{record['Punch Status'] || 'Office'}</span>
                                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{record['Client Name'] || 'On-Site HQ'}</span>
                                   </div>
                                </div>
                             </td>
                          )}
                          <td className="px-6 py-4 text-center">
                             <div className="flex items-center justify-center gap-2">
                               <span className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm">{record['In Time'] || record['Check In'] || '--:--'}</span>
                               <span className="text-slate-300 font-bold">→</span>
                               <span className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm">{record['Out Time'] || record['Check Out'] || '--:--'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                             <span className="px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest shadow-sm leading-none inline-block">{record['Working Hours'] || '0.0'} HRS</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-${color}-100 text-${color}-700`}>{status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
               </table>
             </div>
             {/* Desktop Pagination */}
             <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <p className="text-[13px] text-slate-600 font-medium">Showing <span className="font-bold text-slate-900">{activeDataset.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, activeDataset.length)}</span> of <span className="font-bold text-slate-900">{activeDataset.length}</span></p>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-xs font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg outline-none cursor-pointer">
                    {[15, 30, 50].map(val => <option key={val} value={val}>{val} Rows</option>)}
                  </select>
                </div>
                {renderPaginationNav()}
             </div>
           </>
         )}
      </div>

       {/* 📱 Mobile Parity Card View */}
       <div className="md:hidden flex flex-col h-[calc(105vh-280px)] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 w-full relative">
         <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide pb-24">
             {loading ? (
                 <div className="py-20 flex justify-center"><LoadingSpinner minHeight="40px" /></div>
             ) : currentItems.length === 0 ? (
                 <div className="py-24 text-center mt-2 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-400 text-xs font-bold uppercase tracking-widest">No entries logged</div>
             ) : currentItems.map((record, index) => {
                const status = getStatus(record);
                const color = getStatusColor(status);
                return (
                   <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 space-y-3 w-full">
                      {/* Card Header bleed */}
                      <div className="flex justify-between items-center bg-slate-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-slate-100 mb-0.5">
                         <span className="font-black text-slate-700 text-xs tracking-tight">{record.Date || '-'}</span>
                         <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm bg-${color}-100 text-${color}-700`}>{status}</span>
                      </div>
                      
                      <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between border border-slate-100">
                         <div className="text-center flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Punch In</p>
                            <p className="text-sm font-black text-slate-800">{record['In Time'] || record['Check In'] || '--:--'}</p>
                         </div>
                         <div className="w-px h-8 bg-slate-200 mx-2"></div>
                         <div className="text-center flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Punch Out</p>
                            <p className="text-sm font-black text-slate-800">{record['Out Time'] || record['Check Out'] || '--:--'}</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                         <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-indigo-500" />
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{record['Working Hours'] || '0.0'} HRS</span>
                         </div>
                         {activeTab === 'daily' && (
                            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded shadow-sm uppercase tracking-widest">{record['Punch Status'] || 'Office'}</span>
                         )}
                      </div>
                   </div>
                )
             })}
         </div>

         {/* Sticky Mobile Footer Pagination */}
         <div className="absolute border-t border-slate-200 bg-white p-2.5 flex flex-col items-center gap-2 bottom-0 w-full z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
             <div className="flex items-center justify-between w-full px-2 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Page {currentPage} of {totalPages}</p>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-[10px] font-black text-indigo-600 bg-transparent outline-none">
                   {[15, 30, 50].map(val => <option key={val} value={val}>{val} Rows</option>)}
                </select>
             </div>
             {renderPaginationNav()}
         </div>
       </div>

    </div>
  );
};

export default MyAttendance;