import React, { useState, useEffect } from "react";
import { 
  Search, CheckCircle2, XCircle, Plus, Save, X, History, Clock, ChevronRight, UploadCloud
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { MOCK_REIMBURSEMENTS, MOCK_PARTNERS, MOCK_USERS } from "../data/mockData";

const Reimbursement = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  
  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Tab and Modal States
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [remarks, setRemarks] = useState("");
  
  // Dummy form state
  const [formData, setFormData] = useState({
    employeeCode: "",
    name: "",
    visitDate: "",
    clientPlace: "",
    km: "",
    vehicleType: "",
    rateOfVehicle: "",
    partnerCode: "",
    partnerName: "",
    amount: "",
    billImage: ""
  });

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const loggedInUser = JSON.parse(userString);
      setUser(loggedInUser);
    }
    
    setTimeout(() => {
      setData(MOCK_REIMBURSEMENTS);
      setTableLoading(false);
    }, 600);
  }, []);

  if (!user) return null;
  const isAdmin = user.Admin === "Yes";

  // Filter logic based on user & search
  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientPlace.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (isAdmin) {
      if (activeTab === "pending") {
        return item.status === "Pending";
      } else {
        return item.status !== "Pending";
      }
    } else {
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

  // Form Change Handlers for Dropdowns
  const handlePartnerCodeChange = (e) => {
    const code = e.target.value;
    const partner = MOCK_PARTNERS.find(p => p.partnerCode === code);
    setFormData(prev => ({
      ...prev,
      partnerCode: code,
      partnerName: partner ? partner.partnerName : ""
    }));
  };

  const handlePartnerNameChange = (e) => {
    const name = e.target.value;
    const partner = MOCK_PARTNERS.find(p => p.partnerName === name);
    setFormData(prev => ({
      ...prev,
      partnerName: name,
      partnerCode: partner ? partner.partnerCode : ""
    }));
  };

  const handleEmployeeCodeChange = (e) => {
    const code = e.target.value;
    const emp = MOCK_USERS.find(u => u.Code === code);
    setFormData(prev => ({
      ...prev,
      employeeCode: code,
      name: emp ? emp.Name : ""
    }));
  };

  const handleEmployeeNameChange = (e) => {
    const name = e.target.value;
    const emp = MOCK_USERS.find(u => u.Name === name);
    setFormData(prev => ({
      ...prev,
      name: name,
      employeeCode: emp ? emp.Code : ""
    }));
  };

  // Handle Save
  const handleSave = () => {
    if (!formData.visitDate || !formData.clientPlace || !formData.km || !formData.amount) {
      toast.error("Please fill all required fields (Visit Date, Client Place, KM, Amount)");
      return;
    }

    const newEntry = {
      id: Date.now(),
      serialNo: data.length + 1,
      employeeCode: isAdmin ? formData.employeeCode : (user.Code || "N/A"),
      name: isAdmin ? formData.name : (user.Name || "N/A"),
      visitDate: formData.visitDate,
      clientPlace: formData.clientPlace,
      km: formData.km,
      vehicleType: formData.vehicleType,
      rateOfVehicle: formData.rateOfVehicle,
      partnerCode: formData.partnerCode,
      partnerName: formData.partnerName,
      amount: formData.amount,
      billImage: formData.billImage || "attached_bill.jpg",
      status: "Pending",
      approvalTime: null,
      approveBy: null,
      remarks: ""
    };

    setData([newEntry, ...data]);
    toast.success("Reimbursement form submitted successfully!");
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      employeeCode: "", name: "", visitDate: "", clientPlace: "", km: "",
      vehicleType: "", rateOfVehicle: "", partnerCode: "", partnerName: "", amount: "", billImage: ""
    });
  };

  // Action flow
  const initiateReject = (id) => {
    setRejectingId(id);
    setRemarks("");
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required for rejection");
      return;
    }
    processAction(rejectingId, "reject", remarks);
    setRejectModalOpen(false);
  };

  const processAction = (id, actionType, actionRemarks = "") => {
    const timeNow = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const updatedData = data.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: actionType === "approve" ? "Approved" : "Rejected",
          approvalTime: timeNow,
          approveBy: user.Name || "Admin",
          remarks: actionRemarks
        };
      }
      return item;
    });
    setData(updatedData);
    toast.success(`Request ${actionType === "approve" ? "Approved" : "Rejected"} successfully`);
  };

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-3 pb-20 md:pb-8 font-outfit">
      
      {/* 🛑 Reject Remarks Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-200">
             <h3 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2"><XCircle className="text-red-500"/> Reject Request</h3>
             <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Remarks (Required)</label>
               <textarea 
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm resize-none"
               />
             </div>
             <div className="flex gap-2">
                <button onClick={() => setRejectModalOpen(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all uppercase tracking-wider">Cancel</button>
                <button onClick={confirmReject} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all uppercase tracking-wider shadow-md shadow-red-200">Confirm Reject</button>
             </div>
          </div>
        </div>
      )}

      {/* 📍 Main Add Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-5 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 -mx-1 shrink-0">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight ml-1">Add Reimbursement</h3>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="text-gray-400" size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 overflow-y-auto p-1 py-2">
                
                {/* Employee Name & Code Mapping */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Employee Code</label>
                  {isAdmin ? (
                    <select value={formData.employeeCode} onChange={handleEmployeeCodeChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm">
                      <option value="">Select Code...</option>
                      {MOCK_USERS.map(u => <option key={u.Code} value={u.Code}>{u.Code}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={user?.Code || 'N/A'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm" />
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Employee Name</label>
                  {isAdmin ? (
                    <select value={formData.name} onChange={handleEmployeeNameChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm">
                      <option value="">Select Name...</option>
                      {MOCK_USERS.map(u => <option key={u.Name} value={u.Name}>{u.Name}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={user?.Name || 'N/A'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm" />
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Visit Date</label>
                  <input type="date" value={formData.visitDate} onChange={(e) => setFormData({...formData, visitDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Client Place</label>
                  <input type="text" value={formData.clientPlace} onChange={(e) => setFormData({...formData, clientPlace: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="e.g. Cyber Hub" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">KM Driven</label>
                  <input type="number" value={formData.km} onChange={(e) => setFormData({...formData, km: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="e.g. 25" />
                </div>
                <div className="col-span-2 sm:col-span-1 flex gap-2">
                   <div className="flex-1">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Vehicle Type</label>
                     <select value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm">
                        <option value="">Select</option>
                        <option value="2-Wheeler">2-Wheeler</option>
                        <option value="4-Wheeler">4-Wheeler</option>
                        <option value="Public Transport">Public Transport</option>
                     </select>
                   </div>
                   <div className="w-20">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">@ Rate</label>
                     <input type="number" value={formData.rateOfVehicle} onChange={(e) => setFormData({...formData, rateOfVehicle: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm mb-1" placeholder="₹" />
                   </div>
                </div>

                {/* Partner Routing */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Partner Code</label>
                  {isAdmin ? (
                    <select value={formData.partnerCode} onChange={handlePartnerCodeChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm">
                      <option value="">Select Code...</option>
                      {MOCK_PARTNERS.map(p => <option key={p.partnerCode} value={p.partnerCode}>{p.partnerCode}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={formData.partnerCode} onChange={(e) => setFormData({...formData, partnerCode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="Partner Code" />
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Partner Name</label>
                  {isAdmin ? (
                    <select value={formData.partnerName} onChange={handlePartnerNameChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm">
                      <option value="">Select Name...</option>
                      {MOCK_PARTNERS.map(p => <option key={p.partnerName} value={p.partnerName}>{p.partnerName}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={formData.partnerName} onChange={(e) => setFormData({...formData, partnerName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="Partner Name" />
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Total Amount (₹)</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xl shadow-inner text-indigo-600 font-black h-12" placeholder="₹ 0.00" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Bill Image</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm cursor-pointer transition-all h-12 group">
                      <UploadCloud size={18} className="text-gray-400 group-hover:text-indigo-500" />
                      <span className="group-hover:text-indigo-600 text-[11px] uppercase tracking-wider font-bold">Select File</span>
                      <input type="file" className="hidden" onChange={(e) => setFormData({...formData, billImage: e.target.files[0]?.name})} />
                  </label>
                  {formData.billImage && <p className="text-[10px] text-green-600 mt-1 ml-1 font-bold truncate">✓ {formData.billImage}</p>}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 mt-auto shrink-0 border-t border-gray-50">
                <button 
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black transition-all shadow-md shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 🧩 Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="hidden md:block text-xl font-bold text-gray-800 tracking-tight shrink-0">
          {isAdmin ? "Reimbursement Management" : "My Reimbursements"}
        </h2>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full md:w-auto flex-1">
          {/* Parity Search Bar */}
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input 
               type="text" 
               placeholder="Search by Place, Name, ID..." 
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
                 <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Add Reimbursement</span>
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
              <table className="min-w-max w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 w-full">
                  <tr>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Serial No</th>
                    {isAdmin && activeTab === "pending" && <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Action</th>}
                    {(!isAdmin || activeTab === "history") && <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>}
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee Code</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee Name</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Visit Date</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Client Place</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">KM</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Vehicle Type</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">@ of Vehicle</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Partner Code</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Partner Name</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Bill Image</th>
                    {isAdmin && activeTab === "history" && (
                      <>
                        <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Approve Time</th>
                        <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Approve By</th>
                        <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Remarks</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="18" className="px-6 py-24 text-center">
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
                               <button onClick={() => processAction(item.id, "approve")} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"><CheckCircle2 size={12}/> Approve</button>
                               <button onClick={() => initiateReject(item.id)} className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"><XCircle size={12}/> Reject</button>
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
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-700 font-bold tracking-tight">{item.name}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[11px] text-gray-500 font-medium">{item.visitDate}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-medium">{item.clientPlace}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-600 font-bold">{item.km}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500">{item.vehicleType}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500">{item.rateOfVehicle}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-600">{item.partnerCode}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-600">{item.partnerName}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-[13px] text-indigo-600 font-black">₹{item.amount}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-indigo-500 underline cursor-pointer">{item.billImage}</td>
                        
                        {isAdmin && activeTab === "history" && (
                          <>
                            <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500">{item.approvalTime || "-"}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-center text-xs text-gray-500 font-medium text-indigo-600">{item.approveBy || "-"}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-center text-[10px] text-rose-500 italic max-w-[150px] truncate" title={item.remarks}>{item.remarks || "-"}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 📑 Desktop Pagination Layer */}
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

       {/* 📱 Mobile Card View */}
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
                             <div className="flex items-center gap-2">
                                 <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">#{item.employeeCode}</span>
                                 <span className="text-[10px] font-bold text-gray-500">| {item.visitDate}</span>
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
                               <h4 className="text-[14px] font-black text-gray-800 uppercase tracking-tight">{item.name}</h4>
                               <p className="text-[11px] font-bold text-gray-500 mt-0.5 tracking-wide text-indigo-700">₹ {item.amount}</p>
                           </div>
                         </div>

                         {/* Metrics Grid */}
                         <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Client Place</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none">
                                   {item.clientPlace}
                                </p>
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Vehicle & KM</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none truncate">
                                   {item.vehicleType} ({item.km} KM)
                                </p>
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Partner Code</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none">
                                   {item.partnerCode}
                                </p>
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Partner Name</span>
                                <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5 leading-none">
                                   {item.partnerName}
                                </p>
                             </div>
                         </div>

                         {/* Action Elements */}
                         {isAdmin && activeTab === 'pending' && (
                             <div className="flex gap-2 pt-2 border-t border-gray-50 w-full mt-2">
                                <button onClick={() => processAction(item.id, "approve")} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm"><CheckCircle2 size={12}/> Approve</button>
                                <button onClick={() => initiateReject(item.id)} className="flex-1 py-1.5 flex items-center justify-center gap-1 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm"><XCircle size={12}/> Reject</button>
                             </div>
                         )}

                         {isAdmin && activeTab === 'history' && (
                             <div className="text-[9px] text-gray-400 text-right w-full mt-2 font-medium">
                                 Action on {item.approvalTime} by <span className="text-indigo-500">{item.approveBy}</span>
                                 {item.remarks && <p className="text-rose-500 text-[10px] mt-1 text-left bg-rose-50 p-1.5 rounded">{item.remarks}</p>}
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

export default Reimbursement;
