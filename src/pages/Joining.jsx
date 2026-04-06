import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, CheckCircle, X, Upload, Share, FileText, Mail, 
  Calendar, Filter, ChevronDown, Check, User, Briefcase, Phone, 
  MapPin, Landmark, GraduationCap, Layout, Plus, History as HistoryIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

// 🚀 Mock Onboarding Data (Demo Fallback)
const DUMMY_JOINING_DATA = [
  { id: "JOIN-101", candidateEnquiryNo: "ENQ-7001", candidateName: "Amit Patel", applyingForPost: "Software Engineer", department: "Engineering", jobExperience: "3 Years", maritalStatus: "Single", candidatePhone: "+91 98765 43210", actualDate: "2024-04-10" },
  { id: "JOIN-102", candidateEnquiryNo: "ENQ-7002", candidateName: "Neha Sharma", applyingForPost: "HR Manager", department: "HR", jobExperience: "5 Years", maritalStatus: "Married", candidatePhone: "+91 98765 12345", actualDate: "2024-04-12" },
  { id: "JOIN-103", candidateEnquiryNo: "ENQ-7003", candidateName: "Sonal Mehta", applyingForPost: "Sales Executive", department: "Sales", jobExperience: "2 Years", maritalStatus: "Single", candidatePhone: "+91 90000 88888", actualDate: "2024-04-15" },
  { id: "JOIN-104", candidateEnquiryNo: "ENQ-7004", candidateName: "Vikram Singh", applyingForPost: "Accountant", department: "Finance", jobExperience: "4 Years", maritalStatus: "Married", candidatePhone: "+91 91111 22222", actualDate: "2024-04-18" },
  { id: "JOIN-105", candidateEnquiryNo: "ENQ-7005", candidateName: "Anjali Desai", applyingForPost: "Project Manager", department: "Operations", jobExperience: "6 Years", maritalStatus: "Single", candidatePhone: "+91 92222 33333", actualDate: "2024-04-20" },
  { id: "JOIN-106", candidateEnquiryNo: "ENQ-7006", candidateName: "Rohan Gupta", applyingForPost: "Creative Director", department: "Marketing", jobExperience: "7 Years", maritalStatus: "Married", candidatePhone: "+91 93333 44444", actualDate: "2024-04-22" },
  { id: "JOIN-107", candidateEnquiryNo: "ENQ-7007", candidateName: "Priya Nair", applyingForPost: "Backend Developer", department: "Engineering", jobExperience: "4 Years", maritalStatus: "Single", candidatePhone: "+91 94444 55555", actualDate: "2024-04-25" },
  { id: "JOIN-108", candidateEnquiryNo: "ENQ-7008", candidateName: "Sandeep Roy", applyingForPost: "Recruitment Lead", department: "HR", jobExperience: "8 Years", maritalStatus: "Married", candidatePhone: "+91 95555 66666", actualDate: "2024-04-28" }
];

