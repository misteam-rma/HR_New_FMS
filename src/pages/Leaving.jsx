import React, { useState, useEffect } from 'react';
import { 
  Clock, History, Search, Filter, Calendar, ChevronDown, Check, 
  AlertCircle, ArrowRight, User, LogOut, X, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import DataTable from '../components/DataTable/DataTable';
import TableFilters from '../components/DataTable/TableFilters';
import TableTabs from '../components/DataTable/TableTabs';

const Leaving = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingData, setPendingData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    dateOfLeaving: '',
    mobileNumber: '',
    reasonOfLeaving: ''
  });

  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fetchJoiningData = () => {
    setLoading(true);
    // Simulate delay
    setTimeout(() => {
      const mockJoiningEntries = [
        { rowIndex: 7, employeeNo: "EMP-101", candidateName: "Rahul Sharma", fatherName: "S.P. Sharma", dateOfJoining: "15/01/2023", designation: "Frontend Developer", department: "Engineering", mobileNo: "9876543210", leavingDate: "" },
        { rowIndex: 8, employeeNo: "EMP-102", candidateName: "Priya Singh", fatherName: "R.K. Singh", dateOfJoining: "10/02/2023", designation: "HR Manager", department: "Human Resources", mobileNo: "9876543211", leavingDate: "" }
      ];
      setPendingData(mockJoiningEntries);
      setLoading(false);
    }, 600);
  };

  const fetchLeavingData = () => {
    // Simulate delay
    setTimeout(() => {
      const mockLeavingHistory = [
        { employeeId: "EMP-099", name: "Vikram Seth", dateOfLeaving: "20/03/2024", mobileNo: "9876543299", reasonOfLeaving: "Family relocation", firmName: "SBH", fatherName: "D. Seth", dateOfJoining: "01/01/2022", workingLocation: "Raipur", designation: "Accountant", department: "Finance" }
      ];
      setHistoryData(mockLeavingHistory);
    }, 600);
  };

  useEffect(() => { 
    fetchJoiningData(); 
    fetchLeavingData(); 
  }, []);

  const allDepartments = [
    ...new Set([
      ...pendingData.map(i => i.department),
      ...historyData.map(i => i.department)
    ])
  ].filter(Boolean).sort();

  const filterDataItems = (data) => {
    return data.filter(item => {
      const matchesSearch = 
        (item.candidateName || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.employeeNo || item.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = !filterDepartment || item.department === filterDepartment;
      const matchesDate = !filterDate || 
        (item.dateOfJoining && item.dateOfJoining.includes(filterDate)) ||
        (item.dateOfLeaving && item.dateOfLeaving.includes(filterDate));

      return matchesSearch && matchesDept && matchesDate;
    });
  };

  const filteredItems = filterDataItems(activeTab === 'pending' ? pendingData : historyData);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleLeavingClick = (item) => {
    setSelectedItem(item);
    setFormData({ dateOfLeaving: '', mobileNumber: item.mobileNo || '', reasonOfLeaving: '' });
    setShowModal(true);
  };

  const pendingColumns = [
    { 
      header: "Action", 
      accessor: (item) => (
        <button
          onClick={() => handleLeavingClick(item)}
          className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-rose-700 transition-all shadow-md active:scale-95 flex items-center gap-2 mx-auto"
        >
          Process Exit
          <ArrowRight size={10} />
        </button>
      )
    },
    { header: "Joining ID", accessor: "employeeNo", className: "font-semibold text-slate-700" },
    { header: "Candidate Name", accessor: "candidateName", className: "font-bold text-slate-800" },
    { header: "Father Name", accessor: "fatherName" },
    { header: "Date Of Joining", accessor: "dateOfJoining" },
    { 
      header: "Designation", 
      accessor: (item) => (
        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase">{item.designation}</span>
      )
    },
    { 
      header: "Department", 
      accessor: (item) => (
        <span className="font-bold text-slate-600 tracking-tight">{item.department}</span>
      )
    },
    { header: "Mobile No.", accessor: "mobileNo", className: "font-bold text-slate-700" },
  ];

  const historyColumns = [
    { header: "Emp ID", accessor: "employeeId", className: "font-semibold text-slate-700" },
    { header: "Candidate Name", accessor: "name", className: "font-bold text-slate-800" },
    { header: "Joining Date", accessor: "dateOfJoining" },
    { 
      header: "Leaving Date", 
      accessor: (item) => (
        <span className="text-rose-600 font-bold">{item.dateOfLeaving}</span>
      )
    },
    { header: "Position", accessor: "designation" },
    { header: "Department", accessor: "department" },
    { 
      header: "Reason", 
      accessor: (item) => (
        <div className="max-w-[200px] truncate italic text-slate-500" title={item.reasonOfLeaving}>
          "{item.reasonOfLeaving}"
        </div>
      )
    },
  ];

  const renderMobileCard = (item) => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600 text-sm">#{item.employeeNo || item.employeeId}</span>
          <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-indigo-600 font-bold uppercase tracking-wider">{item.department}</span>
        </div>
        {activeTab === 'pending' ? (
          <button
            onClick={() => handleLeavingClick(item)}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md active:scale-95"
          >
            Process Exit
          </button>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 uppercase tracking-widest">Exit Processed</span>
        )}
      </div>

      <div>
        <div className="text-sm font-bold text-slate-800 tracking-tight">{item.candidateName || item.name}</div>
        <div className="text-xs text-slate-500 mt-1">
          <span className="text-slate-400 font-bold">{item.designation}</span> 
          {activeTab === 'history' && <span className="ml-2 italic text-rose-500/70">Left on {item.dateOfLeaving}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-50">
        <div>
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
            {activeTab === 'pending' ? 'Joined' : 'Join Date'}
          </span>
          <span className="font-bold text-slate-700 text-xs">{item.dateOfJoining}</span>
        </div>
        <div className="text-right">
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Phone/ID</span>
          <span className="font-bold text-slate-700 text-xs">{item.mobileNo || item.employeeId}</span>
        </div>
      </div>
    </div>
  );

  const getCurrentTimestamp = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.dateOfLeaving || !formData.reasonOfLeaving) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      const newHistoryItem = {
        employeeId: selectedItem.employeeNo,
        name: selectedItem.candidateName,
        dateOfLeaving: formData.dateOfLeaving,
        mobileNo: selectedItem.mobileNo,
        reasonOfLeaving: formData.reasonOfLeaving,
        firmName: selectedItem.firmName || '',
        fatherName: selectedItem.fatherName || '',
        dateOfJoining: selectedItem.dateOfJoining || '',
        workingLocation: selectedItem.workingLocation || '',
        designation: selectedItem.designation || '',
        department: selectedItem.department || '',
      };

      setHistoryData(prev => [newHistoryItem, ...prev]);
      setPendingData(prev => prev.filter(item => item.employeeNo !== selectedItem.employeeNo));
      
      toast.success("Employee processed for exit successfully");
      setShowModal(false);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 md:pb-4 mb-4">
      {/* Main Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Off-boarding</h1>
           
           <TableTabs 
             activeTab={activeTab}
             onTabChange={(id) => { setActiveTab(id); setCurrentPage(1); }}
             tabs={[
               { id: 'pending', label: `Pending Exit`, count: pendingData.length, icon: <Clock /> },
               { id: 'history', label: `Exit History`, icon: <History /> }
             ]}
           />
        </div>

        <TableFilters 
          searchTerm={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          searchPlaceholder="Search by name, ID or post..."
          filters={[
            {
              label: "All Departments",
              type: 'select',
              value: filterDepartment,
              options: allDepartments.map(d => ({ label: d, value: d })),
              onSelect: (val) => { setFilterDepartment(val); setCurrentPage(1); }
            },
            {
              label: "Action Date",
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
        onRetry={fetchJoiningData}
        emptyMessage={activeTab === 'pending' ? "No pending exits found." : "No exit history recorded."}
        renderMobileCard={renderMobileCard}
        pagination={{
          currentPage,
          itemsPerPage,
          totalItems: filteredItems.length,
          onPageChange: (p) => { setCurrentPage(p); },
          onItemsPerPageChange: (val) => { setItemsPerPage(val); setCurrentPage(1); }
        }}
      />

      {/* Exit Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-rose-50/20">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle size={20} />
                <h3 className="text-base font-black text-gray-800 tracking-tight">Process Employee Exit</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm text-sm font-bold">
                  {selectedItem.employeeNo ? String(selectedItem.employeeNo).substring(0, 2) : "ID"}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-800 leading-none">{selectedItem.candidateName || selectedItem.name}</h4>
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">{selectedItem.employeeNo || selectedItem.employeeId}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Last Working Day *</label>
                  <div className="relative">
                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      required 
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-rose-50 focus:border-rose-500 outline-none transition-all uppercase"
                      value={formData.dateOfLeaving}
                      onChange={(e) => setFormData({...formData, dateOfLeaving: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Primary Reason *</label>
                  <div className="relative">
                    <AlertCircle size={13} className="absolute left-3 top-3 text-gray-400" />
                    <textarea 
                      required 
                      rows={3}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-rose-50 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-gray-300 placeholder:font-medium"
                      placeholder="e.g. Resigned for better opportunity..."
                      value={formData.reasonOfLeaving}
                      onChange={(e) => setFormData({...formData, reasonOfLeaving: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Complete Exit"}
                  {!submitting && <ArrowRight size={14} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaving;