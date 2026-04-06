import React, { useEffect, useState } from "react";
import { 
  Filter, Search, Clock, CheckCircle, ImageIcon, User, Briefcase, 
  MapPin, Phone, Layout, History, ChevronDown, Check, Calendar, 
  ArrowRight, ClipboardCheck, X, Eye, FileText, Download, Plus, Mail,
  CreditCard, GraduationCap, Building2, Landmark, History as HistoryIcon 
} from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

// 🚀 Mock Data Generator (20 Rows)
const generateMockData = () => {
  const departments = ["Engineering", "HR", "Sales", "Finance", "Operations", "Marketing"];
  const designations = ["Software Engineer", "HR Manager", "Sales Executive", "Accountant", "Project Manager", "Creative Director"];
  const relationships = ["Father", "Mother", "Spouse"];

  const active = Array.from({ length: 20 }).map((_, i) => ({
    id: `EMP${1001 + i}`,
    employeeId: `EMP${1001 + i}`,
    candidateName: [
      "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Gupta", "Vikram Singh",
      "Anjali Desai", "Rohan Mehta", "Sonal Varma", "Arjun Reddy", "Neha Kapoor",
      "Sandeep Nair", "Pooja Hegde", "Karan Johar", "Aditi Rao", "Abhishek Das",
      "Deepika Roy", "Vivek Joshi", "Shweta Tiwari", "Manish Paul", "Kirti Sanon"
    ][i % 20],
    fatherName: ["Suresh Sharma", "Vijay Patel", "Rajesh Kumar", "Manoj Gupta", "Harish Singh"][i % 5],
    dateOfBirth: `19${85 + (i % 15)}-0${1 + (i % 9)}-${10 + (i % 18)}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    mobileNo: `+91 ${98000 + i} 54321`,
    emailId: `employee${i + 1}@gmail.com`,
    familyNo: `+91 ${90000 + i} 11111`,
    relationship: relationships[i % 3],
    address: `${i + 101}, Skyline Apartments, Mumbai`,
    joiningId: `SDII-${String(101 + i).padStart(3, '0')}`,
    dateOfJoining: `2024-0${1 + (i % 3)}-${10 + (i % 18)}`,
    department: departments[i % 6],
    designation: designations[i % 6],
    qualification: ["M.Tech CS", "MBA HR", "B.Tech IT", "CA", "PhD Marketing"][i % 5],
    aadharNo: `XXXX XXXX ${1234 + i}`,
    accountNo: `501000${98765 + i}`,
    ifsc: `HDFC000123${i % 9}`,
    branch: "Mumbai Main Branch",
    status: "Active"
  }));

  const left = Array.from({ length: 5 }).map((_, i) => ({
    id: `EMP${901 + i}`,
    employeeId: `EMP${901 + i}`,
    name: ["Sahil Khan", "Anita Raj", "Sameer Sen", "Dimple Kapur", "Rajesh Khanna"][i % 5],
    designation: "Executive",
    department: "Sales",
    reasonOfLeaving: "Better Opportunity",
    dateOfJoining: "2023-05-10",
    dateOfLeaving: "2024-03-20",
    mobileNo: `+91 91111 2222${i}`
  }));

  return { active, left };
};

const Employee = () => {
  const [activeTab, setActiveTab] = useState("joining");
  const [searchTerm, setSearchTerm] = useState("");
  const [joiningData, setJoiningData] = useState([]);
  const [leavingData, setLeavingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // States Synced with Indent.jsx
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [formData, setFormData] = useState({
    name: "", fatherName: "", dob: "", gender: "Male",
    mobile: "", email: "", familyMobile: "", relationship: "", address: "",
    joiningId: "", doj: "", department: "", designation: "", qualification: "",
    aadhar: "", accountNo: "", ifsc: "", branch: ""
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const { active, left } = generateMockData();
      setJoiningData(active);
      setLeavingData(left);
      setLoading(false);
    }, 800);
  }, []);

  const formatDOB = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB');
  };

  const uniqueDepartments = [...new Set([...joiningData, ...leavingData].map(item => item.department).filter(Boolean))].sort();

  const filteredJoiningData = joiningData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDepartment || item.department === filterDepartment;
    
    let matchesDate = true;
    if (filterDate && item.dateOfJoining) {
      const itemDate = new Date(item.dateOfJoining).toISOString().split('T')[0];
      matchesDate = itemDate === filterDate;
    }
    
    return matchesSearch && matchesDept && matchesDate;
  });

  const filteredLeavingData = leavingData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDepartment || item.department === filterDepartment;
    
    let matchesDate = true;
    if (filterDate && item.dateOfLeaving) {
      const itemDate = new Date(item.dateOfLeaving).toISOString().split('T')[0];
      matchesDate = itemDate === filterDate;
    }

    return matchesSearch && matchesDept && matchesDate;
  });

  const activeItems = activeTab === "joining" ? filteredJoiningData : filteredLeavingData;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(activeItems.length / itemsPerPage));

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto" aria-label="Pagination">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-1.5 py-1 sm:px-2 sm:py-1 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
        <span className="sr-only">Previous</span>
        <svg className="h-4 w-4 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const pageNum = i + 1;
        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
          return (
            <button key={pageNum} onClick={() => paginate(pageNum)} className={`relative inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1 border text-xs sm:text-sm font-medium ${currentPage === pageNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
              {pageNum}
            </button>
          );
        } else if ((pageNum === currentPage - 2 && pageNum > 1) || (pageNum === currentPage + 2 && pageNum < totalPages)) {
          return <span key={pageNum} className="relative inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700">...</span>;
        }
        return null;
      })}

      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-1.5 py-1 sm:px-2 sm:py-1 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
        <span className="sr-only">Next</span>
        <svg className="h-4 w-4 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
      </button>
    </nav>
  );

  const handleAddEmployee = (e) => {
    e.preventDefault();
    toast.success("Employee data added successfully (Demo Mode)");
    setShowAddModal(false);
    setFormData({
      name: "", fatherName: "", dob: "", gender: "Male",
      mobile: "", email: "", familyMobile: "", relationship: "Father", address: "",
      joiningId: "", doj: "", department: "Engineering", designation: "Software Engineer", qualification: "",
      aadhar: "", accountNo: "", ifsc: "", branch: ""
    });
  };

  return (
    <div className="space-y-3 md:pb-4 mb-4 font-outfit">
      
      {/* 🚀 Unified Toolbar - Synced with Indent.jsx */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-4">
          
          {/* Segmented Tab Control */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-sm self-start sm:self-center">
            <button 
              onClick={() => { setActiveTab("joining"); setCurrentPage(1); }}
              className={`flex items-center gap-2 py-1.5 px-4 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${activeTab === "joining" 
                ? "bg-white text-indigo-600 shadow-sm border border-gray-200" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CheckCircle size={13} strokeWidth={3} />
              <span>Active ({filteredJoiningData.length})</span>
            </button>
            <button 
              onClick={() => { setActiveTab("leaving"); setCurrentPage(1); }}
              className={`flex items-center gap-2 py-1.5 px-4 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${activeTab === "leaving" 
                ? "bg-white text-rose-600 shadow-sm border border-gray-200" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <HistoryIcon size={13} strokeWidth={3} />
              <span>Left ({filteredLeavingData.length})</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Mobile Top Row: Search + Create Button */}
          <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search workforce..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-xs sm:text-sm shadow-sm font-medium uppercase"
              />
            </div>
            <button 
               onClick={() => setShowAddModal(true)}
               className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shrink-0 shadow-lg shadow-indigo-100"
            >
               <Plus size={16} className="sm:mr-2" strokeWidth={3} />
               <span className="hidden sm:inline">Add Employee</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full sm:w-auto">
            {/* Department Filter (Custom Dropdown) */}
            <div className="relative">
              <div
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className="flex items-center gap-2 h-9 px-3 border border-gray-300 rounded bg-white text-xs text-gray-700 cursor-pointer hover:border-indigo-500 transition shadow-sm relative overflow-hidden"
              >
                <Layout size={12} className="text-gray-400 shrink-0" />
                <span className="truncate font-bold uppercase">{filterDepartment || "All Dept"}</span>
                <ChevronDown size={14} className={`ml-auto text-gray-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDeptDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDeptDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto ring-1 ring-black ring-opacity-5">
                    <div
                      onClick={() => { setFilterDepartment(''); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 flex items-center justify-between ${!filterDepartment ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600'}`}
                    >
                      All Departments
                      {!filterDepartment && <Check size={12} className="text-indigo-500" />}
                    </div>
                    {uniqueDepartments.map((dept, index) => (
                      <div
                        key={index}
                        onClick={() => { setFilterDepartment(dept); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 flex items-center justify-between ${filterDepartment === dept ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600'}`}
                      >
                        {dept}
                        {filterDepartment === dept && <Check size={12} className="text-indigo-500" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative">
              <div className="flex items-center gap-2 h-9 px-3 border border-gray-300 rounded bg-white text-xs text-gray-700 relative overflow-hidden shadow-sm">
                <Calendar size={12} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent focus:outline-none text-[11px] font-bold cursor-pointer uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Main Content Container - Synced with Indent.jsx */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] flex flex-col shadow-sm">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Retrieving workforce data..." minHeight="450px" />
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              {/* Desktop Table View */}
              <div className="hidden md:flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm flex-1">
                <div className="max-h-[calc(105vh-280px)] min-h-[530px] overflow-auto scrollbar-hide">
                  <table className="w-max min-w-full divide-y divide-gray-200 text-left">
                    <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm border-b border-gray-100">
                      {activeTab === "joining" ? (
                        <tr>
                          <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sr.</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap sticky left-0 z-30 bg-gray-50 shadow-sm border-r border-gray-100">E-ID</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Full Name</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Father's Name</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Joined Date</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">DOB</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Gender</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Mobile No</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Email ID</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Family No</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Relation</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Address</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Department</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Designation</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Qual.</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Aadhar</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Account No</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">IFSC</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Branch</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sr.</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap sticky left-0 z-30 bg-gray-50 shadow-sm border-r border-gray-100">E-ID</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Name</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Designation</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Department</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Reason</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Left Date</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="25" className="px-4 py-32 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                            No workforce records found.
                          </td>
                        </tr>
                      ) : activeTab === "joining" ? (
                        currentItems.map((emp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-4 py-4 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold">{indexOfFirstItem + idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap sticky left-0 z-10 bg-white/95 backdrop-blur group-hover:bg-gray-50/95 border-r border-gray-100 shadow-sm transition-colors text-center">
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">#{emp.employeeId}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-black text-gray-800 uppercase italic">
                              {emp.candidateName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-bold text-gray-600 uppercase">
                              {emp.fatherName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-bold text-gray-500">
                              {formatDOB(emp.dateOfJoining)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-bold text-gray-500">
                              {formatDOB(emp.dateOfBirth)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[10px] font-bold text-gray-400 uppercase">
                              {emp.gender}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 italic">
                              {emp.mobileNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] text-indigo-600 font-medium underline">
                              {emp.emailId || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 italic opacity-60">
                              {emp.familyNo || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {emp.relationship || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[10px] font-medium text-gray-500 max-w-[150px] truncate">
                              {emp.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-black text-gray-500 uppercase tracking-tighter">
                              {emp.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-gray-700 uppercase">
                              {emp.designation}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[10px] font-bold text-gray-400 uppercase">
                              {emp.qualification}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-medium text-gray-600 italic">
                              {emp.aadharNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-bold text-gray-700 tracking-widest">
                              {emp.accountNo || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[10px] font-black text-gray-400 uppercase">
                              {emp.ifsc || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[10px] font-medium text-gray-500 uppercase">
                              {emp.branch || "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        currentItems.map((emp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-4 py-4 whitespace-nowrap text-center text-[10px] text-gray-400 font-bold">{indexOfFirstItem + idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap sticky left-0 z-10 bg-white/95 backdrop-blur group-hover:bg-gray-50/95 border-r border-gray-100 shadow-sm transition-colors text-center text-[10px] font-black text-rose-500 uppercase tracking-widest">
                              #{emp.employeeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-black text-gray-800 uppercase italic">
                              {emp.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-gray-700 uppercase">
                              {emp.designation}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-black text-gray-500 uppercase tracking-tighter">
                              {emp.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[10px] text-rose-400 font-bold italic tracking-tighter truncate max-w-[150px]">
                              "{emp.reasonOfLeaving}"
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[11px] font-bold text-rose-600 bg-rose-50/20 shadow-inner">
                              {formatDOB(emp.dateOfLeaving)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View - Synced with Indent.jsx */}
              <div className="md:hidden flex flex-col h-[calc(100vh-240px)] bg-gray-50">
                <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide">
                  {currentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-xl">No records found.</div>
                  ) : activeTab === "joining" ? (
                    currentItems.map((emp, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-3 relative overflow-hidden group hover:border-indigo-200 transition-all duration-300">
                        <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                          <div className="flex items-center gap-2">
                             <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                             <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">#{emp.employeeId}</span>
                          </div>
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{emp.department}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-gray-800 text-sm tracking-tight leading-none uppercase">{emp.candidateName}</h3>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-1.5 italic">{emp.designation}</p>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Status</span>
                             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded mt-1 shadow-sm">ACTIVE</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter block opacity-60">Joined Date</span>
                            <div className="flex items-center gap-1.5 font-bold text-gray-700 text-[10px]">
                               <Calendar size={10} className="text-indigo-400" />
                               {formatDOB(emp.dateOfJoining)}
                            </div>
                          </div>
                          <div className="space-y-0.5">
                             <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter block opacity-60">Mobile No</span>
                             <div className="text-[10px] font-bold text-gray-700 italic">{emp.mobileNo}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    currentItems.map((emp, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-3 relative overflow-hidden group hover:border-rose-200 transition-all duration-300">
                        <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                          <div className="flex items-center gap-2">
                             <div className="w-1 h-3 bg-rose-600 rounded-full"></div>
                             <span className="font-black text-rose-600 text-[10px] tracking-tighter uppercase">#{emp.employeeId}</span>
                          </div>
                          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{emp.department}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-gray-800 text-sm tracking-tight uppercase leading-none">{emp.name}</h3>
                            <p className="text-[10px] font-bold text-rose-400 italic mt-1.5">"{emp.reasonOfLeaving}"</p>
                          </div>
                          <div className="flex flex-col items-end text-right">
                             <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Exit Date</span>
                             <span className="text-[10px] font-black text-rose-600 uppercase italic mt-1">{formatDOB(emp.dateOfLeaving)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Mobile Sticky Pagination */}
                <div className="border-t border-gray-200 bg-white p-2.5 flex justify-center sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                  {renderPaginationNav()}
                </div>
              </div>
            </div>

            {/* Pagination Detail Footer - Desktop */}
            <div className="hidden md:flex px-4 py-2 bg-white border-t border-gray-200 items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-[13px] text-gray-600 font-medium tracking-wide">
                  Showing <span className="font-bold text-gray-900">{activeItems.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, activeItems.length)}</span> of <span className="font-bold text-gray-900">{activeItems.length}</span> records
                </p>
                <div className="flex items-center gap-2 border-l border-gray-300 pl-4 h-5">
                  <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Rows per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="text-[11px] border border-gray-200 rounded-md px-2 py-0.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white font-black text-gray-700 outline-none transition shadow-sm"
                  >
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

      {/* 📋 Recruitment Modal - FIXED & COMPACT UI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] animate-in zoom-in duration-300 overflow-hidden border border-slate-100 flex flex-col">
              
              {/* Modal Header (Compact) */}
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-800 tracking-tight uppercase italic">New Recruitment Entry</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5 opacity-60">Standalone Demo Mode • Compact UI</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-rose-500 group active:scale-90"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Form Content (Reduced Gaps) */}
              <form onSubmit={handleAddEmployee} className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 1. Personal Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                         <User size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">1. Personal Details</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Name (As per Aadhar) *</label>
                          <input type="text" required placeholder="Ex: Rahul Sharma" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:font-medium uppercase" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Father's Name *</label>
                          <input type="text" required placeholder="Ex: Suresh Sharma" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:font-medium uppercase" />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Date of Birth *</label>
                             <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Gender</label>
                             <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer uppercase">
                                <option>Male</option>
                                <option>Female</option>
                             </select>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* 2. Contact & Address */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                         <Phone size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">2. Contact Info</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Mobile No *</label>
                             <input type="tel" required placeholder="+91" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Personal Email *</label>
                             <input type="email" required placeholder="user@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none lowercase" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Family Contact</label>
                             <input type="tel" placeholder="+91" value={formData.familyMobile} onChange={(e) => setFormData({...formData, familyMobile: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Relation</label>
                             <select value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase">
                                <option value="">Select Relation</option>
                                <option>Father</option>
                                <option>Mother</option>
                                <option>Spouse</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Current Address *</label>
                          <input type="text" required placeholder="Full address..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase" />
                       </div>
                    </div>
                  </div>

                  {/* 3. Professional Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                         <Briefcase size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">3. Professional</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Joining ID</label>
                             <input type="text" placeholder="Auto" value={formData.joiningId} onChange={(e) => setFormData({...formData, joiningId: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Date of Joining *</label>
                             <input type="date" required value={formData.doj} onChange={(e) => setFormData({...formData, doj: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Department</label>
                             <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase cursor-pointer">
                                <option value="">Select Dept</option>
                                <option>Engineering</option>
                                <option>HR</option>
                                <option>Sales</option>
                                <option>Finance</option>
                             </select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Designation</label>
                             <input type="text" placeholder="Role" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Qualification *</label>
                          <input type="text" required placeholder="Degree/Cert" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                       </div>
                    </div>
                  </div>

                  {/* 4. Bank & KYC Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                         <Landmark size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">4. KYC & Bank</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Aadhar No *</label>
                          <input type="text" required placeholder="XXXX XXXX XXXX" value={formData.aadhar} onChange={(e) => setFormData({...formData, aadhar: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-black tracking-widest text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Bank Account No *</label>
                          <input type="text" required placeholder="000000000000" value={formData.accountNo} onChange={(e) => setFormData({...formData, accountNo: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">IFSC Code *</label>
                             <input type="text" required placeholder="SBIN000" value={formData.ifsc} onChange={(e) => setFormData({...formData, ifsc: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Branch Name</label>
                             <input type="text" placeholder="Location" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                          </div>
                       </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer (Compact & Locked) */}
                <div className="mt-6 flex justify-end gap-2 pb-2 sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t border-slate-100 z-10">
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)} 
                      className="px-6 py-2 text-[9px] font-black text-gray-400 hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest border border-gray-100"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      className="px-10 py-2 bg-indigo-600 text-white text-[9px] font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center min-w-[200px]"
                    >
                      Complete Recruitment
                    </button>
                </div>
              </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employee;