const Joining = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showJoiningModal, setShowJoiningModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [joiningData, setJoiningData] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination states (Synced with Indent.jsx style)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const [shareFormData, setShareFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    subject: 'Candidate Joining Details',
    message: '',
  });

  // Removed live API constants for offline demo

  const [joiningFormData, setJoiningFormData] = useState({
    nameAsPerAadhar: '',
    fatherHusbandName: '',
    dateOfJoining: '',
    designation: '',
    currentAddress: '',
    dobAsPerAadhar: '',
    gender: '',
    mobileNo: '',
    familyMobileNo: '',
    relationshipWithFamily: '',
    currentBankAc: '',
    ifscCode: '',
    branchName: '',
    personalEmail: '',
    highestQualification: '',
    department: '',
    equipment: '',
    relationshipWithFamily: '',
    aadharCardNo: '',
    aadharFrontPhoto: null,
    candidatePhoto: null,
    bankPassbookPhoto: null,
    resumeCopy: '',
  });

  const fetchJoiningData = () => {
    setLoading(true);
    setTableLoading(true);
    // Simulate short delay
    setTimeout(() => {
      setJoiningData(DUMMY_JOINING_DATA);
      setLoading(false);
      setTableLoading(false);
    }, 400);
  };

  useEffect(() => { fetchJoiningData(); }, []);

  const filteredData = joiningData.filter(item => {
    const matchesSearch = !searchTerm ||
      item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applyingForPost?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidateEnquiryNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDepartment || item.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = [...new Set(joiningData.map(item => item.department).filter(Boolean))].sort();

  // Pagination Logic (Manual)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationNav = () => (
    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px w-full justify-center sm:w-auto" aria-label="Pagination">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
        <span className="sr-only">Previous</span>
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" /></svg>
      </button>

      {[...Array(Math.max(1, totalPages))].map((_, i) => {
        const pageNum = i + 1;
        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
          return (
            <button key={pageNum} onClick={() => paginate(pageNum)} className={`relative inline-flex items-center px-3 py-1 border text-xs font-black tracking-widest ${currentPage === pageNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50'}`}>
              {pageNum}
            </button>
          );
        } else if ((pageNum === currentPage - 2 && pageNum > 1) || (pageNum === currentPage + 2 && pageNum < totalPages)) {
          return <span key={pageNum} className="relative inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-xs text-gray-400">...</span>;
        }
        return null;
      })}

      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors">
        <span className="sr-only">Next</span>
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
      </button>
    </nav>
  );

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const uploadFileToGoogleDrive = async (file, type, candidateId) => {
    // Simulated upload - returning local object URL for preview
    return URL.createObjectURL(file);
  };

  const generateJoiningId = () => {
    const existing = joiningData;
    let maxNum = 0;
    existing.forEach(item => {
      const match = item.indentNo?.match(/SDII-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `SDII-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const handleJoiningSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Simulate network delay
    setTimeout(async () => {
      try {
        const joiningId = generateJoiningId();
        const timestamp = new Date().toLocaleString();

        let aadharPhotoUrl = '';
        let candidatePhotoUrl = selectedItem?.candidatePhoto || '';
        let bankPassbookUrl = '';
        let resumeUrl = selectedItem?.candidateResume || '';

        if (joiningFormData.aadharFrontPhoto) {
          aadharPhotoUrl = await uploadFileToGoogleDrive(joiningFormData.aadharFrontPhoto, 'aadhar', joiningId);
        }
        if (joiningFormData.candidatePhoto) {
          candidatePhotoUrl = await uploadFileToGoogleDrive(joiningFormData.candidatePhoto, 'photo', joiningId);
        }
        if (joiningFormData.bankPassbookPhoto) {
          bankPassbookUrl = await uploadFileToGoogleDrive(joiningFormData.bankPassbookPhoto, 'passbook', joiningId);
        }

        const newJoiningRecord = {
          id: joiningId,
          candidateEnquiryNo: selectedItem?.candidateEnquiryNo || 'N/A',
          candidateName: joiningFormData.nameAsPerAadhar || selectedItem?.candidateName,
          applyingForPost: joiningFormData.designation || selectedItem?.applyingForPost,
          department: joiningFormData.department || selectedItem?.department,
          actualDate: joiningFormData.dateOfJoining,
          timestamp: timestamp,
          aadharPhoto: aadharPhotoUrl,
          candidatePhoto: candidatePhotoUrl,
          bankPassbook: bankPassbookUrl,
          resume: resumeUrl
        };

        // In a real app we would update the backend. Here we update local state (simulated)
        // SincejoiningData is initialized from DUMMY_JOINING_DATA every time, we just toast success
        toast.success(`${newJoiningRecord.candidateName} registered successfully!`);
        setShowJoiningModal(false);
        setSubmitting(false);

        // Reset form
        setJoiningFormData({
          nameAsPerAadhar: '',
          fatherHusbandName: '',
          dateOfJoining: '',
          designation: '',
          currentAddress: '',
          dobAsPerAadhar: '',
          gender: '',
          mobileNo: '',
          familyMobileNo: '',
          relationshipWithFamily: '',
          currentBankAc: '',
          ifscCode: '',
          branchName: '',
          personalEmail: '',
          highestQualification: '',
          department: '',
          equipment: '',
          aadharCardNo: '',
          aadharFrontPhoto: null,
          candidatePhoto: null,
          bankPassbookPhoto: null,
          resumeCopy: '',
        });

      } catch (error) {
        console.error('Submit error:', error);
        toast.error(`Registration Failed: ${error.message}`);
        setSubmitting(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-3 md:pb-4 mb-4 font-outfit">
      
      {/* 🚀 Simple Unified Toolbar - Synced with Indent.jsx/Employee.jsx */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-4">
          <h1 className="hidden md:block text-2xl font-black text-gray-800 tracking-tight">Onboarding</h1>
          <div className="bg-indigo-600 px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-100 flex items-center gap-2">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{filteredData.length} JOINING PENDING</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Quick search candidates..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-xs sm:text-sm shadow-sm font-medium uppercase"
            />
          </div>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full sm:w-auto">
            {/* Department Filter (Custom Dropdown) */}
            <div className="relative">
              <div
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className="flex items-center gap-2 h-9 px-3 border border-gray-300 rounded bg-white text-xs text-gray-700 cursor-pointer hover:border-indigo-500 transition shadow-sm relative overflow-hidden"
              >
                <Layout size={12} className="text-gray-400 shrink-0" />
                <span className="truncate font-black uppercase text-[10px]">{filterDepartment || "All Units"}</span>
                <ChevronDown size={14} className={`ml-auto text-gray-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDeptDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDeptDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto ring-1 ring-black ring-opacity-5">
                    <div
                      onClick={() => { setFilterDepartment(''); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                      className={`px-3 py-2 text-[10px] font-black uppercase cursor-pointer hover:bg-gray-50 flex items-center justify-between ${!filterDepartment ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'}`}
                    >
                      All Units
                    </div>
                    {uniqueDepartments.map((dept, index) => (
                      <div
                        key={index}
                        onClick={() => { setFilterDepartment(dept); setIsDeptDropdownOpen(false); setCurrentPage(1); }}
                        className={`px-3 py-2 text-[10px] font-black uppercase cursor-pointer hover:bg-gray-50 flex items-center justify-between ${filterDepartment === dept ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'}`}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Date Picker Filter */}
            <div className="relative">
              <div className="flex items-center gap-2 h-9 px-3 border border-gray-300 rounded bg-white text-xs text-gray-700 relative shadow-sm">
                <Calendar size={12} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent focus:outline-none text-[10px] font-black cursor-pointer uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Simplified Table Container - Synced with Indent.jsx/Employee.jsx */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white min-h-[530px] flex flex-col shadow-sm">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingSpinner message="Retrieving onboarding pipeline..." minHeight="450px" />
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col">
              {/* Desktop Table View (Simplified Columns) */}
              <div className="hidden md:flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm flex-1">
                <div className="max-h-[calc(105vh-280px)] min-h-[530px] overflow-auto scrollbar-hide">
                  <table className="w-max min-w-full divide-y divide-gray-200 text-left">
                    <thead className="bg-gray-50 sticky top-0 z-20">
                      <tr>
                        <th className="px-6 py-3.5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap sticky left-0 z-30 bg-gray-50 shadow-sm border-r border-gray-200">Enquiry No</th>
                        <th className="px-6 py-3.5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Full Name</th>
                        <th className="px-6 py-3.5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Applying For</th>
                        <th className="px-6 py-3.5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Unit/Dept</th>
                        <th className="px-6 py-3.5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Ex. Salary</th>
                        <th className="px-6 py-3.5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Phone</th>
                        <th className="px-6 py-3.5 text-center text-[10px] font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap bg-indigo-50/30">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="15" className="px-4 py-32 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Pipeline Empty.</td>
                        </tr>
                      ) : (
                        currentItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-all group">
                            <td className="px-6 py-4 whitespace-nowrap sticky left-0 z-10 bg-white/95 backdrop-blur group-hover:bg-gray-50/95 border-r border-gray-100 shadow-sm text-center">
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">#{item.candidateEnquiryNo}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-black text-gray-800 uppercase italic">
                              {item.candidateName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-gray-600 uppercase">
                              {item.applyingForPost}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                              {item.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-emerald-600">
                              ₹{item.lastSalary || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-gray-700 italic tracking-tight">
                              {item.candidatePhone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center bg-indigo-50/10">
                              <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <button
                                  onClick={() => { setSelectedItem(item); setShowJoiningModal(true); }}
                                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
                                >
                                  Register Join
                                </button>
                                <button
                                  onClick={() => { setSelectedItem(item); setShowShareModal(true); }}
                                  className="p-2 border border-slate-200 text-slate-400 hover:bg-white hover:text-emerald-600 rounded-lg transition-all shadow-sm bg-white"
                                  title="Share Onboarding"
                                >
                                  <Share size={14} strokeWidth={3} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card Layout - Synced with Employee.jsx Refined Cards */}
              <div className="md:hidden flex flex-col h-[calc(100vh-230px)] bg-gray-50">
                <div className="flex-1 p-2.5 space-y-3 overflow-y-auto scrollbar-hide">
                  {currentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-500 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-200 rounded-xl">Empty.</div>
                  ) : (
                    currentItems.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-3 relative overflow-hidden group active:border-indigo-200 transition-all">
                        <div className="flex justify-between items-center bg-gray-50/80 -mx-3 -mt-3 p-2.5 px-3 border-b border-gray-100 mb-0.5">
                          <div className="flex items-center gap-2">
                             <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                             <span className="font-black text-indigo-600 text-[10px] tracking-tighter uppercase">#{item.candidateEnquiryNo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => { setSelectedItem(item); setShowShareModal(true); }} className="p-1.5 text-gray-400 active:text-emerald-600"><Share size={12} /></button>
                             <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{item.department}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-gray-800 text-sm tracking-tight leading-none uppercase italic">{item.candidateName}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1.5">Apply: {item.applyingForPost}</p>
                          </div>
                          <button onClick={() => { setSelectedItem(item); setShowJoiningModal(true); }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">JOIN</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-gray-200 bg-white p-2.5 flex justify-center sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                  {renderPaginationNav()}
                </div>
              </div>
            </div>

            {/* Desktop Pagination Detail Footer */}
            <div className="hidden md:flex px-4 py-2 bg-white border-t border-gray-200 items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest">
                  Showing <span className="text-gray-900">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-gray-900">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="text-gray-900">{filteredData.length}</span> candidates
                </p>
                <div className="flex items-center gap-2 border-l border-gray-300 pl-4 h-5">
                  <label className="text-[10px] text-gray-400 font-black uppercase whitespace-nowrap">Page Size:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="text-[10px] border border-gray-200 rounded-md px-2 py-0.5 focus:border-indigo-500 bg-white font-black text-gray-700 outline-none transition"
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

      {/* 📋 Joining Registration Modal - FIXED & COMPACT UI */}
      {showJoiningModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] animate-in zoom-in duration-300 overflow-hidden border border-slate-100 flex flex-col">
              
              {/* Modal Header (Compact) */}
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                    <CheckCircle size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-800 tracking-tight uppercase italic">Joining Registration</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-0.5 opacity-60">Enquiry #{selectedItem.candidateEnquiryNo} • Compact UI</p>
                  </div>
                </div>
                <button onClick={() => setShowJoiningModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-rose-500 group active:scale-90">
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Form Content (Reduced Gaps) */}
              <form onSubmit={handleJoiningSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 1. Identity & Personal */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                         <User size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">1. Identity Verification</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Name As Per Aadhar *</label>
                          <input type="text" required placeholder="Full Name" value={joiningFormData.nameAsPerAadhar || selectedItem.candidateName} onChange={(e) => setJoiningFormData({...joiningFormData, nameAsPerAadhar: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Father / Husband Name *</label>
                          <input type="text" required placeholder="Parent/Spouse Name" value={joiningFormData.fatherHusbandName} onChange={(e) => setJoiningFormData({...joiningFormData, fatherHusbandName: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">DOB (Aadhar)</label>
                             <input type="text" value={joiningFormData.dobAsPerAadhar || selectedItem.candidateDOB} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 outline-none uppercase" readOnly />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Gender *</label>
                             <select required value={joiningFormData.gender} onChange={(e) => setJoiningFormData({...joiningFormData, gender: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase cursor-pointer">
                                <option value="">Select</option>
                                <option>Male</option>
                                <option>Female</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Relation With Family *</label>
                          <select required value={joiningFormData.relationshipWithFamily} onChange={(e) => setJoiningFormData({...joiningFormData, relationshipWithFamily: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase cursor-pointer">
                             <option value="">Select Relation</option>
                             <option>Father</option>
                             <option>Mother</option>
                             <option>Spouse</option>
                             <option>Brother/Sister</option>
                          </select>
                       </div>
                    </div>
                  </div>

                  {/* 2. Contact & Professional */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                         <Briefcase size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">2. Employment Details</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Official DOJ *</label>
                             <input type="date" required value={joiningFormData.dateOfJoining} onChange={(e) => setJoiningFormData({...joiningFormData, dateOfJoining: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase cursor-pointer" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Designation *</label>
                             <input type="text" required placeholder="Enter Official Role" value={joiningFormData.designation} onChange={(e) => setJoiningFormData({...joiningFormData, designation: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase placeholder:font-medium placeholder:uppercase" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Unit / Department *</label>
                          <select required value={joiningFormData.department} onChange={(e) => setJoiningFormData({...joiningFormData, department: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none uppercase cursor-pointer">
                             <option value="">Select Department</option>
                             {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Highest Qualification *</label>
                          <input type="text" required placeholder="Ex: MBA" value={joiningFormData.highestQualification} onChange={(e) => setJoiningFormData({...joiningFormData, highestQualification: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
                       </div>
                    </div>
                  </div>

                  {/* 3. KYC & Finance */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                         <Landmark size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">3. KYC & Bank</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Aadhar Number</label>
                          <input type="text" value={joiningFormData.aadharCardNo || selectedItem.aadharNo} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black tracking-widest text-gray-500 outline-none uppercase" readOnly />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Bank Account No</label>
                          <input type="text" placeholder="0000 0000 0000" value={joiningFormData.currentBankAc} onChange={(e) => setJoiningFormData({...joiningFormData, currentBankAc: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest" />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">IFSC Code</label>
                             <input type="text" placeholder="EX: SBIN000" value={joiningFormData.ifscCode} onChange={(e) => setJoiningFormData({...joiningFormData, ifscCode: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest uppercase" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-0.5 opacity-70">Branch Name</label>
                             <input type="text" placeholder="Location" value={joiningFormData.branchName} onChange={(e) => setJoiningFormData({...joiningFormData, branchName: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* 4. Document Verification */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                         <MapPin size={14} strokeWidth={2.5} />
                       </div>
                       <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">4. Documents</h4>
                    </div>
                    <div className="space-y-3 px-1">
                       <div className="grid grid-cols-1 gap-2">
                          <label className="group h-12 border border-dashed border-gray-200 rounded-xl flex items-center px-4 hover:border-indigo-400 transition-all cursor-pointer bg-gray-50/30 overflow-hidden">
                             <Upload size={14} className="text-gray-400 shrink-0 mr-3 group-hover:text-indigo-500" />
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">{joiningFormData.aadharFrontPhoto?.name || 'Aadhar Photo'}</span>
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => setJoiningFormData({...joiningFormData, aadharFrontPhoto: e.target.files[0]})} />
                          </label>
                          <label className="group h-12 border border-dashed border-gray-200 rounded-xl flex items-center px-4 hover:border-indigo-400 transition-all cursor-pointer bg-gray-50/30 overflow-hidden">
                             <Upload size={14} className="text-gray-400 shrink-0 mr-3 group-hover:text-indigo-500" />
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">{joiningFormData.candidatePhoto?.name || 'Profile Photo'}</span>
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => setJoiningFormData({...joiningFormData, candidatePhoto: e.target.files[0]})} />
                          </label>
                          <label className="group h-12 border border-dashed border-gray-200 rounded-xl flex items-center px-4 hover:border-indigo-400 transition-all cursor-pointer bg-gray-50/30 overflow-hidden">
                             <Upload size={14} className="text-gray-400 shrink-0 mr-3 group-hover:text-indigo-500" />
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">{joiningFormData.bankPassbookPhoto?.name || 'Bank Passbook'}</span>
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => setJoiningFormData({...joiningFormData, bankPassbookPhoto: e.target.files[0]})} />
                          </label>
                       </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer (Compact & Locked) */}
                <div className="mt-6 flex justify-end gap-2 pb-2 sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t border-slate-100 z-10">
                    <button type="button" onClick={() => setShowJoiningModal(false)} className="px-6 py-2 text-[9px] font-black text-gray-400 hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest border border-gray-100">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-10 py-2 bg-indigo-600 text-white text-[9px] font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center min-w-[200px]">
                       {submitting ? 'Processing...' : 'Complete Joining Registry'}
                    </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* 📧 Share Onboarding Modal */}
       {showShareModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md animate-in zoom-in duration-300 border border-slate-100">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100">
                  <Mail className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-800 tracking-tight uppercase italic">Share Gateway</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-1.5 px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Candidate Identity</label>
                  <p className="text-sm font-black text-gray-800 italic uppercase">{selectedItem.candidateName}</p>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Email</label>
                  <input type="email" value={selectedItem.candidateEmail} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 outline-none" readOnly />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Welcome Message</label>
                  <textarea rows={4} defaultValue={`Welcome to the team! Please use the link to complete your joining registration.`} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
               </div>
            </div>

            <div className="p-8 pt-4 flex justify-end gap-3">
              <button onClick={() => setShowShareModal(false)} className="px-6 py-3 text-[10px] font-black text-gray-400 hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest">Discard</button>
              <button className="px-10 py-3 bg-emerald-500 rounded-xl text-[10px] font-black text-white hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest">Send Invite</button>
            </div>
          </div>
        </div>
       )}

    </div>
  );
};

export default Joining;