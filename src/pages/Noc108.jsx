import React, { useState, useEffect } from "react";
import { 
  Search, CheckCircle2, XCircle, Plus, Save, X, History, Clock, ChevronRight
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { MOCK_NOC_108 } from "../data/mockData";

const Noc108 = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  
  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Tab and Modal States
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "history" for admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dummy form state
  const [formData, setFormData] = useState({
    employeeCode: "",
    department: "",
    name: "",
    teamHead: "",
    dateOfJoining: "",
    completionDate: "",
    regUnder: "",
    experience: "",
    totalLeaveDate: ""
  });

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const loggedInUser = JSON.parse(userString);
      setUser(loggedInUser);
    }
    
    // Simulate API fetch delay
    setTimeout(() => {
      setData(MOCK_NOC_108);
      setTableLoading(false);
    }, 600);
  }, []);

  if (!user) return null; // or redirect to login
  const isAdmin = user.Admin === "Yes";

  // Filter logic based on user & search
  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (isAdmin) {
      if (activeTab === "pending") {
        return item.status === "Pending";
      } else {
        return item.status !== "Pending";
      }
    } else {
      // User view: only show their own records
      return item.employeeCode === user.Code || item.name === user.Name;
    }
  });

  // Pagination Math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // document.querySelector('.table-container')?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages || 1)))].map((_, i) => (
        <button key={i} onClick={() => paginate(i+1)} className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold ${currentPage === (i+1) ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  // Handle form submission
  const handleSave = () => {
    if (!formData.teamHead || !formData.dateOfJoining || !formData.completionDate || !formData.regUnder || !formData.experience || !formData.totalLeaveDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const newEntry = {
      id: Date.now(),
      serialNo: data.length + 1,
      employeeCode: isAdmin ? formData.employeeCode : (user.Code || "N/A"),
      department: isAdmin ? formData.department : (user.Department || "N/A"),
      name: isAdmin ? formData.name : (user.Name || "N/A"),
      teamHead: formData.teamHead,
      dateOfJoining: formData.dateOfJoining,
      completionDate: formData.completionDate,
      regUnder: formData.regUnder,
      experience: formData.experience,
      totalLeaveDate: formData.totalLeaveDate,
      status: "Pending",
      approvalTime: null,
      approveBy: null
    };

    setData([newEntry, ...data]);
    toast.success("108 NOC form submitted successfully!");
    setIsModalOpen(false);
    setFormData({
      employeeCode: "", department: "", name: "", teamHead: "", dateOfJoining: "", completionDate: "", regUnder: "", experience: "", totalLeaveDate: ""
    });
  };

  // Admin action handles
  const handleAction = (id, actionType) => {
    const timeNow = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const updatedData = data.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: actionType === "approve" ? "Approved" : "Rejected",
          approvalTime: timeNow,
          approveBy: user.Name || "Admin"
        };
      }
      return item;
    });
    setData(updatedData);
    toast.success(`Request ${actionType === "approve" ? "Approved" : "Rejected"} successfully`);
  };

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-3 pb-20 md:pb-8 font-outfit">
      
      {/* 📍 Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 -mx-1">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight ml-1">Add 108 NOC</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="text-gray-400" size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {/* Dynamically Prefilled or Editable Fields */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Employee Code</label>
                  {isAdmin ? (
                    <input type="text" value={formData.employeeCode} onChange={(e) => setFormData({...formData, employeeCode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="e.g. EMP1001" />
                  ) : (
                    <input type="text" value={user?.Code || 'N/A'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm" />
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                  {isAdmin ? (
                    <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="e.g. HR" />
                  ) : (
                    <input type="text" value={user?.Department || 'N/A'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm" />
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Name</label>
                  {isAdmin ? (
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="Enter Full Name" />
                  ) : (
                    <input type="text" value={user?.Name || 'N/A'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm" />
                  )}
                </div>

                {/* User Input Fields */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Team Head</label>
                  <input type="text" value={formData.teamHead} onChange={(e) => setFormData({...formData, teamHead: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="Enter Team Head name" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Date of Joining</label>
                  <input type="date" value={formData.dateOfJoining} onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Completion Date</label>
                  <input type="date" value={formData.completionDate} onChange={(e) => setFormData({...formData, completionDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">REG Under</label>
                  <input type="text" value={formData.regUnder} onChange={(e) => setFormData({...formData, regUnder: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="Enter REG Under" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Experience</label>
                  <input type="text" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="e.g. 2 Years" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Total Leave Date</label>
                  <input type="number" value={formData.totalLeaveDate} onChange={(e) => setFormData({...formData, totalLeaveDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="Total Leaves (e.g. 5)" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black transition-all shadow-md shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 🧩 Header Section with Search integrated */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="hidden md:block text-xl font-bold text-gray-800 tracking-tight shrink-0">
          {isAdmin ? "108 NOC Management" : "My 108 NOC Requests"}
        </h2>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full md:w-auto flex-1">
          {/* Parity Search Bar */}
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input 
               type="text" 
               placeholder="Search by ID or Name..." 
               value={searchTerm} 
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
               className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-[13px] shadow-sm bg-white"
            />
          </div>

          <div className="flex justify-end items-center gap-2 lg:gap-3">
             {isAdmin ? (
               <>
                 <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm self-start lg:self-auto">
                   <button 
                     onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                     className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex justify-center items-center gap-2 ${activeTab === 'pending' ? 'bg-indigo-50 text-indigo-700 w-28 lg:w-32' : 'text-gray-500 hover:bg-gray-50 w-24 lg:w-28'}`}
                   >
                     <Clock size={14} className={activeTab === 'pending' ? 'text-indigo-600' : 'text-gray-400'} />
                     <span className="hidden sm:inline">Pending</span>
                   </button>
                   <button 
                     onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                     className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex justify-center items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 w-28 lg:w-32' : 'text-gray-500 hover:bg-gray-50 w-24 lg:w-28'}`}
                   >
                     <History size={14} className={activeTab === 'history' ? 'text-indigo-600' : 'text-gray-400'} />
                     <span className="hidden sm:inline">History</span>
                   </button>
                 </div>
                 <button 
                   onClick={() => setIsModalOpen(true)}
                   className="flex items-center justify-center gap-2 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-all duration-200 active:scale-95"
                 >
                   <Plus size={14} />
                   <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline">Add Request</span>
                 </button>
               </>
             ) : (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="flex items-center justify-center gap-2 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-all duration-200 active:scale-95"
               >
                 <Plus size={14} />
                 <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Add 108 NOC</span>
               </button>
             )}
          </div>
        </div>
      </div>

      {/* 📊 Main Table Content Area - Desktop Table (Hidden on Mobile) */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] flex flex-col hidden md:flex min-w-[1000px] lg:min-w-full">
        {tableLoading ? (
           <div className="flex-1 flex items-center justify-center p-12">
             <LoadingSpinner message="Retrieving logs..." minHeight="450px" />
           </div>
        ) : (
          <>
            <div className="table-container max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Serial No</th>
                    {isAdmin && activeTab === "pending" && <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Action</th>}
                    {(!isAdmin || activeTab === "history") && <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>}
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee Code</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Team Head</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date of Joining</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Completion Date</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">REG Under</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Experience</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Leave Date</th>
                    {isAdmin && activeTab === "history" && (
                      <>
                        <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Approval Time</th>
                        <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Approve By Name</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="px-6 py-24 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No matching records found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, id) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-2 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold">{item.serialNo}</td>
                        
                        {isAdmin && activeTab === "pending" && (
                          <td className="px-6 py-2 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                               <button onClick={() => handleAction(item.id, "approve")} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"><CheckCircle2 size={12}/> Approve</button>
                               <button onClick={() => handleAction(item.id, "reject")} className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"><XCircle size={12}/> Reject</button>
                            </div>
                          </td>
                        )}

                        {(!isAdmin || activeTab === "history") && (
                           <td className="px-6 py-2 whitespace-nowrap text-center">
                             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.status === 'Approved' ? 'bg-green-100 text-green-700' : (item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}`}>
                               {item.status}
                             </span>
                           </td>
                        )}

                        <td className="px-6 py-2 whitespace-nowrap text-center">
                            <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest italic">{item.employeeCode}</span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-bold uppercase tracking-tight">{item.department}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-700 font-bold tracking-tight">{item.name}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-medium">{item.teamHead}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-medium">{item.dateOfJoining}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-medium">{item.completionDate}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500">{item.regUnder}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500">{item.experience}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500">{item.totalLeaveDate}</td>
                        
                        {isAdmin && activeTab === "history" && (
                          <>
                            <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500">{item.approvalTime || "-"}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-medium text-indigo-600">{item.approveBy || "-"}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 📑 Desktop Pagination Layer Parity */}
            <div className="hidden md:flex px-4 py-3 bg-white border-t border-gray-200 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <p className="text-[13px] text-gray-600 font-medium tracking-wide">
                  Showing <span className="font-bold text-gray-900">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-bold text-gray-900">{filteredData.length}</span> records
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

       {/* 📱 Mobile Card View - Synced exactly with AttendanceDaily layout */}
       <div className="md:hidden flex flex-col h-[calc(105vh-280px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 w-full relative">
           <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide pb-24">
             {tableLoading ? (
                 <div className="py-20 flex flex-col items-center justify-center gap-3">
                   <LoadingSpinner minHeight="40px" />
                 </div>
             ) : currentItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-2xl bg-white m-2">No records found.</div>
             ) : (
                 currentItems.map((item, idx) => (
                     <div key={idx} className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-sm relative w-full active:scale-[0.98] transition-all duration-200">
                         {/* Card Header (Bleed Style) */}
                         <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                             <div className="flex items-center gap-1">
                                 <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">#{item.employeeCode}</span>
                             </div>
                             {(!isAdmin || activeTab === "history") && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${item.status === 'Approved' ? 'bg-green-100 text-green-700' : (item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}`}>
                                    {item.status}
                                </span>
                             )}
                         </div>
                         
                         {/* Body */}
                         <div className="flex justify-between items-start">
                           <div className="flex-1 min-w-0">
                               <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">{item.name}</h4>
                               <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{item.department} | Head: {item.teamHead}</p>
                           </div>
                         </div>

                         {/* Metrics Grid */}
                         <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Joining - Completion</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none">
                                   {item.dateOfJoining} - {item.completionDate}
                                </p>
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">REG Under</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none truncate">
                                   {item.regUnder}
                                </p>
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Experience</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none">
                                   {item.experience} 
                                </p>
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Total Leave Date</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none">
                                   {item.totalLeaveDate}
                                </p>
                             </div>
                         </div>

                         {/* Action Elements */}
                         {isAdmin && activeTab === 'pending' && (
                             <div className="flex gap-2 pt-2 border-t border-gray-50 w-full mt-2">
                                <button onClick={() => handleAction(item.id, "approve")} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm"><CheckCircle2 size={12}/> Approve</button>
                                <button onClick={() => handleAction(item.id, "reject")} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm"><XCircle size={12}/> Reject</button>
                             </div>
                         )}

                         {isAdmin && activeTab === 'history' && (
                             <div className="text-[9px] text-gray-400 text-right w-full mt-2 font-medium">
                                 Action on {item.approvalTime} by <span className="text-indigo-500">{item.approveBy}</span>
                             </div>
                         )}
                     </div>
                 ))
             )}
           </div>

           {/* 📱 Mobile Sticky Pagination */}
           <div className="absolute border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 bottom-0 w-full z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
               <div className="flex items-center justify-between w-full px-2 mb-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Page {currentPage} of {totalPages}</p>
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

export default Noc108;
