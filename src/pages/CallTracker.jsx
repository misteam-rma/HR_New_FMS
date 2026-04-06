import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import DataTable from '../components/DataTable/DataTable';
import TableFilters from '../components/DataTable/TableFilters';
import TableTabs from '../components/DataTable/TableTabs';

const CallTracker = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [followUpData, setFollowUpData] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    candidateSays: '',
    status: '',
    nextDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [enquiryData, setEnquiryData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);

  // New filtering and pagination states (Synced with FindEnquiry.jsx)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fetchEnquiryData = () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);

    // Simulate delay
    setTimeout(() => {
      const mockEnquiries = [
        { 
          id: Date.now(), indentNo: "REC-01", candidateEnquiryNo: "ENQ-101", 
          applyingForPost: "Software Engineer", department: "Engineering", 
          candidateName: "Rahul Sharma", candidateSays: "Interested in the role", 
          trackerStatus: "Follow-up", nextCallDate: "2024-05-15", 
          candidateDOB: "15/06/1995", candidatePhone: "9876543210", 
          candidateEmail: "rahul@example.com", previousCompany: "Tech Solutions", 
          jobExperience: "2 Years", lastSalary: "40,000", previousPosition: "Junior Developer", 
          reasonForLeaving: "Better growth", maritalStatus: "Single", 
          lastEmployerMobile: "9000000000", candidatePhoto: "", candidateResume: "", 
          referenceBy: "Direct", presentAddress: "New Delhi", aadharNo: "1234-5678-9012"
        },
        { 
          id: Date.now() + 1, indentNo: "REC-02", candidateEnquiryNo: "ENQ-102", 
          applyingForPost: "HR Manager", department: "HR", 
          candidateName: "Priya Patel", candidateSays: "Ready for interview", 
          trackerStatus: "Interview", nextCallDate: "2024-05-10", 
          candidateDOB: "20/08/1992", candidatePhone: "9876543211", 
          candidateEmail: "priya@example.com", previousCompany: "Global Corp", 
          jobExperience: "5 Years", lastSalary: "60,000", previousPosition: "Assistant Manager", 
          reasonForLeaving: "Relocation", maritalStatus: "Married", 
          lastEmployerMobile: "9111111111", candidatePhoto: "", candidateResume: "", 
          referenceBy: "LinkedIn", presentAddress: "Mumbai", aadharNo: "2345-6789-0123"
        }
      ];
      setEnquiryData(mockEnquiries);
      setLoading(false);
      setTableLoading(false);
    }, 600);
  };

  const fetchFollowUpData = () => {
    setLoading(true);
    setTableLoading(true);
    setError(null);

    // Simulate delay
    setTimeout(() => {
      const mockHistory = [
        { timestamp: "01/05/2024 10:00:00", enquiryNo: "ENQ-101", status: "Follow-up", candidateSays: "Asked to call back in a week", nextDate: "08/05/2024" },
        { timestamp: "02/05/2024 11:30:00", enquiryNo: "ENQ-102", status: "Interview", candidateSays: "Interview scheduled for tomorrow", nextDate: "03/05/2024" }
      ];
      setHistoryData(mockHistory);
      setLoading(false);
      setTableLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchEnquiryData();
    fetchFollowUpData();
  }, []);

  const pendingData = enquiryData.filter(item => {
    const hasFinalStatus = followUpData.some(followUp =>
      followUp.enquiryNo === item.candidateEnquiryNo &&
      (followUp.status === 'Joining' || followUp.status === 'Reject')
    );
    return !hasFinalStatus;
  });

  const handleCallClick = (item) => {
    setSelectedItem(item);
    setFormData({
      candidateSays: '',
      status: '',
      nextDate: ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // postToSheet and updateEnquirySheet removed for offline demo

  // utils/dateFormatter.js
  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const formatDOB = (dateString) => {
    if (!dateString) return '';

    // Handle different date formats that might come from the input
    let date;

    // If it's already a Date object
    if (dateString instanceof Date) {
      date = dateString;
    }
    // If it's in the format "1/11/2021" (mm/dd/yyyy or dd/mm/yyyy)
    else if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        if (parseInt(parts[0]) > 12) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          date = new Date(parts[2], parts[0] - 1, parts[1]);
        }
      }
    }
    else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.candidateSays || !formData.status) {
      toast.error('Please fill all required fields');
      setSubmitting(false);
      return;
    }

    // Simulate update
    setTimeout(() => {
      const now = new Date();
      const formattedTimestamp = now.toLocaleString();

      const newHistoryItem = {
        timestamp: formattedTimestamp,
        enquiryNo: selectedItem.candidateEnquiryNo,
        status: formData.status,
        candidateSays: formData.candidateSays,
        nextDate: formData.nextDate || '',
      };

      setHistoryData(prev => [newHistoryItem, ...prev]);
      
      if (formData.status === 'Joining' || formData.status === 'Reject') {
        setEnquiryData(prev => prev.filter(item => item.candidateEnquiryNo !== selectedItem.candidateEnquiryNo));
      }

      toast.success('Update successful!');
      setShowModal(false);
      setSubmitting(false);
    }, 1000);
  };

  const filteredPendingData = pendingData.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm ||
      item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidateEnquiryNo?.toLowerCase().includes(searchTerm.toLowerCase());

    // Department filter
    const matchesDept = !filterDepartment || item.department === filterDepartment;

    // Date filter
    let matchesDate = true;
    if (filterDate && item.id) { // id stores Timestamp Column A
      try {
        const itemDate = new Date(item.id);
        const searchDate = new Date(filterDate);
        matchesDate = itemDate.getFullYear() === searchDate.getFullYear() &&
          itemDate.getMonth() === searchDate.getMonth() &&
          itemDate.getDate() === searchDate.getDate();
      } catch (e) {
        matchesDate = true;
      }
    }

    return matchesSearch && matchesDept && matchesDate;
  });

  const filteredHistoryData = historyData.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm ||
      item.enquiryNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.candidateSays?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter (History uses item.timestamp or item.timestamp from Column A)
    let matchesDate = true;
    if (filterDate && item.timestamp) {
      try {
        // Handle dd/mm/yyyy hh:mm:ss format seen in History
        const [dPart] = item.timestamp.split(' ');
        const [d, m, y] = dPart.split('/');
        const itemDate = new Date(`${y}-${m}-${d}`);
        const searchDate = new Date(filterDate);
        matchesDate = itemDate.getFullYear() === searchDate.getFullYear() &&
          itemDate.getMonth() === searchDate.getMonth() &&
          itemDate.getDate() === searchDate.getDate();
      } catch (e) {
        matchesDate = true;
      }
    }

    return matchesSearch && matchesDate;
  });

  // Unique departments for filter
  const uniqueDepartments = [...new Set(enquiryData.map(item => item.department).filter(Boolean))].sort();

  // Unified Pagination logic
  const activeData = activeTab === "pending" ? filteredPendingData : filteredHistoryData;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeData.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };  // Pagination navigation renderer matching Indent.jsx
  const pendingColumns = [
    { 
      header: "Action", 
      accessor: (item) => (
        <button
          onClick={() => handleCallClick(item)}
          className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
        >
          Call
        </button>
      )
    },
    { header: "Indent Number", accessor: "indentNo" },
    { header: "Candidate Enquiry Number", accessor: "candidateEnquiryNo" },
    { header: "Applying For the Post", accessor: "applyingForPost" },
    { header: "Candidate Name", accessor: "candidateName" },
    { 
      header: "What Did The Candidate Says", 
      accessor: (item) => (
        <div className="max-w-[200px] truncate" title={item.candidateSays}>
          {item.candidateSays || "-"}
        </div>
      )
    },
    { header: "Tracker Status", accessor: "trackerStatus" },
    { 
      header: "Next Call Date", 
      accessor: (item) => item.nextCallDate ? new Date(item.nextCallDate).toLocaleDateString() : "-" 
    },
    { header: "DOB", accessor: "candidateDOB" },
    { header: "Candidate Phone Number", accessor: "candidatePhone" },
    { header: "Candidate Email", accessor: "candidateEmail" },
    { header: "Previous Company Name", accessor: "previousCompany" },
    { header: "Job Experience", accessor: "jobExperience" },
    { header: "Department", accessor: "department" },
    { header: "Previous Position", accessor: "previousPosition" },
    { 
      header: "Reason Of Leaving", 
      accessor: (item) => (
        <div className="max-w-[150px] truncate" title={item.reasonForLeaving}>
          {item.reasonForLeaving}
        </div>
      )
    },
    { header: "Marital Status", accessor: "maritalStatus" },
    { header: "Last Salary Drawn", accessor: "lastSalary" },
    { 
      header: "Candidate Photo", 
      accessor: (item) => item.candidatePhoto ? (
        <a href={item.candidatePhoto} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 text-sm font-bold">View</a>
      ) : "—"
    },
    { header: "Reference By", accessor: "referenceBy" },
    { 
      header: "Present Address", 
      accessor: (item) => (
        <div className="max-w-[200px] truncate" title={item.presentAddress}>
          {item.presentAddress}
        </div>
      )
    },
    { header: "Aadhar Number", accessor: "aadharNo" },
    { 
      header: "Resume Copy", 
      accessor: (item) => item.candidateResume ? (
        <a href={item.candidateResume} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 text-sm font-bold">View</a>
      ) : "—"
    },
  ];

  const historyColumns = [
    { header: "Enq No.", accessor: "enquiryNo" },
    { 
      header: "Status", 
      accessor: (item) => (
        <span
          className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold uppercase tracking-wider rounded-full ${
            item.status === "Joining" ? "bg-green-100 text-green-800" : 
            item.status === "Reject" ? "bg-red-100 text-red-800" : 
            "bg-indigo-100 text-indigo-800"
          }`}
        >
          {item.status}
        </span>
      )
    },
    { 
      header: "Candidate Response", 
      accessor: (item) => (
        <div className="max-w-sm truncate text-left" title={item.candidateSays}>
          {item.candidateSays}
        </div>
      ),
      align: 'left'
    },
    { header: "Next Action", accessor: (item) => item.nextDate || "-" },
    { header: "Timestamp", accessor: (item) => item.timestamp || "-" },
  ];

  const renderMobileCard = (item) => (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600 text-sm">#{item.candidateEnquiryNo || item.enquiryNo}</span>
          {item.department && <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full text-indigo-600 font-bold uppercase tracking-wider">{item.department}</span>}
        </div>
        {activeTab === "pending" && (
          <button
            onClick={() => handleCallClick(item)}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform"
          >
            Call
          </button>
        )}
      </div>

      <div>
        <div className="text-sm font-bold text-slate-800 tracking-tight">{item.candidateName || "Candidate Enquiry"}</div>
        {activeTab === "pending" && <div className="text-xs text-slate-500 mt-0.5"><span className="text-slate-400 font-bold">Post:</span> {item.applyingForPost}</div>}
        {activeTab === "history" && <div className="mt-1 flex items-center gap-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
           <span className={`text-[10px] font-bold uppercase ${item.status === 'Joining' ? 'text-emerald-600' : item.status === 'Reject' ? 'text-rose-600' : 'text-indigo-600'}`}>{item.status}</span>
        </div>}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-50">
        <div>
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
            {activeTab === 'pending' ? 'Phone' : 'Timestamp'}
          </span>
          <span className="font-bold text-slate-700">{activeTab === 'pending' ? item.candidatePhone : item.timestamp}</span>
        </div>
        <div>
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
            {activeTab === 'pending' ? 'Experience' : 'Next Action'}
          </span>
          <span className="font-bold text-slate-700">{activeTab === 'pending' ? (item.jobExperience || "Fresher") : (item.nextDate || "-")}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:pb-4 mb-4">
      {/* Main Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Call Tracker</h1>
           
           <TableTabs 
             activeTab={activeTab}
             onTabChange={(id) => { setActiveTab(id); setCurrentPage(1); }}
             tabs={[
               { id: 'pending', label: `Pending`, count: filteredPendingData.length, icon: <Clock /> },
               { id: 'history', label: `History`, count: filteredHistoryData.length, icon: <History /> }
             ]}
           />
        </div>

        <TableFilters 
          searchTerm={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          searchPlaceholder="Search by name, ID or response..."
          filters={[
            ...(activeTab === 'pending' ? [{
              label: "All Departments",
              type: 'select',
              value: filterDepartment,
              options: uniqueDepartments.map(d => ({ label: d, value: d })),
              onSelect: (val) => { setFilterDepartment(val); setCurrentPage(1); }
            }] : []),
            {
              label: "Filter Date",
              type: 'date',
              value: filterDate,
              onSelect: (val) => { setFilterDate(val); setCurrentPage(1); }
            }
          ]}
        />
      </div>

      <DataTable 
        columns={activeTab === 'pending' ? pendingColumns : historyColumns}
        data={currentItems}
        loading={loading}
        error={error}
        onRetry={fetchEnquiryData}
        emptyMessage={activeTab === 'pending' ? "No pending calls found." : "No history recorded."}
        renderMobileCard={renderMobileCard}
        pagination={{
          currentPage,
          itemsPerPage,
          totalItems: activeData.length,
          onPageChange: paginate,
          onItemsPerPageChange: (val) => { setItemsPerPage(val); setCurrentPage(1); }
        }}
      />

      {/* Call Modal - Ultra-Compact Redesign */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Process Call</h3>
                <p className="text-xs text-gray-500 mt-0.5">Enquiry: {selectedItem.candidateEnquiryNo}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50/50 p-2 rounded-md border border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5">Candidate</label>
                  <div className="text-xs font-bold text-indigo-600 truncate">{selectedItem.candidateName}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5">Status*</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Follow-up">Follow-up </option>
                    <option value="Interview">Interview</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Joining">Joining</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                  {formData.status === "Negotiation" ? "Customer Requirement*" :
                    formData.status === "On Hold" ? "Reason For Hold*" :
                      formData.status === "Joining" ? "Joining Commitment*" :
                        formData.status === "Reject" ? "Rejection Reason*" :
                          "Candidate Response*"}
                </label>
                <textarea
                  name="candidateSays"
                  value={formData.candidateSays}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                  placeholder="Enter details here..."
                  required
                />
              </div>

              {formData.status && !["Joining", "Reject"].includes(formData.status) && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                    {formData.status === "Interview" ? "Schedule Date*" : "Recall Date*"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                    <input
                      type="date"
                      name="nextDate"
                      value={formData.nextDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded pl-9 pr-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-xs text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </div>
                  ) : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallTracker;