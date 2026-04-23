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
  X,
  XCircle,
  Building2,
  Users,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { getCache, setCache } from "../utils/dataCache";
import toast from "react-hot-toast";

const CACHE_KEY = "articles_master";

/* ------------------------------------------------------------------ */
/*  Custom Hook: useDebounce                                          */
/* ------------------------------------------------------------------ */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
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

const TableSkeleton = ({ columns = 22, rows = 10 }) => (
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
                  className={`h-3.5 flex-1 mx-2 rounded-sm ${j === 0 ? "max-w-[40px]" : ""}`}
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
const formatDate = (dateValue) => {
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

const formatCurrency = (value) => {
  if (!value) return "—";
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? String(value) : `₹${num.toLocaleString("en-IN")}`;
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
const Employee = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab state: "Article", "Employee", "Intern"
  const [activeRoleTab, setActiveRoleTab] = useState("Article");

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
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
      const url = `${import.meta.env.VITE_DAILY_ATTENDENCE_SHEET_URL}?action=getArticlesMaster`;
      const response = await fetch(url, { signal });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      // Force all fields to strings
      const formatted = json.map((item, index) => ({
        id: `article-${index}-${item.code || Date.now()}`,
        code: String(item.code ?? "—"),
        name: String(item.name ?? "—"),
        studentRegNo: String(item.studentRegNo ?? "—"),
        dateOfJoining: String(item.dateOfJoining ?? "—"),
        department: String(item.department ?? "—"),
        teamHead: String(item.teamHead ?? "—"),
        registeredUnder: String(item.registeredUnder ?? "—"),
        salaryAmount: String(item.salaryAmount ?? item.H ?? "—"),
        articleshipPeriod: String(item.articleshipPeriod ?? item.I ?? "—"),
        role: String(item.role ?? item.Role ?? item.ROLE ?? item.H ?? item.J ?? "—"),
        gender: String(item.gender ?? "—"),
        level: String(item.level ?? "—"),
        joinedOn: String(item.joinedOn ?? "—"),
        audit: String(item.audit ?? "—"),
        tenureExpiringDate: String(item.tenureExpiringDate ?? "—"),
        mobileNo: String(item.mobileNo ?? "—"),
        articleEmail: String(item.articleEmail ?? "—"),
        photo: String(item.photo ?? "—"),
        accountNo: String(item.accountNo ?? "—"),
        bankIfsc: String(item.bankIfsc ?? "—"),
        bankName: String(item.bankName ?? "—"),
        bankMisUse: String(item.bankMisUse ?? "—"),
        accountNo2: String(item.accountNo2 ?? "—"),
        trueFalse: String(item.trueFalse ?? "—"),
      }));

      setItems(formatted);
      setCache(CACHE_KEY, formatted);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Fetch error:", error);
        toast.error("Failed to load Articles Master data.");
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
  //  Clear all filters (excluding tab)
  // ------------------------------------------------------------------
  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    setFilterDepartment("");
    setFilterGender("");
    setFilterLevel("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchInput || filterDepartment || filterGender || filterLevel;

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
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }
        if (sortConfig.key.toLowerCase().includes("date")) {
          const aDate = new Date(aVal),
            bDate = new Date(bVal);
          if (!isNaN(aDate) && !isNaN(bDate)) {
            return sortConfig.direction === "asc"
              ? aDate - bDate
              : bDate - aDate;
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

  // Read current user session
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // First, apply code-based data isolation.
  // Admins see all records; others see only their own by code.
  const codeFilteredItems = useMemo(() => {
    // Look deeply into the cached user object for any capitalized versions of Role or column H 
    // since the login API might have returned them that way and they are preserved via ...result
    const cachedRole = String(
      user?.role || user?.Role || user?.ROLE || user?.H || ""
    ).trim().toLowerCase();
    
    const userCode = String(user?.code || "").trim().toLowerCase();

    // Check role from the master data (items) as well
    const currentUserData = items.find(
      (item) => String(item.code ?? "").trim().toLowerCase() === userCode
    );
    const masterRole = currentUserData ? String(currentUserData.role || currentUserData.Role || currentUserData.ROLE || currentUserData.H || "").trim().toLowerCase() : "";

    const isAdmin = 
      cachedRole === "admin" || 
      user?.Admin === "Yes" || 
      String(user?.Admin).toLowerCase() === "yes" ||
      masterRole === "admin" ||
      userCode === "admin";

    return isAdmin
      ? items
      : userCode
        ? items.filter(
            (item) => String(item.code ?? "").trim().toLowerCase() === userCode
          )
        : [];
  }, [items, user]);

  // Then filter by active role tab
  const roleFilteredItems = useMemo(() => {
    return codeFilteredItems.filter((item) => {
      const itemRole = String(item.role || "").trim().toLowerCase();
      return itemRole === activeRoleTab.toLowerCase();
    });
  }, [codeFilteredItems, activeRoleTab]);

  // Counts for tab badges - now based on what the user actually has access to!
  const articleCount = useMemo(() => {
    return codeFilteredItems.filter(
      (item) => String(item.role).trim().toLowerCase() === "article",
    ).length;
  }, [codeFilteredItems]);

  const employeeCount = useMemo(() => {
    return codeFilteredItems.filter(
      (item) => String(item.role).trim().toLowerCase() === "employee",
    ).length;
  }, [codeFilteredItems]);

  const internCount = useMemo(() => {
    return codeFilteredItems.filter(
      (item) => String(item.role).trim().toLowerCase() === "intern",
    ).length;
  }, [codeFilteredItems]);

  // Then apply other filters
  const filteredAndSortedItems = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase().trim();
    const filtered = roleFilteredItems.filter((item) => {
      const matchesSearch = !term
        ? true
        : String(item.name).toLowerCase().includes(term) ||
          String(item.code).toLowerCase().includes(term) ||
          String(item.studentRegNo).toLowerCase().includes(term) ||
          String(item.department).toLowerCase().includes(term) ||
          String(item.role).toLowerCase().includes(term) ||
          String(item.mobileNo).toLowerCase().includes(term) ||
          String(item.articleEmail).toLowerCase().includes(term);
      const matchesDept =
        !filterDepartment || item.department === filterDepartment;
      const matchesGender = !filterGender || item.gender === filterGender;
      const matchesLevel = !filterLevel || item.level === filterLevel;
      return matchesSearch && matchesDept && matchesGender && matchesLevel;
    });
    return getSortedItems(filtered);
  }, [
    roleFilteredItems,
    debouncedSearchTerm,
    filterDepartment,
    filterGender,
    filterLevel,
    getSortedItems,
  ]);

  const departments = useMemo(
    () =>
      [
        ...new Set(roleFilteredItems.map((d) => d.department).filter(Boolean)),
      ].sort(),
    [roleFilteredItems],
  );
  const genders = useMemo(
    () =>
      [
        ...new Set(roleFilteredItems.map((d) => d.gender).filter(Boolean)),
      ].sort(),
    [roleFilteredItems],
  );
  const levels = useMemo(
    () =>
      [
        ...new Set(roleFilteredItems.map((d) => d.level).filter(Boolean)),
      ].sort(),
    [roleFilteredItems],
  );

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
      >
        <div
          className={`flex items-center gap-1.5 justify-${align === "center" ? "center" : align === "left" ? "start" : "end"}`}
        >
          {label}
          <div className="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity">
            <ChevronUp
              size={10}
              className={
                isActive && isAsc
                  ? "text-indigo-600 opacity-100"
                  : "text-gray-400"
              }
            />
            <ChevronDown
              size={10}
              className={
                isActive && !isAsc
                  ? "text-indigo-600 opacity-100"
                  : "text-gray-400 -mt-1"
              }
            />
          </div>
        </div>
      </th>
    );
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto" aria-label="Pagination">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
      {[...Array(Math.max(1, Math.min(5, totalPages || 1)))].map((_, i) => (
        <button
          key={i}
          onClick={() => paginate(i + 1)}
          aria-current={currentPage === i + 1 ? "page" : undefined}
          className={`relative inline-flex items-center px-3 py-1.5 border text-[11px] font-bold transition-all duration-200 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${currentPage === i + 1 ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );

  const FilterDropdown = ({
    isOpen,
    setIsOpen,
    options,
    value,
    setValue,
    label,
    icon: Icon,
    allLabel,
  }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 whitespace-nowrap"
      >
        <Icon size={14} />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {value || allLabel}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden py-1">
            <div
              onClick={() => {
                setValue("");
                setIsOpen(false);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-[11px] cursor-pointer hover:bg-gray-50 ${!value ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-600"}`}
            >
              {allLabel}
            </div>
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  setValue(opt);
                  setIsOpen(false);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-[11px] cursor-pointer hover:bg-gray-50 ${value === opt ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-600"}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-4 py-1 space-y-4 pb-20 md:pb-8 font-outfit">
      {/* Header with Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight shrink-0">
            Articles Master
          </h2>

          {/* Role Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto scrollbar-hide shrink-0">
            <button
              onClick={() => {
                setActiveRoleTab("Article");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 py-1.5 px-4 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                activeRoleTab === "Article"
                  ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Briefcase size={13} strokeWidth={3} />
              <span>Articles ({articleCount})</span>
            </button>
            <button
              onClick={() => {
                setActiveRoleTab("Employee");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 py-1.5 px-4 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                activeRoleTab === "Employee"
                  ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Users size={13} strokeWidth={3} />
              <span>Employees ({employeeCount})</span>
            </button>
            <button
              onClick={() => {
                setActiveRoleTab("Intern");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 py-1.5 px-4 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                activeRoleTab === "Intern"
                  ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <GraduationCap size={13} strokeWidth={3} />
              <span>Interns ({internCount})</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-3 w-full xl:w-auto flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 sm:w-64 max-w-sm group">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
              size={14}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by Name, Code, Reg No..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-[13px] shadow-sm bg-white font-medium transition-all duration-200"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setCurrentPage(1);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <FilterDropdown
            isOpen={isDeptDropdownOpen}
            setIsOpen={setIsDeptDropdownOpen}
            options={departments}
            value={filterDepartment}
            setValue={setFilterDepartment}
            label={filterDepartment || "All Dept"}
            icon={Building2}
            allLabel="All Departments"
          />
          <FilterDropdown
            isOpen={isGenderDropdownOpen}
            setIsOpen={setIsGenderDropdownOpen}
            options={genders}
            value={filterGender}
            setValue={setFilterGender}
            label={filterGender || "All Gender"}
            icon={Users}
            allLabel="All Genders"
          />
          <FilterDropdown
            isOpen={isLevelDropdownOpen}
            setIsOpen={setIsLevelDropdownOpen}
            options={levels}
            value={filterLevel}
            setValue={setFilterLevel}
            label={filterLevel || "All Level"}
            icon={GraduationCap}
            allLabel="All Levels"
          />

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center justify-center gap-1.5 h-9 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/20"
            >
              <X size={12} /> Clear
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-indigo-500" : ""}
            />{" "}
            Refresh
          </button>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden border border-gray-200 rounded-xl bg-white min-h-[530px] shadow-sm hover:shadow-md transition-shadow duration-300">
        {isLoading ? (
          <TableSkeleton columns={22} rows={10} />
        ) : (
          <>
            <div className="table-container max-h-[calc(105vh-280px)] min-h-[530px] overflow-x-auto overflow-y-auto scrollbar-hide">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <SortHeader label="Code" sortKey="code" />
                    <SortHeader label="Name" sortKey="name" />
                    <SortHeader label="Reg No" sortKey="studentRegNo" />
                    <SortHeader label="Joining" sortKey="dateOfJoining" />
                    <SortHeader label="Dept" sortKey="department" />
                    <SortHeader label="Team Head" sortKey="teamHead" />
                    <SortHeader label="Reg Under" sortKey="registeredUnder" />
                    <SortHeader label="Salary" sortKey="salaryAmount" />
                    <SortHeader label="Period" sortKey="articleshipPeriod" />
                    <SortHeader label="Role" sortKey="role" />
                    <SortHeader label="Gender" sortKey="gender" />
                    <SortHeader label="Level" sortKey="level" />
                    <SortHeader label="Joined On" sortKey="joinedOn" />
                    <SortHeader label="Audit" sortKey="audit" />
                    <SortHeader
                      label="Tenure End"
                      sortKey="tenureExpiringDate"
                    />
                    <SortHeader label="Mobile" sortKey="mobileNo" />
                    <SortHeader label="Email" sortKey="articleEmail" />
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Photo
                    </th>
                    <SortHeader label="Account No" sortKey="accountNo" />
                    <SortHeader label="IFSC" sortKey="bankIfsc" />
                    <SortHeader label="Bank" sortKey="bankName" />
                    <SortHeader label="MIS Use" sortKey="bankMisUse" />
                    <SortHeader label="Acct No2" sortKey="accountNo2" />
                    <SortHeader label="T/F" sortKey="trueFalse" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="24"
                        className="px-6 py-24 text-center text-gray-500"
                      >
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-4 py-4 text-center text-sm font-bold text-indigo-700">
                          {item.code}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.studentRegNo}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {formatDate(item.dateOfJoining)}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.department}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.teamHead}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.registeredUnder}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-bold text-indigo-600">
                          {formatCurrency(item.salaryAmount)}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.articleshipPeriod}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.role.toLowerCase() === "article" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {item.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.gender}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.level}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {formatDate(item.joinedOn)}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.audit}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {formatDate(item.tenureExpiringDate)}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.mobileNo}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-indigo-600 underline">
                          {item.articleEmail !== "—" ? (
                            <a href={`mailto:${item.articleEmail}`}>
                              {item.articleEmail}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.photo !== "—" ? (
                            <a
                              href={item.photo}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 underline"
                            >
                              View
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600 font-mono">
                          {item.accountNo}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600 uppercase">
                          {item.bankIfsc}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.bankName}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          {item.bankMisUse}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600 font-mono">
                          {item.accountNo2}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.trueFalse === "TRUE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {item.trueFalse}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="hidden md:flex px-4 py-3 bg-white border-t border-gray-200 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <p className="text-[13px] text-gray-600">
                  Showing{" "}
                  <span className="font-bold">
                    {filteredAndSortedItems.length > 0
                      ? indexOfFirstItem + 1
                      : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold">
                    {Math.min(indexOfLastItem, filteredAndSortedItems.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold">
                    {filteredAndSortedItems.length}
                  </span>{" "}
                  records
                </p>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-transparent font-medium text-gray-700 outline-none"
                >
                  {[15, 30, 50, 100].map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
              {renderPaginationNav()}
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
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-xs font-bold uppercase">
              No records found.
            </div>
          ) : (
            currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-3 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-black text-indigo-600 text-sm">
                    #{item.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.role.toLowerCase() === "article" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {item.role}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800">{item.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Reg No:</span>{" "}
                    {item.studentRegNo}
                  </div>
                  <div>
                    <span className="text-gray-400">Joining:</span>{" "}
                    {formatDate(item.dateOfJoining)}
                  </div>
                  <div>
                    <span className="text-gray-400">Dept:</span>{" "}
                    {item.department}
                  </div>
                  <div>
                    <span className="text-gray-400">Salary:</span>{" "}
                    {formatCurrency(item.salaryAmount)}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Mobile:</span>{" "}
                    {item.mobileNo}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Email:</span>{" "}
                    {item.articleEmail}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="absolute border-t border-gray-200 bg-white p-2.5 flex flex-col items-center gap-2 bottom-0 w-full z-10">
          <div className="flex items-center justify-between w-full px-2">
            <p className="text-[10px] font-black text-gray-400">
              Page {currentPage} of {totalPages || 1}
            </p>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-[10px] font-black text-indigo-600 bg-transparent"
            >
              {[15, 30, 50].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          {renderPaginationNav()}
        </div>
      </div>
    </div>
  );
};

export default Employee;
