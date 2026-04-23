import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Search, CheckCircle2, MessageSquare, Plus, Save, X, ChevronRight, UploadCloud, RefreshCw, ChevronUp, ChevronDown
} from "lucide-react";
import { getCache, setCache } from "../utils/dataCache";
import toast from "react-hot-toast";

// Shimmer bar: a single animated bone with a light-sweep overlay
const ShimmerBar = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-gray-200/70 rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

// Professional Skeleton Loader — mimics exact table structure
const TableSkeleton = ({ columns = 10, rows = 10 }) => (
  <div className="flex flex-col w-full h-[530px] border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
    {/* Header row */}
    <div className="flex gap-0 bg-gray-50 border-b border-gray-200 px-2 py-3">
      {Array(columns).fill().map((_, j) => (
        <ShimmerBar key={j} className="h-4 flex-1 mx-2 rounded-sm" />
      ))}
    </div>
    {/* Data rows */}
    <div className="flex-1 divide-y divide-gray-100 px-2">
      {Array(rows).fill().map((_, i) => (
        <div key={i} className="flex items-center gap-0 py-3">
          {Array(columns).fill().map((_, j) => (
            <ShimmerBar
              key={j}
              className={`h-3.5 flex-1 mx-2 rounded-sm ${
                j === 0 ? 'max-w-[40px]' :
                j === 4 ? 'max-w-[120px]' :
                j === columns - 1 ? 'max-w-[70px]' : ''
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Mobile card skeleton
const CardSkeleton = () => (
  <div className="space-y-3 p-2.5">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <ShimmerBar className="h-3 w-20" />
          <ShimmerBar className="h-4 w-16 rounded-full" />
        </div>
        <div className="space-y-2 pt-1">
          <ShimmerBar className="h-4 w-2/5" />
          <ShimmerBar className="h-3 w-1/3" />
        </div>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
          <ShimmerBar className="h-3 w-1/4" />
          <ShimmerBar className="h-3 w-full" />
          <ShimmerBar className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const FeedbackScreen = () => {
  const [user, setUser] = useState(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  });
  
  // Base Data & Loading states per standards
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setSearchItemsPerPage] = useState(15); // Fixed name for consistency

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const abortControllerRef = useRef(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  // Form state for user submission
  const [formData, setFormData] = useState({
    problem: "",
    description: "",
    screenShot: "",
    suggestion: "",
    email: ""
  });

  const [activeFeedback, setActiveFeedback] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");

  const fetchData = useCallback(async (signal, isRefresh = false) => {
    // 1. Check Cache first (unless refreshing)
    if (!isRefresh) {
      const cachedData = getCache("feedback_data");
      if (cachedData) {
        console.log("🚀 Serving Feedback data from cache");
        setItems(cachedData);
        setIsLoading(false);
        return;
      }
    }

    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const url = "/api/feedback";
      console.log("📡 Fetching feedback data via proxy...");
      
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      console.log("📦 Raw response received");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch sheet data");
      }

      const rows = result.data;
      if (rows.length < 2) {
        setItems([]);
        return;
      }

      const formattedData = rows.slice(1).map((row, index) => {
        const timestamp = row[0] || "";
        const name = row[1] || "—";
        const mobile = row[2] || "—";
        const problem = row[3] || "—";
        const description = row[4] || "—";
        const screenshot = row[5] || "";
        const suggestion = row[6] || "";
        const email = row[7] || "";
        const responseText = row[8] || "";
        const viewSentMail = row[9] || "";

        const status = responseText.trim() ? "Responded" : "Pending";

        return {
          id: `row-${index}-${timestamp}`,
          serialNo: index + 1,
          column1: timestamp,
          name,
          mobile,
          problem,
          description,
          screenshot,
          suggestion,
          email,
          response: responseText,
          viewSentMail,
          status,
          employeeCode: mobile || timestamp,
        };
      });

      setItems(formattedData);
      
      // Update cache
      setCache("feedback_data", formattedData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Fetch error:", error);
        toast.error("Could not load feedback data. Please try again.");
        setItems([]);
      }
    } finally {
      if (!signal.aborted) {
        if (isRefresh) setIsRefreshing(false);
        else setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const loggedInUser = JSON.parse(userString);
      setUser(loggedInUser);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchData(controller.signal, true);
  }, [fetchData]);

  const isAdmin = user?.role === "admin";

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedItems = useCallback((itemsToSort) => {
    if (!sortConfig.key) return itemsToSort;
    return [...itemsToSort].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      const aNum = parseFloat(String(aVal).replace(/[^0-9.-]/g, ''));
      const bNum = parseFloat(String(bVal).replace(/[^0-9.-]/g, ''));
      if (!isNaN(aNum) && !isNaN(bNum) && !(String(aVal).trim() === '') && !(String(bVal).trim() === '')) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      if (sortConfig.key.includes('date') || sortConfig.key === 'column1') {
        const aDate = new Date(aVal), bDate = new Date(bVal);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortConfig.direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        }
      }
      
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortConfig]);

  const filteredAndSortedItems = useMemo(() => {
    // Admins see all records; others see only their own by code.
    const userRole = (user?.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || user?.Admin === "Yes";
    const userCode = String(user?.code || "").trim().toLowerCase();
    const baseItems = isAdmin
      ? items
      : userCode
        ? items.filter(
            (item) =>
              String(item.employeeCode || "").trim().toLowerCase() === userCode ||
              String(item.mobile || "").trim().toLowerCase() === userCode
          )
        : [];

    const term = searchTerm.toLowerCase().trim();
    const filtered = baseItems.filter((item) => {
      if (!term) return true;
      return (
        String(item.name || "").toLowerCase().includes(term) ||
        String(item.employeeCode || "").toLowerCase().includes(term) ||
        String(item.problem || "").toLowerCase().includes(term)
      );
    });
    return getSortedItems(filtered);
  }, [items, user, searchTerm, getSortedItems]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto" aria-label="Pagination">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors" aria-label="Previous Page">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages || 1)))].map((_, i) => (
        <button key={i} onClick={() => paginate(i + 1)} className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold transition-colors ${currentPage === (i + 1) ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors" aria-label="Next Page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  const handleSave = () => {
    if (!formData.problem || !formData.description || !formData.email) {
      toast.error("Please fill Problem, Description, and Email fields.");
      return;
    }

    const newEntry = {
      id: `temp-${Date.now()}`,
      serialNo: items.length + 1,
      employeeCode: user.Code || "N/A",
      name: user.Name || "N/A",
      problem: formData.problem,
      description: formData.description,
      screenshot: formData.screenShot || "",
      suggestion: formData.suggestion,
      email: formData.email,
      status: "Pending",
      response: "",
      viewSentMail: "",
      column1: new Date().toISOString()
    };

    setItems([newEntry, ...items]);
    toast.success("Feedback submitted successfully!");
    setIsModalOpen(false);
    setFormData({ problem: "", description: "", screenShot: "", suggestion: "", email: "" });
  };

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

    const updatedData = items.map(item => {
      if (item.id === activeFeedback.id) {
        return { ...item, status: "Responded", response: adminResponse };
      }
      return item;
    });

    setItems(updatedData);
    toast.success("Response sent successfully!");
    setIsResponseModalOpen(false);
    setActiveFeedback(null);
  };

  const SortHeader = ({ label, sortKey, align = "center" }) => {
    const isActive = sortConfig.key === sortKey;
    const isAsc = isActive && sortConfig.direction === 'asc';
    return (
      <th 
        onClick={() => requestSort(sortKey)} 
        className={`px-4 py-3 text-${align} text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors select-none group focus:outline-none focus:ring-inset focus:ring-1 focus:ring-indigo-500`}
        tabIndex="0"
        onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); requestSort(sortKey); } }}
        aria-label={`Sort by ${label}`}
      >
        <div className={`flex items-center gap-1.5 justify-${align === 'center' ? 'center' : align === 'left' ? 'start' : 'end'}`}>
          {label}
          <div className="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity">
            <ChevronUp size={10} className={`${isActive && isAsc ? 'text-indigo-600 opacity-100' : 'text-gray-400'}`} />
            <ChevronDown size={10} className={`${isActive && !isAsc ? 'text-indigo-600 opacity-100' : 'text-gray-400'} -mt-1`} />
          </div>
        </div>
      </th>
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-4 pb-20 md:pb-8 font-outfit">

      {/* Admin Response Modal */}
      {isResponseModalOpen && activeFeedback && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsResponseModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
                <MessageSquare className="text-indigo-500" size={18} /> Problem Details & Response
              </h3>
              <button onClick={() => setIsResponseModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><X size={18} className="text-gray-400" /></button>
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
              <button onClick={handleAdminResponse} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md shadow-indigo-200 flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Resolve Issue</button>
            </div>
          </div>
        </div>
      )}

      {/* User Add Feedback Modal */}
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
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="you@company.com" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Problem <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.problem} onChange={(e) => setFormData({ ...formData, problem: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm" placeholder="e.g. Broken Equipment" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description <span className="text-red-400">*</span></label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm resize-none" placeholder="Provide detailed context..." />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Any Suggestion</label>
                  <textarea rows={2} value={formData.suggestion} onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm resize-none" placeholder="If you have an idea to solve this, mention it here" />
                </div>

                <div className="col-span-2 border-t border-gray-100 pt-3 mt-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Upload a Screenshot</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-xl px-3 py-2 text-gray-500 font-medium text-sm cursor-pointer transition-all h-12 group">
                    <UploadCloud size={18} className="text-gray-400 group-hover:text-indigo-500" />
                    <span className="group-hover:text-indigo-600 text-[11px] uppercase tracking-wider font-bold">Attach Evidence file</span>
                    <input type="file" className="hidden" onChange={(e) => setFormData({ ...formData, screenShot: e.target.files[0]?.name })} />
                  </label>
                  {formData.screenShot && <p className="text-[10px] text-green-600 mt-1 ml-1 font-bold truncate">✓ {formData.screenShot}</p>}
                </div>
              </div>

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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="hidden md:block text-xl font-bold text-gray-800 tracking-tight shrink-0">
          {isAdmin ? "All Feedback Logs" : "My Feedback Tickets"}
        </h2>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search Tickets..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-[13px] shadow-sm bg-white font-medium"
            />
          </div>

          <div className="flex justify-end items-center gap-2 lg:gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
              aria-label="Refresh Table"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline">Refresh</span>
            </button>
            {!isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all duration-200 active:scale-95"
              >
                <Plus size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Add Feedback</span>
              </button>
            )}
            <a
              href={import.meta.env.VITE_FEEDBACK_FORM}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all duration-200 active:scale-95"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Feedback Form</span>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] flex-col hidden md:flex min-w-[1000px] lg:min-w-full shadow-sm">
        {isLoading ? (
          <TableSkeleton columns={10} rows={10} />
        ) : (
          <>
            <div className="table-container max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-max w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 w-full shadow-sm">
                  <tr>
                    <SortHeader label="Serial No" sortKey="serialNo" align="center" />
                    <SortHeader label="Mobile / ID" sortKey="employeeCode" align="center" />
                    <SortHeader label="Name" sortKey="name" align="center" />
                    <SortHeader label="Email" sortKey="email" align="left" />
                    <SortHeader label="Problem" sortKey="problem" align="center" />
                    <SortHeader label="Description" sortKey="description" align="left" />
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Screenshot</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Suggestion</th>
                    <SortHeader label="Status" sortKey="status" align="center" />
                    <SortHeader label="Response" sortKey="response" align="left" />
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sent Mail</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-24 text-center">
                        <p className="text-gray-500 text-sm font-medium">No matching records found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-medium">{item.serialNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md uppercase tracking-wider">{item.mobile || item.employeeCode}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">{item.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-indigo-700 font-semibold">{item.problem}</td>
                        <td className="px-6 py-4 text-left text-sm text-gray-600 max-w-[200px] truncate" title={item.description}>{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                          {item.screenshot ? (
                            <a href={item.screenshot} target="_blank" rel="noopener noreferrer">View</a>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4 text-left text-sm text-gray-600 max-w-[150px] truncate" title={item.suggestion}>{item.suggestion || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${item.status === 'Responded' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <p className="text-sm text-gray-600 line-clamp-2" title={item.response}>{item.response || <span className="text-gray-400 italic">Awaiting Admin Action</span>}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {item.viewSentMail && item.viewSentMail !== "—" ? (
                            <a
                              href={item.viewSentMail}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline text-sm font-semibold"
                            >
                              📩 View
                            </a>
                          ) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="hidden md:flex px-4 py-3 bg-white border-t border-gray-200 flex-wrap items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-6 flex-wrap">
                <p className="text-[13px] text-gray-600 font-medium tracking-wide">
                  Showing <span className="font-bold text-gray-900">{filteredAndSortedItems.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredAndSortedItems.length)}</span> of <span className="font-bold text-gray-900">{filteredAndSortedItems.length}</span> records
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

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col h-[calc(105vh-280px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 w-full relative shadow-sm">
        <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide pb-24">
          {isLoading ? (
            <CardSkeleton />
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-2xl bg-white m-2">No records found.</div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-sm relative w-full active:scale-[0.98] transition-all duration-200">
                <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">#{item.mobile || item.employeeCode}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${item.status === 'Responded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.status}
                  </span>
                </div>

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

                {isAdmin && (
                  <div className="flex pt-1 w-full mt-2">
                    <button onClick={() => openResponseModal(item)} className="w-full py-2 flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition-colors"><MessageSquare size={13} /> Provide Response</button>
                  </div>
                )}

                {item.response && (
                  <div className="text-[10px] font-medium mt-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-emerald-700 font-bold uppercase tracking-widest block mb-1">Admin Response:</span>
                    <span className="text-gray-700 italic">{item.response}</span>
                  </div>
                )}
                {item.viewSentMail && (
                  <div className="text-right mt-2">
                    <a href={item.viewSentMail} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-[10px] font-bold">📩 View Sent Mail</a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Mobile Pagination */}
        <div className="absolute border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 bottom-0 w-full z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between w-full px-2 mb-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Page {currentPage} of {totalPages || 1}</p>
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

export default FeedbackScreen;