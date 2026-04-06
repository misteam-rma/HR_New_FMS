import React, { useState, useEffect } from "react";
import { 
  Search, CheckCircle2, MessageSquare, Plus, Save, X, History, Clock, ChevronRight, UploadCloud
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { MOCK_FEEDBACK } from "../data/mockData";

const Feedback = () => {
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
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  
  // Dummy form states
  const [formData, setFormData] = useState({
    problem: "",
    description: "",
    screenShot: "",
    suggestion: "",
    email: ""
  });

  const [activeFeedback, setActiveFeedback] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const loggedInUser = JSON.parse(userString);
      setUser(loggedInUser);
    }
    
    setTimeout(() => {
      setData(MOCK_FEEDBACK);
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
      item.problem.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  // User Save Feedback
  const handleSave = () => {
    if (!formData.problem || !formData.description || !formData.email) {
      toast.error("Please fill Problem, Description, and Email fields.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      serialNo: data.length + 1,
      employeeCode: user.Code || "N/A",
      name: user.Name || "N/A",
      problem: formData.problem,
      description: formData.description,
      screenShot: formData.screenShot || "",
      suggestion: formData.suggestion,
      email: formData.email,
      status: "Pending",
      response: ""
    };

    setData([newEntry, ...data]);
    toast.success("Feedback submitted successfully!");
    setIsModalOpen(false);
    setFormData({ problem: "", description: "", screenShot: "", suggestion: "", email: "" });
  };

  // Admin Response Actions
  const openResponseModal = (item) => {
    setActiveFeedback(item);
    setAdminResponse(item.response || "");
    setIsResponseModalOpen(true);
  };

  const handleAdminResponse = () => {
    if (!adminResponse.trim()) {
      toast.error("Response cannot be empty.");
      return;
    }

    const updatedData = data.map(item => {
      if (item.id === activeFeedback.id) {
        return { ...item, status: "Responded", response: adminResponse };
      }
      return item;
    });

    setData(updatedData);
    toast.success("Response sent successfully!");
    setIsResponseModalOpen(false);
    setActiveFeedback(null);
  };

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-3 pb-20 md:pb-8 font-outfit">
      
      {/* 🛑 Admin Response Modal */}
      {isResponseModalOpen && activeFeedback && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsResponseModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                 <h3 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
                   <MessageSquare className="text-indigo-500" size={18}/> Problem Details & Response
                 </h3>
                 <button onClick={() => setIsResponseModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><X size={18} className="text-gray-400"/></button>
             </div>
             
             <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="col-span-1">
                   <p className="text-[10px] font-black text-gray-400 mb-0.5 uppercase tracking-widest">Employee</p>
                   <p className="text-sm font-bold text-gray-800">{activeFeedback.name} <span className="text-gray-500 font-medium">({activeFeedback.employeeCode})</span></p>
                </div>
                <div className="col-span-1">
                   <p className="text-[10px] font-black text-gray-400 mb-0.5 uppercase tracking-widest">Problem Classification</p>
                   <p className="text-sm font-bold text-gray-800">{activeFeedback.problem}</p>
                </div>
                <div className="col-span-2">
                   <p className="text-[10px] font-black text-gray-400 mb-0.5 uppercase tracking-widest">Description</p>
                   <p className="text-[13px] font-medium text-gray-600 bg-white p-3 rounded-lg border border-gray-100 italic">"{activeFeedback.description}"</p>
                </div>
                {activeFeedback.suggestion && (
                   <div className="col-span-2">
                     <p className="text-[10px] font-black text-gray-400 mb-0.5 uppercase tracking-widest">Suggestion Provided</p>
                     <p className="text-[13px] font-medium text-gray-600 bg-white p-3 rounded-lg border border-gray-100">{activeFeedback.suggestion}</p>
                   </div>
                )}
             </div>

             <div className="pt-2">
               <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-2 ml-1">Official Response Action</label>
               <textarea 
                  rows={4}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Type your formal response here to solve this ticket..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm resize-none shadow-inner"
               />
             </div>

             <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button onClick={() => setIsResponseModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all uppercase tracking-wider">Cancel</button>
                <button onClick={handleAdminResponse} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md shadow-indigo-200 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Resolve Issue</button>
             </div>
          </div>
        </div>
      )}

      {/* 📍 Main Add Form Modal (User Focus) */}
      {!isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-5 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 -mx-1 shrink-0">
                <h3 className="text-lg font-bold text-gray-800 tracking-tight ml-1">Submit Feedback Ticket</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="text-gray-400" size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 overflow-y-auto p-1 py-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Employee Code</label>
                  <input type="text" value={user?.Code || 'N/A'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Employee Name</label>
                  <input type="text" value={user?.Name || 'N/A'} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="you@company.com" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Problem <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.problem} onChange={(e) => setFormData({...formData, problem: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="e.g. Broken Equipment" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description <span className="text-red-400">*</span></label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm resize-none" placeholder="Provide detailed context..." />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Any Suggestion</label>
                  <textarea rows={2} value={formData.suggestion} onChange={(e) => setFormData({...formData, suggestion: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm resize-none" placeholder="If you have an idea to solve this, mention it here" />
                </div>

                <div className="col-span-2 border-t border-gray-100 pt-3 mt-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Upload a Screen Short</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm cursor-pointer transition-all h-12 group">
                      <UploadCloud size={18} className="text-gray-400 group-hover:text-indigo-500" />
                      <span className="group-hover:text-indigo-600 text-[11px] uppercase tracking-wider font-bold">Attach Evidence file</span>
                      <input type="file" className="hidden" onChange={(e) => setFormData({...formData, screenShot: e.target.files[0]?.name})} />
                  </label>
                  {formData.screenShot && <p className="text-[10px] text-green-600 mt-1 ml-1 font-bold truncate">✓ {formData.screenShot}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 mt-auto shrink-0 border-t border-gray-50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black transition-all shadow-md shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 🧩 Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="hidden md:block text-xl font-bold text-gray-800 tracking-tight shrink-0">
          {isAdmin ? "Company Feedback Logs" : "My Feedback Tickets"}
        </h2>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full md:w-auto flex-1">
          {/* Parity Search Bar */}
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input 
               type="text" 
               placeholder="Search Tickets..." 
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
                     <span className="hidden sm:inline">Completed</span>
                   </button>
                 </div>
               </>
             ) : (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="flex items-center justify-center gap-2 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-all duration-200 active:scale-95"
               >
                 <Plus size={14} />
                 <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Add Feedback</span>
               </button>
             )}
          </div>
        </div>
      </div>

      {/* 📊 Main Table Content Area - Desktop Table (Hidden on Mobile) */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] flex flex-col hidden md:flex min-w-[1000px] lg:min-w-full shadow-sm">
        {tableLoading ? (
           <div className="flex-1 flex items-center justify-center p-12">
             <LoadingSpinner message="Retrieving feedback logs..." minHeight="450px" />
           </div>
        ) : (
          <>
            <div className="table-container max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-max w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 w-full">
                  <tr>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Serial No</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee Code</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee Name</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Problem</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-w-[200px]">Description</th>
                    <th className="px-6 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Screen Short</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Suggestion</th>
                    {isAdmin && activeTab === "pending" && <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap sticky right-0 bg-gray-50 shadow-[auto_0px_10px_rgba(0,0,0,0.1)]">Action</th>}
                    {(!isAdmin || activeTab === "history") && <th className="px-6 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>}
                    {(!isAdmin || activeTab === "history") && <th className="px-6 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Response</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-24 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No matching records found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, id) => (
                      <tr key={item.id} className="hover:bg-indigo-50/10 transition-colors group">
                        <td className="px-4 py-3 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold">{item.serialNo}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                            <span className="text-[11px] font-bold text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest ">{item.employeeCode}</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-center text-[13px] text-gray-800 font-bold tracking-tight">{item.name}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-left text-[11px] text-gray-400 font-medium">{item.email}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-center text-xs text-indigo-700 font-black">{item.problem}</td>
                        <td className="px-6 py-3 text-left text-[11px] text-gray-500 font-medium max-w-[200px] truncate" title={item.description}>{item.description}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-center text-[10px] text-blue-500 underline cursor-pointer">{item.screenShot || "-"}</td>
                        <td className="px-6 py-3 text-left text-[11px] text-gray-500 max-w-[150px] truncate" title={item.suggestion}>{item.suggestion || "-"}</td>
                        
                        {isAdmin && activeTab === "pending" && (
                          <td className="px-6 py-3 whitespace-nowrap text-center sticky right-0 bg-white group-hover:bg-gray-50 transition-colors">
                             <button onClick={() => openResponseModal(item)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">Provide Response</button>
                          </td>
                        )}

                        {(!isAdmin || activeTab === "history") && (
                           <td className="px-6 py-3 whitespace-nowrap text-center">
                             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.status === 'Responded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                               {item.status}
                             </span>
                           </td>
                        )}

                        {(!isAdmin || activeTab === "history") && (
                           <td className="px-6 py-3 text-left">
                               <p className="text-[11px] font-medium text-gray-600 italic line-clamp-2" title={item.response}>{item.response || "Awaiting Admin Action"}</p>
                           </td>
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
                             </div>
                             {(!isAdmin || activeTab === "history") && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${item.status === 'Responded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {item.status}
                                </span>
                             )}
                         </div>
                         
                         {/* Body */}
                         <div className="flex justify-between items-start">
                           <div className="flex-1 min-w-0">
                               <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">{item.name}</h4>
                               <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wider">{item.email}</p>
                           </div>
                         </div>

                         <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                             <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest">{item.problem}</p>
                             <p className="text-[11px] font-medium text-gray-600 italic leading-snug line-clamp-2">"{item.description}"</p>
                         </div>

                         {/* Action Elements */}
                         {isAdmin && activeTab === 'pending' && (
                             <div className="flex pt-1 w-full mt-2">
                                <button onClick={() => openResponseModal(item)} className="w-full py-2 flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition-colors"><MessageSquare size={13}/> Provide Response</button>
                             </div>
                         )}

                         {(!isAdmin || activeTab === 'history') && item.response && (
                             <div className="text-[10px] font-medium mt-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                                 <span className="text-emerald-700 font-bold uppercase tracking-widest block mb-1">Admin Response:</span>
                                 <span className="text-gray-700 italic">{item.response}</span>
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

export default Feedback;
