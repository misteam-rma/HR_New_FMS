import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { getCache, setCache } from "../utils/dataCache";
import toast from "react-hot-toast";

/* ------------------------------------------------------------------ */
/*  Shimmer Skeleton Loaders                                          */
/* ------------------------------------------------------------------ */
const ShimmerBar = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-gray-200/70 rounded ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const TableSkeleton = ({ columns = 9, rows = 10 }) => (
  <div className="flex flex-col w-full h-[530px] border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
    <div className="flex gap-0 bg-gray-50 border-b border-gray-200 px-2 py-3">
      {Array(columns).fill().map((_, j) => (
        <ShimmerBar key={j} className="h-4 flex-1 mx-2 rounded-sm" />
      ))}
    </div>
    <div className="flex-1 divide-y divide-gray-100 px-2">
      {Array(rows).fill().map((_, i) => (
        <div key={i} className="flex items-center gap-0 py-3">
          {Array(columns).fill().map((_, j) => (
            <ShimmerBar
              key={j}
              className={`h-3.5 flex-1 mx-2 rounded-sm ${j === 0 ? "max-w-[40px]" : ""
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

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
const Artical = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const abortControllerRef = useRef(null);

  // ------------------------------------------------------------------
  //  Fetch data from Apps Script using Proxy
  // ------------------------------------------------------------------
  const fetchData = useCallback(async (signal, isRefresh = false) => {
    // 1. Check Cache first (unless refreshing)
    if (!isRefresh) {
      const cachedData = getCache("article_data");
      if (cachedData) {
        console.log("🚀 Serving Article data from cache");
        setItems(cachedData);
        setIsLoading(false);
        return;
      }
    }

    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const url = "/api/articles";
      console.log("📡 Fetching Article data via proxy...");

      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      console.log("📦 Raw response received");

      if (!result.success) {
        throw new Error(result.error || "Request failed");
      }

      const rawData = result.data;
      if (!Array.isArray(rawData)) {
        throw new Error("Data is not an array");
      }

      let formattedData = [];
      const firstItem = rawData[0];
      const is2DArray = Array.isArray(firstItem);

      if (is2DArray) {
        // 2D array format – filter out empty rows
        const dataRows = rawData.filter(row => {
          const ts = String(row[0] || "").trim();
          const name = String(row[1] || "").trim();
          return ts !== "" || name !== "";
        });

        formattedData = dataRows.map((row, index) => ({
          id: `art-${row[2] || index}-${index}`,
          timestamp: row[0] || "-",
          nameOfArticle: row[1] || "-",
          croNumber: row[2] || "-",
          contactNo: row[3] || "-",
          address: row[4] || "-",
          uploadPassport: row[5] || "-",
          uploadResume: row[6] || "-",
          email: row[7] || "-",
          column1: row[8] || "-",
        }));
      } else {
        // Object array format – skip first two rows (metadata and headers)
        const dataRows = rawData.slice(0);
        console.log(`🔍 Total rows: ${rawData.length}, after slicing: ${dataRows.length}`);

        formattedData = dataRows.map((item, index) => ({
          id: item.croNumber ? `art-${item.croNumber}-${index}` : `art-${index}`,
          timestamp: item.timestamp || "-",
          nameOfArticle: item.nameOfArticle || "-",
          croNumber: item.croNumber || "-",
          contactNo: item.contactNo || "-",
          address: item.address || "-",
          uploadPassport: item.uploadPassport || "-",
          uploadResume: item.uploadResume || "-",
          email: item.email || "-",
          column1: item.column1 || "-",
        }));
      }

      console.log("✅ Formatted items:", formattedData.length);
      setItems(formattedData);

      // Update cache
      setCache("article_data", formattedData);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("❌ Fetch error:", error);
        toast.error(`Failed to load: ${error.message}`);
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

        // Numeric detection
        const aNum = parseFloat(String(aVal).replace(/[^0-9.-]/g, ""));
        const bNum = parseFloat(String(bVal).replace(/[^0-9.-]/g, ""));
        if (!isNaN(aNum) && !isNaN(bNum) && String(aVal).trim() && String(bVal).trim()) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        // Date detection (for timestamp)
        if (sortConfig.key === "timestamp") {
          const aDate = new Date(aVal);
          const bDate = new Date(bVal);
          if (!isNaN(aDate) && !isNaN(bDate)) {
            return sortConfig.direction === "asc"
              ? aDate.getTime() - bDate.getTime()
              : bDate.getTime() - aDate.getTime();
          }
        }

        // String comparison
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortConfig]
  );

  const user = useMemo(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    if (!user) return [];
    
    const userRole = String(user.role || "").trim().toLowerCase();
    const userCode = String(user.code || "").trim().toLowerCase();

    const isAdmin = 
      userRole === "admin" || 
      user.isAdmin === true ||
      user.Admin === "Yes" || 
      String(user.Admin).toLowerCase() === "yes" ||
      userCode === "admin";

    const baseItems = isAdmin
      ? items
      : userCode
        ? items.filter((item) => {
            const cro = String(item.croNumber || "").trim().toLowerCase();
            const contact = String(item.contactNo || "").trim().toLowerCase();
            return cro === userCode || contact === userCode;
          })
        : [];

    const term = searchTerm.toLowerCase().trim();
    const filtered = baseItems.filter((item) => {
      if (!term) return true;
      return (
        String(item.nameOfArticle || "").toLowerCase().includes(term) ||
        String(item.croNumber || "").toLowerCase().includes(term) ||
        String(item.email || "").toLowerCase().includes(term)
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
        <div className={`flex items-center gap-1.5 justify-${align === "center" ? "center" : align === "left" ? "start" : "end"
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
          className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold transition-colors ${currentPage === i + 1
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

  // Helper to truncate long file URLs
  const truncateUrl = (url) => {
    if (!url || url === "-") return "-";
    if (url.length > 30) return url.substring(0, 27) + "...";
    return url;
  };

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-4 pb-20 md:pb-8 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight shrink-0">Article Form Submissions</h2>

        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by Name, CRO or Email..."
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
            href={import.meta.env.VITE_ARTICLE_GOOGLEFORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <ExternalLink size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Fill Article Form</span>
          </a>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] shadow-sm">
        {isLoading ? (
          <TableSkeleton columns={9} rows={10} />
        ) : (
          <>
            <div className="table-container max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <SortHeader label="Timestamp" sortKey="timestamp" align="center" />
                    <SortHeader label="Name of Article" sortKey="nameOfArticle" align="left" />
                    <SortHeader label="CRO Number" sortKey="croNumber" align="center" />
                    <SortHeader label="Contact No." sortKey="contactNo" align="center" />
                    <SortHeader label="Address" sortKey="address" align="left" />
                    <SortHeader label="Upload Passport" sortKey="uploadPassport" align="center" />
                    <SortHeader label="Upload Resume" sortKey="uploadResume" align="center" />
                    <SortHeader label="Email" sortKey="email" align="left" />
                    <SortHeader label="Column 1" sortKey="column1" align="center" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr><td colSpan="9" className="px-6 py-24 text-center"><p className="text-gray-500 text-sm font-medium">No records found.</p></td></tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-medium">{item.timestamp || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-gray-900 font-medium">{item.nameOfArticle || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 uppercase tracking-wider">
                            {item.croNumber || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-medium">{item.contactNo || "-"}</td>
                        <td className="px-4 py-4 text-left text-sm text-gray-600 max-w-xs truncate" title={item.address}>{item.address || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          {item.uploadPassport && item.uploadPassport !== "-" ? (
                            <a href={item.uploadPassport} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium underline decoration-indigo-200" title={item.uploadPassport}>
                              View Passport
                            </a>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          {item.uploadResume && item.uploadResume !== "-" ? (
                            <a href={item.uploadResume} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium underline decoration-indigo-200" title={item.uploadResume}>
                              View Resume
                            </a>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-gray-600">{item.email || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{item.column1 || "-"}</td>
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
                <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100">
                  <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">CRO: {item.croNumber}</span>
                  <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">{item.nameOfArticle}</h4>
                  <p className="text-[10px] text-gray-500">{item.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-[11px]">
                  <div><span className="font-bold text-gray-400 block text-[9px] uppercase">Contact</span> {item.contactNo}</div>
                  <div><span className="font-bold text-gray-400 block text-[9px] uppercase">Column 1</span> {item.column1}</div>
                  <div className="col-span-2">
                    <span className="font-bold text-gray-400 block text-[9px] uppercase">Address</span>
                    <span className="text-xs">{item.address}</span>
                  </div>
                  <div className="col-span-2 flex gap-4 text-xs">
                    {item.uploadPassport !== "-" && <a href={item.uploadPassport} target="_blank" className="text-indigo-600 underline text-[10px]">📄 Passport</a>}
                    {item.uploadResume !== "-" && <a href={item.uploadResume} target="_blank" className="text-indigo-600 underline text-[10px]">📎 Resume</a>}
                  </div>
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

export default Artical;