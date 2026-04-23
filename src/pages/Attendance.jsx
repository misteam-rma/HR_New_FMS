import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MapPin,
  Filter,
  Calendar,
  X,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { getCache, setCache } from "../utils/dataCache";
import toast from "react-hot-toast";

const CACHE_KEY = "attendance_daily";

/* ------------------------------------------------------------------ */
/*  Custom Hook: useDebounce                                          */
/* ------------------------------------------------------------------ */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/* ------------------------------------------------------------------ */
/*  Shimmer Skeleton Loaders                                          */
/* ------------------------------------------------------------------ */
const ShimmerBar = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-gray-200/70 rounded ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const TableSkeleton = ({ columns = 14, rows = 10 }) => (
  <div className="flex flex-col w-full h-[530px] border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
    <div className="flex gap-0 bg-gray-50 border-b border-gray-200 px-2 py-3">
      {Array(columns)
        .fill()
        .map((_, j) => (
          <ShimmerBar key={j} className="h-4 flex-1 mx-2 rounded-sm" />
        ))}
    </div>
    <div className="flex-1 divide-y divide-gray-100 px-2">
      {Array(rows)
        .fill()
        .map((_, i) => (
          <div key={i} className="flex items-center gap-0 py-3">
            {Array(columns)
              .fill()
              .map((_, j) => (
                <ShimmerBar
                  key={j}
                  className={`h-3.5 flex-1 mx-2 rounded-sm ${j === 0 ? "max-w-[40px]" : j === 4 ? "max-w-[120px]" : ""
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
      <div
        key={i}
        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3"
      >
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
      second: "2-digit",
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

const formatTime = (timeValue) => {
  if (!timeValue) return "—";
  try {
    const timeStr = String(timeValue).trim();
    if (timeStr === "—") return "—";

    // Try parsing as ISO time format (HH:MM:SS)
    if (timeStr.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
      const parts = timeStr.split(":");
      const hours = String(parts[0]).padStart(2, "0");
      const minutes = String(parts[1] || "00").padStart(2, "0");
      const seconds = parts[2] ? String(parts[2]).padStart(2, "0") : null;
      return seconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    }

    // Try parsing as date object
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    return String(timeValue);
  } catch {
    return String(timeValue);
  }
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
const Attendance = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get user data from localStorage (contains redirectUrl and attendanceUrl)
  const user = useMemo(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []);

  // Extract both URLs from the logged‑in user
  const redirectUrl = user?.redirectUrl || import.meta.env.VITE_DAILY_ATTENDENCE_SHEET_URL;
  const attendanceUrl = user?.attendanceUrl || "#";

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);

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
      const url = `${import.meta.env.VITE_DAILY_ATTENDENCE_SHEET_URL}?action=getEmployeesAttendance`;
      const response = await fetch(url, { signal });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      // Convert all fields to strings to avoid type errors later
      const formatted = json.map((item, index) => ({
        id: `emp-${index}-${item.timestamp || Date.now()}`,
        timestamp: String(item.timestamp ?? "—"),
        role: String(item.role ?? "—"),
        code: String(item.code ?? "—"),
        punchStatus: String(item.punchStatus ?? "—"),
        clientName: String(item.clientName ?? "—"),
        latitude: String(item.latitude ?? "—"),
        longitude: String(item.longitude ?? "—"),
        imageUrl: String(item.imageUrl ?? "—"),
        date: String(item.date ?? "—"),
        time: String(item.time ?? "—"),
        department: String(item.department ?? "—"),
        staffName: String(item.staffName ?? "—"),
        address: String(item.address ?? "—"),
        locationStatus: String(item.locationStatus ?? "—"),
      }));

      setItems(formatted);
      setCache(CACHE_KEY, formatted);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Fetch error:", error);
        toast.error("Failed to load attendance logs.");
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
  //  Clear all filters
  // ------------------------------------------------------------------
  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    setFilterDepartment("");
    setFilterDate("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchInput || filterDepartment || filterDate;

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
        if (
          !isNaN(aNum) &&
          !isNaN(bNum) &&
          String(aVal).trim() &&
          String(bVal).trim()
        ) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        if (
          sortConfig.key.toLowerCase().includes("date") ||
          sortConfig.key === "timestamp"
        ) {
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
    [sortConfig],
  );

  // Data Isolation: Admins see all records; others see only their own by code.
  const roleFilteredItems = useMemo(() => {
    if (!user) return [];
    
    // Look deeply into the cached user object for any capitalized versions of Role or column H 
    const cachedRole = String(
      user.role || user.Role || user.ROLE || user.H || ""
    ).trim().toLowerCase();
    
    const userCode = String(user.code || "").trim().toLowerCase();

    // Check role from the master data (items) as well
    const currentUserData = items.find(
      (item) => String(item.code ?? "").trim().toLowerCase() === userCode
    );
    const masterRole = currentUserData ? String(currentUserData.role || currentUserData.Role || currentUserData.ROLE || currentUserData.H || "").trim().toLowerCase() : "";

    const isAdmin = 
      cachedRole === "admin" || 
      user.Admin === "Yes" || 
      String(user.Admin).toLowerCase() === "yes" ||
      masterRole === "admin" ||
      userCode === "admin";

    if (isAdmin) return items;
    if (!userCode) return [];
    
    return items.filter(
      (item) => String(item.code || "").trim().toLowerCase() === userCode
    );
  }, [items, user]);

  // Enhanced search across many fields
  const filteredAndSortedItems = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase().trim();
    const filtered = roleFilteredItems.filter((item) => {
      const matchesSearch = !term
        ? true
        : String(item.staffName ?? "")
          .toLowerCase()
          .includes(term) ||
        String(item.code ?? "")
          .toLowerCase()
          .includes(term) ||
        String(item.clientName ?? "")
          .toLowerCase()
          .includes(term) ||
        String(item.role ?? "")
          .toLowerCase()
          .includes(term) ||
        String(item.department ?? "")
          .toLowerCase()
          .includes(term) ||
        String(item.address ?? "")
          .toLowerCase()
          .includes(term) ||
        String(item.locationStatus ?? "")
          .toLowerCase()
          .includes(term);
      const matchesDept =
        !filterDepartment || item.department === filterDepartment;
      const matchesDate = !filterDate || (() => {
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === filterDate;
        }
        return String(item.date).includes(filterDate);
      })();
      return matchesSearch && matchesDept && matchesDate;
    });
    return getSortedItems(filtered);
  }, [
    items,
    debouncedSearchTerm,
    filterDepartment,
    filterDate,
    getSortedItems,
  ]);

  const departments = useMemo(() => {
    const depts = [...new Set(items.map((d) => d.department).filter(Boolean))];
    return depts.sort();
  }, [items]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedItems.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            requestSort(sortKey);
          }
        }}
        aria-label={`Sort by ${label}`}
      >
        <div
          className={`flex items-center gap-1.5 justify-${align === "center" ? "center" : align === "left" ? "start" : "end"
            }`}
        >
          {label}
          <div className="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity">
            <ChevronUp
              size={10}
              className={`${isActive && isAsc ? "text-indigo-600 opacity-100" : "text-gray-400"}`}
            />
            <ChevronDown
              size={10}
              className={`${isActive && !isAsc ? "text-indigo-600 opacity-100" : "text-gray-400"} -mt-1`}
            />
          </div>
        </div>
      </th>
    );
  };

  const renderPaginationNav = () => (
    <nav
      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto"
      aria-label="Pagination"
    >
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages || 1)))].map((_, i) => (
        <button
          key={i}
          onClick={() => paginate(i + 1)}
          className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold transition-colors ${currentPage === i + 1
            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm"
            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-4 pb-20 md:pb-8 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight shrink-0">
          Daily Attendance Logs
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full md:w-auto flex-1">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by Name, Code, Client..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full text-[13px] shadow-sm bg-white font-medium transition-all"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setCurrentPage(1);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className={`flex items-center gap-2 h-9 px-4 bg-white border ${filterDepartment ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200"} hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-200 whitespace-nowrap`}
            >
              <Filter size={14} className={filterDepartment ? "text-indigo-600" : "text-gray-500"} />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${filterDepartment ? "text-indigo-700" : "text-gray-700"}`}>
                {filterDepartment || "All Dept"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${isDeptDropdownOpen ? "rotate-180" : ""} ${filterDepartment ? "text-indigo-600" : "text-gray-400"}`}
              />
            </button>
            {isDeptDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDeptDropdownOpen(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                  <div
                    onClick={() => {
                      setFilterDepartment("");
                      setIsDeptDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 text-[11px] cursor-pointer hover:bg-gray-50 ${!filterDepartment ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-600"}`}
                  >
                    All Departments
                  </div>
                  {departments.map((dept) => (
                    <div
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setIsDeptDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 text-[11px] cursor-pointer hover:bg-gray-50 ${filterDepartment === dept ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-600"}`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Month Filter */}
          <div className="relative group">
            <div className={`flex items-center gap-2 h-9 px-4 bg-white border ${filterDate ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200"} group-hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-200 whitespace-nowrap cursor-pointer`}>
              <Calendar size={14} className={filterDate ? "text-indigo-600" : "text-gray-500"} />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${filterDate ? "text-indigo-700" : "text-gray-700"}`}>
                {filterDate ? (() => {
                  const [year, month] = filterDate.split('-');
                  const date = new Date(year, parseInt(month, 10) - 1, 1);
                  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                })() : "All Months"}
              </span>
              <ChevronDown size={14} className={filterDate ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
            </div>
            <input
              type="month"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              onClick={(e) => {
                try {
                  if (e.target.showPicker) e.target.showPicker();
                } catch (err) {}
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Select Month"
            />
          </div>

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center justify-center gap-1.5 h-9 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all"
              title="Clear all filters"
            >
              <X size={12} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
            aria-label="Refresh Table"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:inline">
              Refresh
            </span>
          </button>

          {/* Redirect URL Button (Column D) */}
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <ExternalLink size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Redirect URL</span>
          </a>

          {/* Fill Attendance Button (Column F) */}
          <a
            href={attendanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <ExternalLink size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Fill Attendance</span>
          </a>

        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] shadow-sm">
        {isLoading ? (
          <TableSkeleton columns={14} rows={10} />
        ) : (
          <>
            <div className="table-container max-h-[calc(105vh-280px)] min-h-[530px] overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <SortHeader
                      label="Timestamp"
                      sortKey="timestamp"
                      align="center"
                    />
                    <SortHeader label="Role" sortKey="role" align="center" />
                    <SortHeader label="Code" sortKey="code" align="center" />
                    <SortHeader
                      label="Punch"
                      sortKey="punchStatus"
                      align="center"
                    />
                    <SortHeader
                      label="Client"
                      sortKey="clientName"
                      align="center"
                    />
                    <SortHeader
                      label="Latitude"
                      sortKey="latitude"
                      align="center"
                    />
                    <SortHeader
                      label="Longitude"
                      sortKey="longitude"
                      align="center"
                    />
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Image
                    </th>
                    <SortHeader label="Date" sortKey="date" align="center" />
                    <SortHeader label="Time" sortKey="time" align="center" />
                    <SortHeader
                      label="Department"
                      sortKey="department"
                      align="center"
                    />
                    <SortHeader
                      label="Staff Name"
                      sortKey="staffName"
                      align="center"
                    />
                    <SortHeader
                      label="Address"
                      sortKey="address"
                      align="center"
                    />
                    <SortHeader
                      label="Loc. Status"
                      sortKey="locationStatus"
                      align="center"
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="px-6 py-24 text-center">
                        <p className="text-gray-500 text-sm font-medium">
                          No records found.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-indigo-50/50 transition-colors group"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-medium">
                          {formatDateTime(item.timestamp)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {item.role}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 uppercase tracking-wider">
                            {item.code}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${item.punchStatus === "IN"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : item.punchStatus === "OUT"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                          >
                            {item.punchStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {item.clientName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {item.latitude}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {item.longitude}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-indigo-600 underline">
                          {item.imageUrl !== "—" ? (
                            <a
                              href={item.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {formatDateOnly(item.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {formatTime(item.time)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-medium">
                          {item.department}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">
                          {item.staffName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-indigo-600 underline">
                          {item.address !== "—" ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1"
                            >
                              <MapPin size={12} />
                              <span className="max-w-[150px] truncate">
                                {item.address}
                              </span>
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {item.locationStatus}
                        </td>
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
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {filteredAndSortedItems.length > 0
                      ? indexOfFirstItem + 1
                      : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-gray-900">
                    {Math.min(indexOfLastItem, filteredAndSortedItems.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {filteredAndSortedItems.length}
                  </span>{" "}
                  records
                </p>
                <div className="flex items-center gap-2 h-5">
                  <label className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
                    Rows:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs bg-transparent font-medium text-gray-700 outline-none cursor-pointer"
                  >
                    {[15, 30, 50, 100].map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
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
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-2xl bg-white m-2 opacity-60">
              No records found.
            </div>
          ) : (
            currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 shadow-sm relative w-full"
              >
                <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                  <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">
                    #{item.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${item.punchStatus === "IN"
                      ? "bg-green-100 text-green-700"
                      : item.punchStatus === "OUT"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {item.punchStatus}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">
                      {item.staffName}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest opacity-80">
                      {item.role} • {item.department}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60 italic">
                      Date & Time
                    </span>
                    <p className="text-[10px] font-bold text-gray-600">
                      {formatDateOnly(item.date)} {formatTime(item.time)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block opacity-60 italic">
                      Client
                    </span>
                    <p className="text-[10px] font-bold text-gray-600">
                      {item.clientName}
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-gray-500 border-t border-gray-100 pt-2 space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin size={10} />
                    {item.address !== "—" ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline truncate"
                      >
                        {item.address}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                  <p>
                    📍 {item.latitude}, {item.longitude}
                  </p>
                  <p>
                    🖼️{" "}
                    {item.imageUrl !== "—" ? (
                      <a
                        href={item.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline"
                      >
                        View Image
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                  <p>📌 Status: {item.locationStatus}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="absolute border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 bottom-0 w-full z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between w-full px-2 mb-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex items-center gap-2 h-5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                Rows:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-[10px] font-black text-indigo-600 bg-transparent outline-none"
              >
                {[15, 30, 50].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
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