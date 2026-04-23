import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, RefreshCw, ChevronUp, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { getCache, setCache } from "../utils/dataCache";
import toast from "react-hot-toast";

const CACHE_KEY = "reimbursement_logs";

/* ------------------------------------------------------------------ */
/*  Shimmer Skeleton Loaders                                          */
/* ------------------------------------------------------------------ */
const ShimmerBar = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-gray-200/70 rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const TableSkeleton = ({ columns = 15, rows = 12 }) => (
  <div className="flex flex-col w-full h-full min-h-[530px] border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
    {/* Header row */}
    <div className="flex gap-0 bg-gray-50 border-b border-gray-200 px-2 py-3">
      {Array(columns).fill().map((_, j) => (
        <ShimmerBar key={j} className="h-4 flex-1 mx-2 rounded-sm" />
      ))}
    </div>
    {/* Body rows */}
    <div className="flex-1 divide-y divide-gray-100 px-2">
      {Array(rows).fill().map((_, i) => (
        <div key={i} className="flex items-center gap-0 py-3">
          {Array(columns).fill().map((_, j) => (
            <ShimmerBar
              key={j}
              className={`h-3.5 flex-1 mx-2 rounded-sm ${
                j === 0 ? "max-w-[50px]" : ""
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="space-y-3 p-2.5">
    {[1, 2, 3, 4, 5].map((i) => (
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

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                  */
/* ------------------------------------------------------------------ */
const formatDateTime = (dateValue) => {
  if (!dateValue) return "—";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateValue);
  }
};

const formatDateOnly = (dateValue) => {
  if (!dateValue) return "—";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(dateValue);
  }
};

const formatBillMonth = (dateValue) => {
  if (!dateValue) return "—";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateValue);
  }
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
const Reimbursement = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const user = useMemo(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []);

  const isAdmin = user?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const abortControllerRef = useRef(null);

  // ------------------------------------------------------------------
  //  Fetch data from Apps Script
  // ------------------------------------------------------------------
  const fetchData = useCallback(async (signal, isRefresh = false) => {
    if (!isRefresh) {
      const cachedData = getCache(CACHE_KEY);
      if (cachedData) {
        setItems(cachedData);
        setIsLoading(false);
        return;
      }
    }

    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const url = `${import.meta.env.VITE_REIMBURSEMENT_SHEET_URL}?action=getLogs`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      if (json.error) {
        throw new Error(json.error);
      }

      const formatted = json.map((item, index) => {
        const firstOf = (val) => {
          if (val == null) return "";
          return String(val).split(";")[0].trim();
        };

        return {
          id: `log-${index}-${item.timestamp || Date.now()}`,
          serialNo: index + 1,
          timestamp: item.timestamp,
          billMonth: item.billMonth,
          employeeCode: item.code,
          name: item.name,
          visitDate: firstOf(item.visitDate),
          clientPlace: firstOf(item.clientPlace),
          km: firstOf(item.km),
          totalKm: item.totalKm,
          vehicleType: item.vehicleType,
          rateOfVehicle: item.rateOfVehicle,
          partnerCode: firstOf(item.partnerCode),
          partnerName: firstOf(item.partnerName),
          amount: item.amount,
          attachment: item.attachment || "—",
        };
      });

      setItems(formatted);
      setCache(CACHE_KEY, formatted);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Fetch error:", error);
        toast.error("Failed to load reimbursement logs.");
        setItems([]);
      }
    } finally {
      if (!signal?.aborted) {
        if (isRefresh) setIsRefreshing(false);
        else setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
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

  // ------------------------------------------------------------------
  //  Sorting logic
  // ------------------------------------------------------------------
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortedItems = useCallback(
    (itemsToSort) => {
      if (!sortConfig.key) return itemsToSort;
      return [...itemsToSort].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        const aNum = parseFloat(String(aVal).replace(/[^0-9.-]/g, ""));
        const bNum = parseFloat(String(bVal).replace(/[^0-9.-]/g, ""));
        if (!isNaN(aNum) && !isNaN(bNum) && String(aVal).trim() && String(bVal).trim()) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        if (sortConfig.key.toLowerCase().includes("date") || sortConfig.key === "timestamp") {
          const aDate = new Date(aVal);
          const bDate = new Date(bVal);
          if (!isNaN(aDate) && !isNaN(bDate)) {
            return sortConfig.direction === "asc"
              ? aDate.getTime() - bDate.getTime()
              : bDate.getTime() - aDate.getTime();
          }
        }

        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortConfig]
  );

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
              String(item.employeeCode || "").trim().toLowerCase() === userCode
          )
        : [];

    const term = searchTerm.toLowerCase().trim();
    const filtered = baseItems.filter((item) => {
      if (!term) return true;
      return (
        String(item.name || "").toLowerCase().includes(term) ||
        String(item.employeeCode || "").toLowerCase().includes(term) ||
        String(item.clientPlace || "").toLowerCase().includes(term) ||
        String(item.partnerName || "").toLowerCase().includes(term) ||
        String(item.vehicleType || "").toLowerCase().includes(term) ||
        String(item.billMonth || "").toLowerCase().includes(term)
      );
    });
    return getSortedItems(filtered);
  }, [items, user, searchTerm, getSortedItems]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const SortHeader = ({ label, sortKey, align = "center" }) => {
    const isActive = sortConfig.key === sortKey;
    const isAsc = isActive && sortConfig.direction === "asc";
    return (
      <th
        onClick={() => requestSort(sortKey)}
        className={`px-4 py-3 text-${align} text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors select-none group`}
        tabIndex="0"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); requestSort(sortKey); } }}
        aria-label={`Sort by ${label}`}
      >
        <div className={`flex items-center gap-1.5 justify-${
          align === "center" ? "center" : align === "left" ? "start" : "end"
        }`}>
          {label}
          <div className="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity">
            <ChevronUp size={10} className={`${isActive && isAsc ? "text-indigo-600 opacity-100" : "text-gray-400"}`} />
            <ChevronDown size={10} className={`${isActive && !isAsc ? "text-indigo-600 opacity-100" : "text-gray-400"} -mt-1`} />
          </div>
        </div>
      </th>
    );
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto" aria-label="Pagination">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}
        className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages || 1)))].map((_, i) => (
        <button key={i} onClick={() => paginate(i + 1)}
          className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold transition-colors ${
            currentPage === i + 1
              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages}
        className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-4 pb-20 md:pb-8 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight shrink-0">Reimbursement Logs</h2>

        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by Name, Code, Place..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-[13px] shadow-sm bg-white font-medium"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
            aria-label="Refresh Table"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline">Refresh</span>
          </button>

          <a
            href="https://script.google.com/a/macros/carahulmishra.com/s/AKfycbyLtEmLJ3fZnfcurQLHy1dkvjxMlRmWCYK54ThN8-5n02D_qAymPyqIZmyho_eO_tEB8A/exec"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <ExternalLink size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">fill reimbursement form</span>
          </a>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] shadow-sm">
        {isLoading ? (
          <TableSkeleton columns={15} rows={12} />
        ) : (
          <>
            <div className="table-container max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <SortHeader label="S.No" sortKey="serialNo" align="center" />
                    <SortHeader label="Timestamp" sortKey="timestamp" align="center" />
                    <SortHeader label="Bill Month" sortKey="billMonth" align="center" />
                    <SortHeader label="Code" sortKey="employeeCode" align="center" />
                    <SortHeader label="Name" sortKey="name" align="center" />
                    <SortHeader label="Visit Date" sortKey="visitDate" align="center" />
                    <SortHeader label="Client Place" sortKey="clientPlace" align="center" />
                    <SortHeader label="KM" sortKey="km" align="center" />
                    <SortHeader label="Total KM" sortKey="totalKm" align="center" />
                    <SortHeader label="Vehicle" sortKey="vehicleType" align="center" />
                    <SortHeader label="@ Rate" sortKey="rateOfVehicle" align="center" />
                    <SortHeader label="Partner Code" sortKey="partnerCode" align="center" />
                    <SortHeader label="Partner Name" sortKey="partnerName" align="center" />
                    <SortHeader label="Amount" sortKey="amount" align="center" />
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Attachment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="15" className="px-6 py-24 text-center">
                        <p className="text-gray-500 text-sm font-medium">No records found.</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-400 font-bold">{item.serialNo}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-medium">{formatDateTime(item.timestamp)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-bold">{formatBillMonth(item.billMonth)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 uppercase tracking-wider">{item.employeeCode}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">{item.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-medium">{formatDateOnly(item.visitDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">{item.clientPlace}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-bold">{item.km}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-bold">{item.totalKm}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{item.vehicleType || "—"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{item.rateOfVehicle || "—"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">{item.partnerCode}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">{item.partnerName}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-black text-indigo-600">₹{item.amount}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-400">{item.attachment}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="hidden md:flex px-4 py-3 bg-white border-t border-gray-200 flex-wrap items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-6 flex-wrap">
                <p className="text-[13px] text-gray-600 font-medium tracking-wide">
                  Showing <span className="font-bold text-gray-900">{filteredAndSortedItems.length > 0 ? indexOfFirstItem + 1 : 0}</span> to{" "}
                  <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredAndSortedItems.length)}</span> of{" "}
                  <span className="font-bold text-gray-900">{filteredAndSortedItems.length}</span> records
                </p>
                <div className="flex items-center gap-2 h-5">
                  <label className="text-[13px] text-gray-500 font-medium whitespace-nowrap">Rows:</label>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="text-xs bg-transparent font-medium text-gray-700 outline-none cursor-pointer">
                    {[15, 30, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center w-auto justify-end">{renderPaginationNav()}</div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col h-[calc(105vh-280px)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 w-full relative shadow-sm">
        <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide pb-24">
          {isLoading ? <CardSkeleton /> : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-2xl bg-white m-2 opacity-60">No records found.</div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-sm relative w-full">
                <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                  <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">#{item.employeeCode}</span>
                  <span className="text-[10px] font-bold text-gray-500">{formatBillMonth(item.billMonth)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">{item.name}</h4>
                    <p className="text-[10px] font-bold text-indigo-700 mt-0.5">₹{item.amount}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Visit Date</span>
                    <p className="text-[10px] font-medium text-gray-600">{formatDateOnly(item.visitDate)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Client Place</span>
                    <p className="text-[10px] font-medium text-gray-600">{item.clientPlace}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Vehicle & KM</span>
                    <p className="text-[10px] font-medium text-gray-600">{item.vehicleType} ({item.km} / {item.totalKm} KM)</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60">Partner</span>
                    <p className="text-[10px] font-medium text-gray-600">{item.partnerCode} - {item.partnerName}</p>
                  </div>
                </div>
                <div className="text-[9px] text-gray-400 text-right w-full font-medium">
                  {formatDateTime(item.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="absolute border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 bottom-0 w-full z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between w-full px-2 mb-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Page {currentPage} of {totalPages || 1}</p>
            <div className="flex items-center gap-2 h-5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Rows:</label>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="text-[10px] font-black text-indigo-600 bg-transparent outline-none">
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