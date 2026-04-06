import React, { useState, useEffect } from 'react';
import {
  Search, X, Plus, Calendar, User, Briefcase, CheckCircle2,
  XCircle, Clock, Filter, ChevronRight, FileText, Download,
  ChevronLeft, History, Check, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import TableTabs from '../components/DataTable/TableTabs';

// 🌟 Executive Dummy Leave Data Generator
const generateDummyLeaveData = () => {
  const employees = [
    { id: "EMP1001", name: "Rahul Sharma", dept: "Engineering" },
    { id: "EMP1002", name: "Priya Patel", dept: "HR" },
    { id: "EMP1003", name: "Amit Kumar", dept: "Sales" },
    { id: "EMP1004", name: "Sneha Gupta", dept: "Finance" },
    { id: "EMP1005", name: "Vikram Singh", dept: "Operations" },
    { id: "EMP1006", name: "Anjali Desai", dept: "Marketing" },
    { id: "EMP1018", name: "Shweta Tiwari", dept: "Marketing" },
    { id: "EMP1019", name: "Manish Paul", dept: "Engineering" },
    { id: "EMP1020", name: "Kirti Sanon", dept: "HR" },
  ];

  const types = ["Casual Leave", "Earned Leave", "Sick Leave", "Comp-Off"];
  const reasons = [
    "Personal family matter", "Medical emergency", "Planned vacation",
    "Fever and rest", "Sister's wedding", "Urgent house repair",
    "Rest after project deadline", "Legal work", "Religious festival"
  ];

  const statuses = ["Pending", "Approved", "Rejected"];
  const data = [];

  for (let i = 1; i <= 60; i++) {
    const emp = employees[i % employees.length];
    const status = statuses[i % 3];
    const type = types[i % 4];
    const reason = reasons[i % reasons.length];

    // Dates logic
    const start = new Date(2024, 3, (i % 28) + 1);
    const end = new Date(start);
    const duration = (i % 4) + 1;
    end.setDate(start.getDate() + duration);

    data.push({
      timestamp: new Date().toLocaleString(),
      serialNo: 300 - i,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.dept,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      reason: reason,
      status: status,
      leaveType: type,
      leaveDays: duration,
      rowIndex: i + 1
    });
  }
  return data;
};

const DUMMY_LEAVE_DATA = generateDummyLeaveData();

const LeaveManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [rejectedLeaves, setRejectedLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: "",
    employeeName: "",
    startDate: "",
    endDate: "",
    leaveType: "Casual Leave"
  });

  const fetchLeaveData = () => {
    setLoading(true);
    setTimeout(() => {
      setPendingLeaves(DUMMY_LEAVE_DATA.filter(l => l.status === 'Pending'));
      setApprovedLeaves(DUMMY_LEAVE_DATA.filter(l => l.status === 'Approved'));
      setRejectedLeaves(DUMMY_LEAVE_DATA.filter(l => l.status === 'Rejected'));
      setLoading(false);
    }, 600);
  };

  useEffect(() => { fetchLeaveData(); }, []);

  const getActiveTabLeaves = () => {
    if (activeTab === 'pending') return pendingLeaves;
    if (activeTab === 'approved') return approvedLeaves;
    return rejectedLeaves;
  };

  const filteredLeaves = getActiveTabLeaves().filter(l =>
  (l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages)))].map((_, i) => (
        <button key={i} onClick={() => paginate(i + 1)} className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-semibold ${currentPage === (i + 1) ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  const renderMobileCard = (item) => {
    const statusColor = item.status === 'Approved' ? 'bg-emerald-500' :
      item.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500';

    return (
      <div key={item.rowIndex} className="bg-white rounded-xl border border-gray-200 p-2.5 space-y-2.5 relative overflow-hidden active:scale-[0.98] transition-all duration-200 shadow-sm mb-2.5">
        {/* Card Header (Bleed Style) */}
        <div className="flex justify-between items-center bg-gray-50/80 -mx-2.5 -mt-2.5 p-2 px-3 border-b border-gray-100 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className={`w-1 h-3.5 rounded-full ${statusColor}`} />
            <span className="font-semibold text-indigo-600 text-[10px] tracking-tighter uppercase">#{item.employeeId}</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest shadow-sm ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
              (item.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700')
            }`}>
            {item.status}
          </span>
        </div>

        {/* Body: Identity */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-semibold text-gray-800 uppercase tracking-tight truncate leading-none">{item.employeeName}</h4>
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-1 block">{item.department}</span>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1 opacity-60">Verified</span>
            <CheckCircle2 size={12} className="text-emerald-500" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-gray-50">
          <div className="space-y-0.5">
            <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest block opacity-70">Duration</span>
            <p className="text-[10px] font-medium text-gray-600 flex items-center gap-1 leading-none">
              <Clock size={10} className="text-indigo-400" />
              {item.startDate} → {item.endDate}
            </p>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest block opacity-70">Metric</span>
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-tighter">{item.leaveDays} DAYS</p>
          </div>
        </div>

        {/* Reason Section (Enhanced Note Style) */}
        <div className="bg-indigo-50/30 border border-indigo-100/50 p-2 rounded-lg">
          <span className="text-[8px] font-semibold text-indigo-400 uppercase tracking-widest block mb-0.5">Employee Reason</span>
          <p className="text-[10px] font-medium text-slate-600 italic leading-snug">"{item.reason || 'Professional leave request entry'}"</p>
        </div>

        {/* Action Bar */}
        {activeTab === 'pending' && (
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-50/50">
            <button
              onClick={() => handleAction('approve')}
              className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[9px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 active:scale-95 transition-all shadow-sm"
            >
              <Check size={10} strokeWidth={3} />
              Approve
            </button>
            <button
              onClick={() => handleAction('reject')}
              className="flex items-center gap-1.5 text-rose-600 font-semibold text-[9px] uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 active:scale-95 transition-all shadow-sm"
            >
              <X size={10} strokeWidth={3} />
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleAction = async (action) => {
    toast.loading(`Processing ${action}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Leave ${action}ed successfully!`);
      fetchLeaveData();
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Processing executive request...");

    setTimeout(() => {
      toast.success("Leave request registered successfully!", { id: toastId });
      setShowModal(false);
      setLeaveFormData({ employeeId: "", employeeName: "", startDate: "", endDate: "", leaveType: "Casual Leave" });
      setIsSubmitting(false);
      fetchLeaveData();
    }, 1500);
  };

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-2 pb-20 md:pb-8 font-outfit">
      {/* 🌟 Header Section - Professional Executive Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1 px-0.5 mt-1">
        <h2 className="hidden md:block text-xl font-semibold text-slate-800 tracking-tight whitespace-nowrap">Leave Management Logs</h2>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-3.5 w-full md:w-auto">
          {/* Table Tabs - Simplified Pill Design */}
          <TableTabs
            activeTab={activeTab}
            onTabChange={(id) => { setActiveTab(id); setCurrentPage(1); }}
            tabs={[
              { id: 'pending', label: `Pending`, count: pendingLeaves.length, icon: <Clock /> },
              { id: 'approved', label: `Approved`, icon: <CheckCircle2 /> },
              { id: 'rejected', label: `Rejected`, icon: <XCircle /> }
            ]}
          />

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 sm:w-60 group">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-1.5 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-[13px] shadow-sm bg-white/80 transition-all placeholder:text-slate-300 font-medium h-9"
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2.5 h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-300 active:scale-95 w-full sm:w-auto group overflow-hidden"
            >
              <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">New Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Main Table Area - Desktop Table structure with 1:1 parity */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] flex flex-col hidden md:flex min-w-[1000px] lg:min-w-full shadow-sm">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Retrieving leave records..." minHeight="450px" />
          </div>
        ) : (
          <>
            <div className="max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sr.</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Employee Code</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Full Name</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Category</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Department</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Reason</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Duration</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Total Days</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th className="px-6 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-24 text-center">
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">No matching records found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item.rowIndex} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-2 whitespace-nowrap text-center text-[10px] text-gray-400 font-medium">{item.serialNo}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-medium">{item.startDate}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                          <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest italic">#{item.employeeId}</span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-slate-800 font-semibold uppercase tracking-tight">{item.employeeName}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                          <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest border shadow-sm ${item.leaveType?.includes('Casual') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              item.leaveType?.includes('Sick') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            {item.leaveType}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-slate-700 font-semibold uppercase tracking-tight">{item.department}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-slate-500 italic truncate max-w-[150px]">"{item.reason || 'N/A'}"</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-slate-700 font-semibold uppercase tracking-tighter">{item.startDate} \u2192 {item.endDate}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[12px] text-indigo-600 font-semibold">{item.leaveDays}D</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest border shadow-sm ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {activeTab === 'pending' && (
                              <>
                                <button onClick={() => handleAction('approve')} className="px-3 py-1.5 bg-white text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-semibold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition shadow-sm active:scale-95">OK</button>
                                <button onClick={() => handleAction('reject')} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-100 rounded-lg text-[10px] font-semibold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition shadow-sm active:scale-95">NO</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="hidden md:flex px-4 py-3 bg-white border-t border-gray-200 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <p className="text-[13px] text-gray-600 font-medium tracking-wide">
                  Showing <span className="font-semibold text-gray-900">{filteredLeaves.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastItem, filteredLeaves.length)}</span> of <span className="font-semibold text-gray-900">{filteredLeaves.length}</span> records
                </p>
                <div className="flex items-center gap-2 h-5">
                  <label className="text-[13px] text-gray-500 font-medium whitespace-nowrap">Rows per page:</label>
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

      {/* 📱 Mobile Card View - Mirror of Daily Logs style */}
      <div className="md:hidden flex flex-col h-[calc(105vh-280px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner minHeight="40px" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Syncing Logs...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-semibold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-2xl bg-white m-2">No records found.</div>
          ) : (
            currentItems.map((item) => renderMobileCard(item))
          )}
        </div>

        <div className="border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between w-full px-2 mb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest italic">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2 h-5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest opacity-60">Rows:</label>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-[10px] font-semibold text-indigo-600 bg-transparent outline-none">
                {[15, 30, 50].map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
          </div>
          {renderPaginationNav()}
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl animate-in zoom-in duration-300 overflow-hidden border border-slate-100/50">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <FileText size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-800 tracking-tight leading-none">New Leave Request</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Employee portal entry</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3.5 gap-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-0.5">Employee ID *</label>
                  <input type="text" required placeholder="e.g. EMP1001" value={leaveFormData.employeeId} onChange={(e) => setLeaveFormData({ ...leaveFormData, employeeId: e.target.value })} className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-0.5">Employee Name *</label>
                  <input type="text" required placeholder="Full Name" value={leaveFormData.employeeName} onChange={(e) => setLeaveFormData({ ...leaveFormData, employeeName: e.target.value })} className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-0.5">Leave Category</label>
                  <div className="relative group">
                    <select value={leaveFormData.leaveType} onChange={(e) => { setLeaveFormData({ ...leaveFormData, leaveType: e.target.value }); }} className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer transition-all">
                      <option>Casual Leave</option>
                      <option>Earned Leave</option>
                      <option>Sick Leave</option>
                      <option>Comp-Off</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-0.5">Start Date *</label>
                  <input type="date" required value={leaveFormData.startDate} onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })} className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm uppercase tabular-nums" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-0.5">End Date *</label>
                  <input type="date" required value={leaveFormData.endDate} onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })} className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm uppercase tabular-nums" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-0.5">Reason for Request *</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Briefly describe the reason for your leave request..."
                    value={leaveFormData.reason}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-indigo-600 text-white text-[11px] font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50">
                  {isSubmitting ? "Processing..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;